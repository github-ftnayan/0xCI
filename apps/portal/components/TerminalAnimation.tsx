"use client";

import { useEffect, useState } from "react";

const LINES = [
  { text: "$ git push origin feature/checkout-page", type: "cmd",     delay: 0 },
  { text: "✓ 0xCI · Deploying pr-42 to AWS...",     type: "success", delay: 1500 },
  { text: "✓ CloudFront · https://pr-42.myapp.0xci.dev", type: "link", delay: 1900 },
  { text: "✓ Comment posted on PR #42",              type: "success", delay: 2300 },
];

export function TerminalAnimation() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((line, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setVisibleCount(i), line.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 text-left">
      <div className="terminal-glass rounded-lg overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="relative flex items-center gap-2 px-4 py-2.5 border-b border-[#2A2A38] bg-[#1A1A24]/50">
          <span className="w-3 h-3 rounded-full bg-[#2A2A38]" />
          <span className="w-3 h-3 rounded-full bg-[#2A2A38]" />
          <span className="w-3 h-3 rounded-full bg-[#2A2A38]" />
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none font-mono text-[10px] text-[#8888A8] tracking-widest">bash — 0xCI</span>
        </div>

        {/* Terminal body */}
        <div className="p-6 font-mono text-sm leading-loose">
          {/* First line: typewriter with thin caret */}
          <div className="typewriter-text text-[#A8FFB8]">
            $ git push origin feature/checkout-page
          </div>

          {/* Result lines — always in DOM, fade in */}
          {LINES.slice(1).map((line, i) => (
            <div
              key={i}
              className={`mt-2 transition-opacity duration-500 ${
                visibleCount > i ? "opacity-100" : "opacity-0"
              } ${line.type === "link" ? "text-[#3fe882]" : "text-[#8888A8]"}`}
            >
              {line.type === "link" ? (
                <>
                  <span className="text-[#00ff88] mr-2">✓</span>
                  {"CloudFront · "}
                  <a href="#" className="text-[#3fe882] hover:underline">
                    https://pr-42.myapp.0xci.dev
                  </a>
                </>
              ) : (
                <>
                  <span className="text-[#00ff88] mr-2">✓</span>
                  {line.text.replace("✓ ", "")}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
