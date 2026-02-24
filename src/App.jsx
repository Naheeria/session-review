import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Trash2, Save, Palette } from 'lucide-react';

const THEMES = {
  classic: {
    id: 'classic',
    name: '미색 (Classic)',
    bg: '#f5f5f0',
    text: 'text-gray-900',
    border: 'border-gray-800',
    accent: 'bg-gray-800 text-gray-100',
    accentDot: 'bg-gray-800'
  },
  dark: {
    id: 'dark',
    name: '심연 (Dark)',
    bg: '#1a1a1a',
    text: 'text-gray-200',
    border: 'border-gray-500',
    accent: 'bg-gray-700 text-gray-200',
    accentDot: 'bg-gray-400'
  },
  blood: {
    id: 'blood',
    name: '선혈 (Blood)',
    bg: '#2b1111',
    text: 'text-[#e6d5d5]',
    border: 'border-[#8a3333]',
    accent: 'bg-[#5c1c1c] text-[#e6d5d5]',
    accentDot: 'bg-[#cc3333]'
  },
  parchment: {
    id: 'parchment',
    name: '양피지 (Parchment)',
    bg: '#e8dcc4',
    text: 'text-[#4a3629]',
    border: 'border-[#7a6453]',
    accent: 'bg-[#5c4738] text-[#e8dcc4]',
    accentDot: 'bg-[#7a6453]'
  }
};

const DEFAULT_STATE = {
  scenarioName: '독이 든 수프',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  gmTitle: 'KEEPER',
  gm: '산치핀치',
  pl: '탐사자1, 탐사자2, 탐사자3',
  summary: '어느 날 눈을 떠보니, 낯선 방에 갇혀 있었다. 눈앞에는 정체불명의 새빨간 수프 한 그릇이 놓여 있을 뿐...',
  memorable: '초반 도입부부터 몰입감이 엄청났습니다. KP님의 묘사가 압권!',
  hidden: '준비해간 소품 활용을 제대로 못 한 것이 조금 아쉽습니다.',
  focus: '캐릭터의 광기 발작을 어떻게 롤플레잉할지 고민하며 플레이했습니다.',
  after: '다음 세션에서는 관찰력 판정을 더 적극적으로 해보고 싶습니다.',
  review: '한동안 수프를 먹지 못할 것 같습니다.',
  theme: 'classic',
  image: null,
};

