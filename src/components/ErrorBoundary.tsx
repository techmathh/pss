import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center p-4">
      <div className="bg-[#131722] p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-white/10">
        <div className="w-20 h-20 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Terjadi Kesalahan</h1>
        <p className="text-slate-400 mb-6 font-medium text-sm">
          Maaf, terjadi kesalahan pada sistem kami. Halaman tidak dapat dimuat.
        </p>
        <button
          onClick={() => {
            resetErrorBoundary();
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-red-500/30 uppercase tracking-widest text-xs w-full"
        >
          Muat Ulang Halaman
        </button>
        <div className="mt-6 p-4 bg-[#0a0c10] rounded-lg overflow-x-auto text-left text-xs font-mono text-slate-500 border border-white/5">
          {error.message}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
