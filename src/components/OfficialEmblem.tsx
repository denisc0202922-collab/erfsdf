import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

export const OfficialEmblem: React.FC<{ className?: string; size?: number; alt?: string }> = ({
  className = '',
  size = 48,
  alt = 'Эмблема Следственного комитета РФ'
}) => {
  const [imgError, setImgError] = useState(false);

  if (!imgError && logoImg) {
    return (
      <img
        src={logoImg}
        alt={alt}
        onError={() => setImgError(true)}
        className={`object-contain flex-shrink-0 drop-shadow-md select-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Gold Metallic Gradients */}
          <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="75%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          
          <linearGradient id="goldInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <radialGradient id="redRoundel" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>

          <linearGradient id="steelBlade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>

        {/* 1. Outer Golden Shield */}
        <path
          d="M50 4 L88 18 C88 64 50 114 50 114 C50 114 12 64 12 18 L50 4 Z"
          fill="url(#goldRim)"
          stroke="#78350f"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 2. Inner Rim / Gap */}
        <path
          d="M50 8 L84 20.5 C84 62 50 108 50 108 C50 108 16 62 16 20.5 L50 8 Z"
          fill="#1c1917"
          stroke="#ca8a04"
          strokeWidth="0.8"
        />

        {/* 3. Deep Navy Shield Canvas */}
        <path
          d="M50 12 L80 23 C80 59 50 102 50 102 C50 102 20 59 20 23 L50 12 Z"
          fill="url(#shieldBg)"
          stroke="#fde047"
          strokeWidth="1"
        />

        {/* 4. Sword of Justice (Vertical Point Down) */}
        {/* Blade */}
        <path
          d="M48 24 L52 24 L50.8 96 L50 100 L49.2 96 Z"
          fill="url(#steelBlade)"
          stroke="#475569"
          strokeWidth="0.4"
        />
        {/* Blade Center Ridge */}
        <line x1="50" y1="24" x2="50" y2="96" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
        
        {/* Crossguard */}
        <path
          d="M36 24 C36 21 64 21 64 24 L62 27 C54 26 46 26 38 27 Z"
          fill="url(#goldRim)"
          stroke="#78350f"
          strokeWidth="0.5"
        />
        {/* Hilt Grip */}
        <rect x="48.5" y="14" width="3" height="9" rx="0.5" fill="#fef08a" stroke="#854d0e" strokeWidth="0.5" />
        <line x1="48.5" y1="16.5" x2="51.5" y2="16.5" stroke="#78350f" strokeWidth="0.5" />
        <line x1="48.5" y1="19" x2="51.5" y2="19" stroke="#78350f" strokeWidth="0.5" />
        {/* Pommel */}
        <circle cx="50" cy="13" r="3" fill="url(#goldRim)" stroke="#78350f" strokeWidth="0.6" />

        {/* 5. Scales of Justice */}
        {/* Horizontal Balance Bar */}
        <path
          d="M26 38 Q50 34 74 38 L74 40.5 Q50 36.5 26 40.5 Z"
          fill="url(#goldRim)"
          stroke="#78350f"
          strokeWidth="0.5"
        />
        <circle cx="50" cy="37" r="2.5" fill="#fde047" stroke="#78350f" strokeWidth="0.5" />

        {/* Left Pan & Chains */}
        <line x1="28" y1="39" x2="24" y2="52" stroke="#facc15" strokeWidth="0.75" />
        <line x1="32" y1="39" x2="36" y2="52" stroke="#facc15" strokeWidth="0.75" />
        <path
          d="M22 52 Q30 57 38 52 Z"
          fill="url(#goldInner)"
          stroke="#78350f"
          strokeWidth="0.6"
        />

        {/* Right Pan & Chains */}
        <line x1="68" y1="39" x2="64" y2="52" stroke="#facc15" strokeWidth="0.75" />
        <line x1="72" y1="39" x2="76" y2="52" stroke="#facc15" strokeWidth="0.75" />
        <path
          d="M62 52 Q70 57 78 52 Z"
          fill="url(#goldInner)"
          stroke="#78350f"
          strokeWidth="0.6"
        />

        {/* 6. Central Crimson Medallion / Star / Eye of Justice */}
        {/* Golden Laurel Star Rays / Burst */}
        <polygon
          points="50,42 53,52 64,52 55,58 58,68 50,62 42,68 45,58 36,52 47,52"
          fill="url(#goldRim)"
          stroke="#78350f"
          strokeWidth="0.4"
        />
        {/* Circular Crimson Core */}
        <circle
          cx="50"
          cy="55"
          r="10.5"
          fill="url(#redRoundel)"
          stroke="#fde047"
          strokeWidth="1.2"
        />
        {/* Golden Emblem Center / Eye */}
        <circle cx="50" cy="55" r="4.5" fill="#fef08a" stroke="#854d0e" strokeWidth="0.8" />
        <circle cx="50" cy="55" r="2" fill="#7f1d1d" />

        {/* 7. Bottom Ribbon Accent */}
        <path
          d="M38 98 Q50 94 62 98 L60 102 Q50 98 40 102 Z"
          fill="url(#goldRim)"
          stroke="#78350f"
          strokeWidth="0.4"
        />
      </svg>
    </div>
  );
};

export const OfficialStampSeal: React.FC<{
  title?: string;
  subTitle?: string;
  code?: string;
  className?: string;
}> = ({
  title = 'СЛЕДСТВЕННЫЙ КОМИТЕТ РОССИЙСКОЙ ФЕДЕРАЦИИ',
  subTitle = 'ГЛАВНОЕ СЛЕДСТВЕННОЕ УПРАВЛЕНИЕ',
  code = 'ДЛЯ ПАКЕТОВ И ДОКУМЕНТОВ № 77',
  className = ''
}) => {
  return (
    <div
      className={`inline-block relative select-none pointer-events-none transform -rotate-6 border-[3px] border-dashed border-blue-700/80 text-blue-700 rounded-full w-36 h-36 flex flex-col items-center justify-center p-2 text-center shadow-inner mix-blend-multiply opacity-85 ${className}`}
      style={{
        maskImage: 'radial-gradient(circle, black 70%, rgba(0,0,0,0.8) 100%)'
      }}
    >
      <div className="absolute inset-1 border border-blue-600/70 rounded-full" />
      <div className="text-[7.5px] font-bold uppercase tracking-tighter leading-tight max-w-[110px]">
        {title}
      </div>
      <div className="my-1 border-t border-b border-blue-600/60 py-0.5 w-4/5 text-[6.5px] font-bold uppercase text-blue-800 tracking-wider">
        ★ {subTitle} ★
      </div>
      <div className="text-[6.5px] font-mono font-bold tracking-tight text-blue-900">
        {code}
      </div>
      <div className="text-[6px] text-blue-700 font-semibold mt-0.5">
        г. Москва
      </div>
    </div>
  );
};
