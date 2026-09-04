import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Laptop } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed desktop app / standalone PWA, hide button
  if (isInstalled) {
    return (
      <div id="pwa-installed-badge" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Desktop App Mode</span>
      </div>
    );
  }

  // Chromium / Desktop Chrome / Edge flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-desktop-app"
        onClick={install}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition active:scale-95"
        title="Install Ad Intel as a dedicated desktop application"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install Desktop App</span>
      </button>
    );
  }

  // Mobile / iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios-guide"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <Laptop className="w-3.5 h-3.5 text-slate-500" />
          <span>Add to Desktop</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
              <h3 className="text-base font-bold text-slate-900">Install Ad Intel</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                1. Tap the <strong>Share</strong> button in your browser toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-md bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
