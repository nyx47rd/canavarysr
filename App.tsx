
import React, { useState, useCallback } from 'react';
import { CANAVAR_SCRIPT } from './constants';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
);

const App: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(CANAVAR_SCRIPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 selection:bg-green-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="max-w-4xl w-full text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-semibold mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          ULTIMATE V12 EDITION
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          CANAVAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">ULTIMATE</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          The most powerful Linux system management and remote interaction script. Fully featured, crash-proof, and easy to deploy.
        </p>
      </header>

      <main className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Features Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded bg-green-500/20 text-green-400">
                <TerminalIcon />
              </span>
              Key Features
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><b>Zero-Crash Boot:</b> Automatic dependency handling for Python and Linux packages.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><b>Persistence:</b> Create persistent user systemd services with a single command.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><b>Remote Mastery:</b> Screenshots, webcam, file management, and terminal access.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><b>GUI Control:</b> Remote mouse/keyboard interaction via PyAutoGUI.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-2xl shadow-lg shadow-green-900/20">
            <h3 className="text-white font-bold text-xl mb-2">Quick Deploy</h3>
            <p className="text-green-100 text-sm mb-6">
              Copy the code below, save it as a <code>.py</code> file on your target machine, and run it.
            </p>
            <button 
              onClick={handleCopy}
              className="w-full py-3 bg-white text-green-700 font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied to Clipboard' : 'Copy Full Script'}
            </button>
            <button 
              onClick={handleDownload}
              className="w-full mt-3 py-3 border border-white/30 text-white font-semibold rounded-xl transition-all hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download .py File
            </button>
          </div>
        </div>

        {/* Code Column */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-[#161616] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            {/* Terminal Header */}
            <div className="bg-[#1c1c1c] px-4 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                <span className="opacity-50 text-[10px] uppercase tracking-widest font-bold">Python 3.x</span>
                canavar_v12.py
              </div>
              <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy code"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto p-6 fira-code text-sm leading-relaxed custom-scrollbar">
              <pre className="text-gray-300">
                <code>
                  {CANAVAR_SCRIPT}
                </code>
              </pre>
            </div>

            {/* Overlay for "Copy All" hint */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#161616] to-transparent pointer-events-none"></div>
          </div>
        </div>
      </main>

      <footer className="mt-24 pb-8 text-center text-gray-500 text-sm max-w-2xl">
        <p className="mb-2">⚠️ <b>Legal Disclaimer:</b> This script is intended for legitimate administrative use and testing on devices you own or have explicit permission to manage.</p>
        <p>© 2024 Canavar Ultimate. Optimized for Vercel Deployment.</p>
      </footer>

      {/* Custom Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #161616;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default App;
