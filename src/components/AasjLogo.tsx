import React from 'react';

export const AasjLogo: React.FC<{
  className?: string;
  showSubtext?: boolean;
  variant?: 'horizontal' | 'vertical';
}> = ({
  className = 'w-10 h-10',
  showSubtext = false,
  variant = 'horizontal',
}) => {
  // Handcrafted SVG vector accurately replicating the uploaded AASJ logo-2.jpg
  // Dual-colored Tree of Agriculture (Left side: emerald green leaves & trunk; Right side: golden amber leaves & trunk)
  const treeEmblem = (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
      {/* TRUNK & MAIN BRANCHES */}
      {/* Left Trunk (Emerald Green) */}
      <path
        d="M 80 148 C 76 138, 70 115, 74 95 C 66 90, 56 75, 52 64 C 54 63, 62 70, 68 76 C 70 66, 68 54, 66 48 C 70 52, 75 64, 76 75 C 78 62, 80 50, 80 40 L 80 148 Z"
        fill="#16a34a"
      />
      {/* Right Trunk (Golden Amber) */}
      <path
        d="M 80 148 C 84 138, 90 115, 86 95 C 94 90, 104 75, 108 64 C 106 63, 98 70, 92 76 C 90 66, 92 54, 94 48 C 90 52, 85 64, 84 75 C 82 62, 80 50, 80 40 L 80 148 Z"
        fill="#f59e0b"
      />

      {/* LEFT LEAVES (GREEN PALETTE #15803d, #16a34a, #22c55e) */}
      {/* Top Left Leaf Cluster */}
      <path d="M 80 38 C 72 26, 64 22, 60 25 C 56 32, 62 42, 76 43 Z" fill="#15803d" />
      <path d="M 74 34 C 65 20, 52 16, 46 22 C 43 30, 54 40, 68 40 Z" fill="#16a34a" />
      <path d="M 64 24 C 54 12, 42 14, 38 20 C 37 30, 48 36, 58 32 Z" fill="#22c55e" />

      {/* Mid Left Leaves */}
      <path d="M 58 54 C 44 42, 32 46, 28 54 C 28 64, 40 70, 54 62 Z" fill="#15803d" />
      <path d="M 62 72 C 48 64, 36 70, 32 80 C 32 90, 46 92, 58 82 Z" fill="#16a34a" />
      <path d="M 44 76 C 30 72, 20 80, 18 90 C 18 100, 32 102, 42 90 Z" fill="#22c55e" />
      
      {/* Lower Left Leaves */}
      <path d="M 66 94 C 52 90, 40 98, 38 108 C 40 118, 54 116, 62 104 Z" fill="#15803d" />
      <path d="M 52 110 C 38 110, 30 120, 32 128 C 38 134, 50 128, 52 118 Z" fill="#16a34a" />

      {/* Inner Green Foliage */}
      <path d="M 68 56 C 58 48, 52 56, 54 64 C 60 68, 68 64, 70 58 Z" fill="#22c55e" />
      <path d="M 72 78 C 62 72, 58 80, 60 88 C 66 92, 74 86, 74 80 Z" fill="#15803d" />

      {/* RIGHT LEAVES (GOLDEN AMBER PALETTE #d97706, #f59e0b, #fbbf24) */}
      {/* Top Right Leaf Cluster */}
      <path d="M 80 38 C 88 26, 96 22, 100 25 C 104 32, 98 42, 84 43 Z" fill="#d97706" />
      <path d="M 86 34 C 95 20, 108 16, 114 22 C 117 30, 106 40, 92 40 Z" fill="#f59e0b" />
      <path d="M 96 24 C 106 12, 118 14, 122 20 C 123 30, 112 36, 102 32 Z" fill="#fbbf24" />

      {/* Mid Right Leaves */}
      <path d="M 102 54 C 116 42, 128 46, 132 54 C 132 64, 120 70, 106 62 Z" fill="#d97706" />
      <path d="M 98 72 C 112 64, 124 70, 128 80 C 128 90, 114 92, 102 82 Z" fill="#f59e0b" />
      <path d="M 116 76 C 130 72, 140 80, 142 90 C 142 100, 128 102, 118 90 Z" fill="#fbbf24" />

      {/* Lower Right Leaves */}
      <path d="M 94 94 C 108 90, 120 98, 122 108 C 120 118, 106 116, 98 104 Z" fill="#d97706" />
      <path d="M 108 110 C 122 110, 130 120, 128 128 C 122 134, 110 128, 108 118 Z" fill="#f59e0b" />

      {/* Inner Amber Foliage */}
      <path d="M 92 56 C 102 48, 108 56, 106 64 C 100 68, 92 64, 90 58 Z" fill="#fbbf24" />
      <path d="M 88 78 C 98 72, 102 80, 100 88 C 94 92, 86 86, 86 80 Z" fill="#d97706" />
    </svg>
  );

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-2">{treeEmblem}</div>
        <div className="space-y-0.5">
          <p className="font-serif italic text-base font-bold text-emerald-800 leading-tight">
            Archives of Agriculture Sciences Journal
          </p>
          <p className="text-xs font-semibold text-slate-700">
            مجلة أرشيف العلوم الزراعية (AASJ)
          </p>
          <div className="text-[11px] font-mono text-amber-700 font-semibold space-x-2 rtl:space-x-reverse pt-1">
            <span>Print ISSN: 2535-1680</span>
            <span>·</span>
            <span>Online ISSN: 2535-1699</span>
          </div>
          <p className="text-[10px] text-slate-500 pt-0.5">
            Faculty of Agriculture (Assiut Branch), Al-Azhar University, Egypt
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Official Dual-Color Tree Emblem Container */}
      <div className={`${className} shrink-0 p-0.5 rounded-xl bg-white border border-emerald-100 shadow-xs flex items-center justify-center`}>
        {treeEmblem}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight text-emerald-950 font-serif leading-none">
            AASJ
          </span>
          <span className="text-xs font-bold text-emerald-800 border-r border-slate-300 pr-2 mr-2 hidden sm:inline">
            مجلة أرشيف العلوم الزراعية
          </span>
        </div>
        {showSubtext && (
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-emerald-700 italic font-serif leading-tight mt-0.5 truncate max-w-xs sm:max-w-md">
              Archives of Agriculture Sciences Journal · EKB
            </span>
            <span className="text-[10px] font-mono text-amber-700 hidden md:inline">
              P-ISSN: 2535-1680 · E-ISSN: 2535-1699 · Al-Azhar University
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
