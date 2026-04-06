import { useEffect, useState } from "react";

export function AuthIllustration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Digits of Pi split into two orbits
  const innerDigits = ["3", "1", "4", "1", "5", "9"];
  const outerDigits = ["2", "6", "5", "3", "5", "8", "9", "7"];

  const renderOrbit = (digits: string[], rx: number, ry: number, duration: number) => {
    return digits.map((digit, i) => {
      const delay = (i / digits.length) * duration;
      
      return (
        <div
          key={`${rx}-${i}`}
          className="absolute flex items-center justify-center translate-gpu"
          style={{
            animation: `orbit-normal ${duration}s linear infinite`,
            animationDelay: `-${delay}s`,
            "--rx": `${rx}px`,
            "--ry": `${ry}px`,
          } as any}
        >
          {/* Neon Digit - Large & Clear */}
          <div 
            className="flex items-center justify-center text-5xl font-black text-primary pointer-events-none select-none"
            style={{
              textShadow: "0 0 20px rgba(var(--primary-rgb), 0.8), 0 0 40px rgba(var(--primary-rgb), 0.2)",
            }}
          >
            {digit}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#010102] overflow-hidden">
      {/* Background Depth Fog */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.08)_0%,transparent_70%)]" />
      
      {/* Stars background */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
            }}
          />
        ))}
      </div>

      {/* The Central Planet (Z-index 20) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="relative flex items-center justify-center scale-110">
          {/* Planet Core Glow */}
          <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          {/* The Planet Body - SOLID to hide things behind it */}
          <div className="relative w-44 h-44 rounded-full border-2 border-primary/30 bg-[#0a0a0b] flex items-center justify-center backdrop-blur-xl shadow-[0_0_120px_rgba(var(--primary-rgb),0.5),inset_0_0_50px_rgba(var(--primary-rgb),0.2)] overflow-hidden">
            {/* Optically centered Pi symbol */}
            <span className="text-[120px] font-serif text-primary drop-shadow-[0_0_35px_rgba(var(--primary-rgb),1)] select-none z-10 leading-none -translate-y-[8%]">π</span>
            {/* Subtle Surface Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-primary/20" />
          </div>
        </div>
      </div>

      {/* Orbit Container (Elliptical Path) */}
      <div className="absolute inset-0 flex items-center justify-center">
        
        {/* Visual Rings - Single Direction Flow */}
        <div className="absolute inset-0 flex items-center justify-center -rotate-[15deg] pointer-events-none">
          {/* Inner Ring */}
          <div className="absolute w-[450px] h-[160px] rounded-[100%] border-t-2 border-primary/10 opacity-30 z-10" />
          <div className="absolute w-[450px] h-[160px] rounded-[100%] border-b-2 border-primary/40 opacity-80 z-30" />
          
          {/* Outer Ring */}
          <div className="absolute w-[750px] h-[300px] rounded-[100%] border-t-2 border-primary/5 opacity-20 z-10" />
          <div className="absolute w-[750px] h-[300px] rounded-[100%] border-b-2 border-primary/30 opacity-60 z-30" />
        </div>

        {/* Digits Orbits (Consistent Speed & Direction) */}
        <div className="absolute inset-0 flex items-center justify-center -rotate-[15deg]">
          {renderOrbit(innerDigits, 225, 80, 40)}
          {renderOrbit(outerDigits, 375, 150, 70)}
        </div>
      </div>

      <style>{`
        @keyframes orbit-normal {
          0%   { transform: translate(var(--rx), 0); z-index: 40; scale: 1.2; opacity: 1; }
          12.5% { transform: translate(calc(var(--rx) * 0.707), calc(var(--ry) * 0.707)); z-index: 40; }
          25%  { transform: translate(0, var(--ry)); z-index: 35; scale: 1; opacity: 0.8; }
          37.5% { transform: translate(calc(var(--rx) * -0.707), calc(var(--ry) * 0.707)); z-index: 25; }
          50%  { transform: translate(calc(var(--rx) * -1), 0); z-index: 5; scale: 0.8; opacity: 0.25; }
          62.5% { transform: translate(calc(var(--rx) * -0.707), calc(var(--ry) * -0.707)); z-index: 10; }
          75%  { transform: translate(0, calc(var(--ry) * -1)); z-index: 20; scale: 0.9; opacity: 0.5; }
          87.5% { transform: translate(calc(var(--rx) * 0.707), calc(var(--ry) * -0.707)); z-index: 35; }
          100% { transform: translate(var(--rx), 0); z-index: 40; scale: 1.2; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
