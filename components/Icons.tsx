
import React from 'react';

export const StartIcon: React.FC = () => (
  <div className="relative w-12 h-12 flex items-center justify-center">
    <svg className="absolute w-full h-full rotating" viewBox="0 0 100 100">
      <circle 
        cx="50" cy="50" r="45" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeDasharray="4 4" 
        className="text-amber-500/50"
      />
    </svg>
    <svg className="w-6 h-6 z-10" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b45309', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M5 3l14 9-14 9V3z" fill="url(#goldGrad)" />
    </svg>
  </div>
);

export const StopIcon: React.FC = () => (
  <div className="relative w-12 h-12 flex items-center justify-center">
    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
      <rect 
        x="10" y="10" width="80" height="80" 
        fill="none" 
        stroke="#8B3A3A" 
        strokeWidth="1" 
        strokeDasharray="2 2"
      />
    </svg>
    <svg className="w-6 h-6 z-10" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="rustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8B3A3A', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="16" height="16" fill="url(#rustGrad)" />
    </svg>
  </div>
);

export const CheckIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export const DownloadIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const CopyIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);
