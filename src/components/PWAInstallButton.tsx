import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall.ts';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'prominent';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'prominent') {
      return (
        <button
          onClick={install}
          aria-label="Install App"
          className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/40 hover:from-cyan-500 hover:to-blue-500 transition active:scale-95 ${className}`}
        >
          <Smartphone className="w-4 h-4 text-cyan-200" />
          <span>Install Android / PC App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        title="Install app to your home screen or desktop"
        aria-label="Install App"
        className={`flex items-center gap-1.5 rounded-lg bg-slate-800/90 border border-cyan-500/30 px-2.5 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur-md hover:bg-slate-700 hover:border-cyan-400 transition active:scale-95 shadow-md ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span>Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Install app on iOS Safari"
          aria-label="Install on iOS"
          className={`flex items-center gap-1.5 rounded-lg bg-slate-800/90 border border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-md hover:bg-slate-700 transition active:scale-95 shadow-md ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    1
                  </span>
                  <p>
                    Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    2
                  </span>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-sm font-semibold text-white transition shadow-lg"
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
