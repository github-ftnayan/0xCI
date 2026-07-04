"use client";

import { useState } from "react";
import { Icon } from "./Icon";

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
      <Icon name={copied ? "check" : "content_copy"} className="w-4 h-4" />
      {copied ? "Copied!" : "Copy as Markdown"}
    </button>
  );
}
