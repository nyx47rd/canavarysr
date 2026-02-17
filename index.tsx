
import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { CANAVAR_SCRIPT } from './constants';

// UI Icons
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
);

const App: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(CANAVAR_SCRIPT).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([CANAVAR_SCRIPT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canavar_v12.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      </div>

      <header className="max-w-4xl w-full text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Sistem Hazır: V12 Ultimate
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white">
          CANAVAR <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-green-600">ULTIMATE</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Linux sistemlerinizi uzaktan yönetmek ve tam kontrol sağlamak için geliştirilmiş, tek tıkla kurulabilen Python otomasyon betiği.
        </p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Actions */}
        <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl terminal-glow backdrop-blur-md">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
              <ShieldIcon /> Hızlı Kurulum
            </h3>
            
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Kodun tamamını kopyalayın, hedef makinede bir <code>.py</code> dosyası olarak kaydedin ve çalıştırın. Tüm bağımlılıklar otomatik olarak kurulacaktır.
            </p>

            <div className="space-y-4">
              <button 
                onClick={handleCopy}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg ${
                  copied 
                  ? 'bg-emerald-500 text-black scale-[0.98]' 
                  : 'bg-white text-black hover:bg-emerald-50 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
              </button>

              <button 
                onClick={handleDownload}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Dosyayı İndir
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/20">
            <h4 className="text-emerald-400 font-bold mb-3 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SİSTEM ÖZELLİKLERİ
            </h4>
            <ul className="grid grid-cols-2 gap-3 text-[11px] font-mono text-emerald-200/60 uppercase tracking-tighter">
              <li className="flex items-center gap-2">◈ Telebot API</li>
              <li className="flex items-center gap-2">◈ GUI Control</li>
              <li className="flex items-center gap-2">◈ Remote Camera</li>
              <li className="flex items-center gap-2">◈ File Manager</li>
              <li className="flex items-center gap-2">◈ Systemd Persistence</li>
              <li className="flex items-center gap-2">◈ Zero-Crash Tech</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Code Preview */}
        <div className="lg:col-span-8 group relative animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-[2rem] blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
          
          <div className="relative bg-[#080808] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[650px]">
            {/* Window Header */}
            <div className="bg-[#111] px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase flex items-center gap-2">
                <span className="text-emerald-500">●</span> python / canavar_v12.py
              </div>
              <div className="w-12"></div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-8 font-mono text-sm leading-relaxed text-gray-400 code-scrollbar select-all">
              <pre className="whitespace-pre">
                <code className="text-emerald-50">
                  {CANAVAR_SCRIPT}
                </code>
              </pre>
            </div>
            
            {/* Bottom Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none"></div>
          </div>
        </div>
      </main>

      <footer className="mt-24 mb-12 text-center space-y-4">
        <p className="text-gray-600 text-[10px] max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
          Sorumluluk Reddi: Bu araç eğitim ve yasal sistem yönetimi amaçlıdır. İzin alınmayan sistemlerde kullanılması yasal sorumluluk doğurabilir.
        </p>
        <div className="text-emerald-500/30 font-mono text-[10px]">
          [ CANAVAR ENGINE V12 ] — OPTIMIZED FOR VERCEL CLOUD
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
