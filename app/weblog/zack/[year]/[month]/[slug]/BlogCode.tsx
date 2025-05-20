import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CSSProperties } from "react";

interface HighligherStyle {
  [key: string]: CSSProperties;
}

interface BlogCodeProps {
  className?: string;
  children?: React.ReactNode;
}

export default function BlogCode({ className, children }: BlogCodeProps) {
  const match = /language-(\w+)/.exec(className || "");

  return match ? (
    <SyntaxHighlighter
      style={vscDarkPlus as HighligherStyle}
      language={match[1]}
      PreTag="div"
    >
      {String(children || "").replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className}>{children}</code>
  );
}
