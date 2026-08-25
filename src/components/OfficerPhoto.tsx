import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface OfficerPhotoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  rank?: string;
  fallbackInitials?: string;
}

export const OfficerPhoto: React.FC<OfficerPhotoProps> = ({
  src,
  alt = 'Сотрудник Следственного комитета РФ',
  className = 'w-full h-full object-cover',
  rank = '',
  fallbackInitials = ''
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // If no photo or failed to load, render official uniform vector silhouette
  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-b from-slate-750 via-slate-850 to-slate-950 flex flex-col items-center justify-center text-slate-300 relative overflow-hidden select-none border border-slate-700/60 ${className}`}
        title={alt}
      >
        {/* Subtle background shield */}
        <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
          <Shield className="w-4/5 h-4/5 text-amber-300" />
        </div>

        {/* Crisp Vector Officer Silhouette with SK Uniform */}
        <svg viewBox="0 0 100 120" className="w-full h-full z-10 drop-shadow-sm p-1" fill="none">
          {/* Head & Neck */}
          <circle cx="50" cy="36" r="18" fill="#cbd5e1" />
          <path d="M32 34 C32 20 68 20 68 34 C68 25 32 25 32 34 Z" fill="#334155" />
          <rect x="44" y="52" width="12" height="12" fill="#cbd5e1" />
          
          {/* Uniform Jacket */}
          <path d="M10 115 L22 62 L44 62 L50 76 L56 62 L78 62 L90 115 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          
          {/* White Shirt Collar */}
          <polygon points="44,62 50,76 38,62" fill="#f8fafc" />
          <polygon points="56,62 50,76 62,62" fill="#f8fafc" />
          
          {/* Crimson / Burgundy SK RF Tie */}
          <polygon points="48,72 52,72 53,108 50,114 47,108" fill="#85181b" />
          
          {/* Gold Epaulets / Погоны */}
          <rect x="16" y="62" width="13" height="4" rx="1" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
          <rect x="71" y="62" width="13" height="4" rx="1" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
          
          {/* Stars on Epaulets */}
          <circle cx="22.5" cy="64" r="1.2" fill="#ffffff" />
          <circle cx="77.5" cy="64" r="1.2" fill="#ffffff" />
        </svg>

        {fallbackInitials && (
          <span className="absolute bottom-1 text-[9px] font-black text-amber-300 z-20 font-mono tracking-wider">
            {fallbackInitials}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};

export default OfficerPhoto;