export default function App() {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const savedData = localStorage.getItem('coc-session-data-v3');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('데이터를 불러오는 중 오류가 발생했습니다.', e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('coc-session-data-v3', JSON.stringify(formData));
    } catch (e) {
      // ESLint 경고 해결: 에러 객체 e를 console.warn에 포함하여 사용
      console.warn('저장 용량을 초과하여 자동 저장에 실패했을 수 있습니다.', e);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // 텍스트 쏠림 현상 방지를 위해 스크롤을 맨 위로 고정하고, 렌더링 옵션을 세밀하게 조정합니다.
      const canvas = await window.html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: THEMES[formData.theme].bg,
        scrollY: -window.scrollY, // 스크롤 오프셋 보정
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (document) => {
          // 복제된 DOM에서 약간의 여백 쏠림을 보정할 수 있습니다.
          const element = document.getElementById('session-card');
          if(element) {
             element.style.transform = 'none';
          }
        }
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `[TRPG]${formData.scenarioName}_세션리뷰.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('이미지 저장 중 오류 발생:', error);
      alert('이미지를 저장하는 데 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const resetData = () => {
    if (window.confirm('작성 중인 모든 내용을 초기화하시겠습니까?')) {
      setFormData(DEFAULT_STATE);
    }
  };

  const currentTheme = THEMES[formData.theme];
  const paperTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col md:flex-row font-sans">
      
      {/* 왼쪽 패널: 입력 폼 */}
      <div className="w-full md:w-1/3 lg:w-[450px] bg-gray-900 p-6 overflow-y-auto border-r border-gray-800 shadow-xl z-10 flex flex-col gap-6 custom-scrollbar">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h1 className="text-xl font-serif tracking-widest text-gray-100 flex items-center gap-2">
            <Save size={20} className="text-gray-400" />
            세션 기록실
          </h1>
          <button onClick={resetData} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <Trash2 size={16} />
            초기화
          </button>
        </div>

        <div className="space-y-5">
          {/* 테마 선택 */}
          <div className="space-y-2 bg-gray-800 p-3 rounded-md border border-gray-700">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Palette size={14} /> 카드 테마
            </label>
            <div className="flex gap-2">
              {Object.values(THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                  className={`flex-1 py-1 px-2 text-xs rounded transition-all ${formData.theme === theme.id ? 'ring-2 ring-indigo-500 bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">시나리오명</label>
            <input type="text" name="scenarioName" value={formData.scenarioName} onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none transition-all text-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">시작일</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none [color-scheme:dark] text-gray-200" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">종료일 (선택)</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none [color-scheme:dark] text-gray-200" />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">세션 카드 이미지 (가로형 추천)</label>
            {formData.image ? (
              <div className="relative w-full h-32 bg-gray-900 rounded border border-gray-700 flex items-center justify-center overflow-hidden group">
                <img src={formData.image} alt="Uploaded" className="object-cover w-full h-full opacity-70 group-hover:opacity-30 transition-opacity" />
                <button onClick={removeImage} className="absolute inset-0 m-auto w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={20} />
                </button>
              </div>
            ) : (
              <label className="w-full h-32 bg-gray-800 rounded border border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700 transition-colors">
                <Upload size={24} className="text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">클릭하여 이미지 업로드</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span>진행자 명칭</span>
                <select name="gmTitle" value={formData.gmTitle} onChange={handleChange} className="bg-transparent text-indigo-400 outline-none">
                  <option value="KEEPER">KEEPER</option>
                  <option value="MASTER">MASTER</option>
                </select>
              </label>
              <input type="text" name="gm" value={formData.gm} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none text-gray-200" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">PLAYER (콤마 구분)</label>
              <input type="text" name="pl" value={formData.pl} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none text-gray-200" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">시놉시스 (Synopsis)</label>
            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none resize-none text-gray-200" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Memorable (기억에 남는 점)</label>
            <textarea name="memorable" value={formData.memorable} onChange={handleChange} rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-emerald-500 outline-none resize-none text-gray-200" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-rose-400 font-bold uppercase tracking-wider">Hidden (보여주지 못한 점)</label>
            <textarea name="hidden" value={formData.hidden} onChange={handleChange} rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-rose-500 outline-none resize-none text-gray-200" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-blue-400 font-bold uppercase tracking-wider">Focus (신경 쓴 점)</label>
            <textarea name="focus" value={formData.focus} onChange={handleChange} rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-blue-500 outline-none resize-none text-gray-200" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-amber-400 font-bold uppercase tracking-wider">After (다음 번의 다짐)</label>
            <textarea name="after" value={formData.after} onChange={handleChange} rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-amber-500 outline-none resize-none text-gray-200" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-purple-400 font-bold uppercase tracking-wider">Review (한줄평)</label>
            <input type="text" name="review" value={formData.review} onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-purple-500 outline-none text-gray-200" />
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`mt-4 w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition-all ${isExporting ? 'bg-indigo-600/50 cursor-not-allowed text-gray-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'}`}
        >
          {isExporting ? (
             <span className="animate-pulse">기록을 남기는 중...</span>
          ) : (
            <>
              <Download size={20} />
              이미지로 저장하기
            </>
          )}
        </button>
      </div>

      {/* 오른쪽 패널: 실시간 프리뷰 */}
      <div className="w-full md:flex-1 p-4 md:p-8 flex items-center justify-center bg-[#0a0a0a] overflow-y-auto min-h-[500px] relative pattern-dots pattern-gray-800 pattern-size-4 pattern-opacity-40">
        
        {/* 내보내기 대상 영역 */}
        <div 
          id="session-card" 
          ref={cardRef}
          className={`w-full max-w-[800px] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 ${currentTheme.text}`}
          style={{ 
            backgroundColor: currentTheme.bg,
            backgroundImage: paperTexture,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            // 텍스트 쏠림 방지를 위해 line-height를 명시적으로 설정
            lineHeight: '1.6' 
          }}
        >
          {/* 장식선 */}
          <div className={`absolute inset-2 border ${currentTheme.border} opacity-50 pointer-events-none`}></div>
          <div className={`absolute inset-3 border ${currentTheme.border} opacity-30 pointer-events-none`}></div>
          
          <div className="p-8 md:p-12 z-10 w-full flex flex-col">
            
            {/* 1. 헤더 (타이틀 & 날짜) */}
            <header className={`text-center border-b-2 ${currentTheme.border} pb-6 mb-8`}>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-3">
                {formData.scenarioName || '시나리오명 미입력'}
              </h2>
              <p className="text-sm md:text-base font-serif italic opacity-80">
                Played on {formData.startDate || 'YYYY-MM-DD'} {formData.endDate ? `~ ${formData.endDate}` : ''}
              </p>
            </header>

            {/* 2. 세션 카드 이미지 (본문 최상단) */}
            {formData.image && (
              <div className={`w-full mb-8 border-2 ${currentTheme.border} p-2 bg-black/5`}>
                <img 
                  src={formData.image} 
                  alt="Session Card" 
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
            )}

            {/* 3. KP/PL 정보 */}
            <div className={`flex flex-col gap-5 justify-center items-center p-6 mb-8 ${currentTheme.accent} rounded-sm text-center`}>
              <div className="w-full">
                <div className="font-serif text-xs opacity-80 tracking-widest mb-1">{formData.gmTitle}</div>
                <div className="font-bold text-base leading-none">{formData.gm || '-'}</div>
              </div>
              <div className="w-12 h-px bg-current opacity-30"></div>
              <div className="w-full">
                <div className="font-serif text-xs opacity-80 tracking-widest mb-1">PLAYER</div>
                <div className="font-bold text-base leading-snug break-keep">{formData.pl || '-'}</div>
              </div>
            </div>

            {/* 4. 시놉시스 */}
            <div className="space-y-3 mb-8">
              <h3 className={`font-serif font-bold text-2xl border-b ${currentTheme.border} pb-2 inline-block`}>Synopsis</h3>
              <p className="leading-relaxed whitespace-pre-wrap text-base opacity-90">
                {formData.summary || '내용이 없습니다.'}
              </p>
            </div>

            {/* 5. 평가 영역 (2단 그리드) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {formData.memorable && (
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.accentDot}`}></span> Memorable
                  </h4>
                  <p className={`text-sm leading-relaxed pl-4 border-l-2 ${currentTheme.border} whitespace-pre-wrap opacity-90`}>
                    {formData.memorable}
                  </p>
                </div>
              )}
              {formData.hidden && (
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.accentDot}`}></span> Hidden
                  </h4>
                  <p className={`text-sm leading-relaxed pl-4 border-l-2 ${currentTheme.border} whitespace-pre-wrap opacity-90`}>
                    {formData.hidden}
                  </p>
                </div>
              )}
              {formData.focus && (
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.accentDot}`}></span> Focus
                  </h4>
                  <p className={`text-sm leading-relaxed pl-4 border-l-2 ${currentTheme.border} whitespace-pre-wrap opacity-90`}>
                    {formData.focus}
                  </p>
                </div>
              )}
              {formData.after && (
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.accentDot}`}></span> After
                  </h4>
                  <p className={`text-sm leading-relaxed pl-4 border-l-2 ${currentTheme.border} whitespace-pre-wrap opacity-90`}>
                    {formData.after}
                  </p>
                </div>
              )}
            </div>

            {/* 6. Review (한줄평) */}
            {formData.review && (
              <div className="mt-auto pt-6 text-center">
                <div className="inline-block relative">
                  <span className="text-4xl absolute -left-6 -top-4 opacity-30 font-serif">"</span>
                  <p className="text-xl font-serif italic font-bold">
                    {formData.review}
                  </p>
                  <span className="text-4xl absolute -right-6 -bottom-6 opacity-30 font-serif">"</span>
                </div>
              </div>
            )}

          </div>
          
          {/* 하단 푸터 */}
          <div className={`${currentTheme.accent} text-center py-2 text-xs font-serif tracking-widest mt-auto z-10 w-full`}>
            CALL OF CTHULHU SESSION LOG
          </div>
        </div>
      </div>
    </div>
  );
}