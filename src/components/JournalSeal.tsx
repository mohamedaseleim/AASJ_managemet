import React from 'react';
import { useTemplate } from '../context/TemplateContext';
import { JournalLogo } from './JournalLogo';

interface JournalSealProps {
  id?: string;
  className?: string;
  sealTextTop?: string;
  sealTextCenter?: string;
  sealTextBottom?: string;
}

export const JournalSeal: React.FC<JournalSealProps> = ({
  id,
  className = 'w-28 h-28',
  sealTextTop = '★ ARCHIVES OF AGRICULTURE SCIENCES ★',
  sealTextCenter = 'AASJ EDITORIAL BOARD',
  sealTextBottom = 'OFFICIAL ACCEPTANCE SEAL',
}) => {
  const { customSealUrl } = useTemplate();

  if (customSealUrl) {
    return (
      <div className="flex flex-col items-center">
        <div className={`${className} flex items-center justify-center select-none transform -rotate-3 transition-transform hover:rotate-0 drop-shadow-xs`}>
          <img
            src={customSealUrl}
            alt="Official Journal Seal"
            className="w-full h-full object-contain filter drop-shadow-xs"
          />
        </div>
        <span className="text-[8.5px] font-mono text-emerald-900 font-extrabold uppercase tracking-wider mt-1">
          OFFICIAL VERIFIED SEAL
        </span>
      </div>
    );
  }

  // Fallback to high-definition digital embossed circular seal
  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${className} rounded-full border-2 border-double border-emerald-900 bg-emerald-50/70 p-1 flex flex-col items-center justify-center text-center text-emerald-950 shadow-inner select-none -rotate-2`}>
        <div className="w-full h-full rounded-full border border-dashed border-emerald-800/80 flex flex-col items-center justify-center p-1 leading-tight text-[8px] font-bold">
          <span className="text-[6.5px] font-mono tracking-wider text-emerald-800 line-clamp-1">
            {sealTextTop}
          </span>
          
          {/* Mini Journal Logo inside seal */}
          <div className="w-6 h-6 my-0.5">
            <JournalLogo className="w-6 h-6" />
          </div>

          <span className="text-[8.5px] font-extrabold text-emerald-950 tracking-tight">
            {sealTextCenter}
          </span>
          <span className="text-[7px] uppercase font-sans text-emerald-900 font-black">
            {sealTextBottom}
          </span>
          {id && (
            <span className="text-[6.5px] font-mono text-amber-900 font-bold mt-0.5">
              {id}
            </span>
          )}
        </div>
      </div>
      <span className="text-[8.5px] font-mono text-slate-500 font-bold mt-1">
        VERIFIED ORIGINAL
      </span>
    </div>
  );
};
