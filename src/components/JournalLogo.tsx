import React from 'react';
import { useTemplate } from '../context/TemplateContext';
import { AasjLogo } from './AasjLogo';

interface JournalLogoProps {
  className?: string;
  showSubtext?: boolean;
  variant?: 'horizontal' | 'vertical';
  alt?: string;
}

export const JournalLogo: React.FC<JournalLogoProps> = ({
  className = 'w-16 h-16',
  showSubtext = false,
  variant = 'horizontal',
  alt = 'Archives of Agriculture Sciences Journal (AASJ)',
}) => {
  const { customLogoUrl } = useTemplate();

  if (customLogoUrl) {
    if (variant === 'vertical') {
      return (
        <div className="flex flex-col items-center text-center">
          <div className={`${className} mb-2 flex items-center justify-center`}>
            <img
              src={customLogoUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain drop-shadow-xs"
            />
          </div>
          {showSubtext && (
            <div className="space-y-0.5">
              <p className="font-serif italic text-base font-bold text-emerald-950 leading-tight">
                Archives of Agriculture Sciences Journal
              </p>
              <p className="text-xs font-semibold text-emerald-800">
                مجلة أرشيف العلوم الزراعية (AASJ)
              </p>
              <p className="text-[10px] text-slate-500 pt-0.5">
                Editorial Office & Scientific Board
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className={`${className} shrink-0 p-1 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-center overflow-hidden`}>
          <img
            src={customLogoUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        {showSubtext && (
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-emerald-950 font-serif leading-none">
              AASJ
            </span>
            <span className="text-[11px] font-medium text-emerald-800 italic font-serif mt-0.5">
              Archives of Agriculture Sciences Journal
            </span>
            <span className="text-[10px] font-mono text-amber-700">
              P-ISSN: 2535-1680 · E-ISSN: 2535-1699
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback to built-in SVG vector of the AASJ emblem
  return <AasjLogo className={className} showSubtext={showSubtext} variant={variant} />;
};
