"use client";

import { useState } from "react";

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8888A8] hover:text-[#00ff88] border border-[#2A2A38] hover:border-[#00ff88]/40 transition-colors rounded-md px-3 py-2.5 shrink-0"
    >
      <span className="material-symbols-outlined text-[16px] leading-none">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied!" : "Copy as Markdown"}
    </button>
  );
}
