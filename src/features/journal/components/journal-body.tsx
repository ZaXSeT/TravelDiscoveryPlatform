import { Fragment } from "react";

// Minimal, XSS-safe markdown-ish renderer: text is React-escaped, no raw HTML, no
// dangerouslySetInnerHTML. Supports #/## headings and "- " bullet lists.
// (Full markdown + sanitizer is a later enhancement; this keeps Phase 3 secure.)
export function JournalBody({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={key++} className="leading-relaxed text-muted-foreground">
          {para.join(" ")}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="list-disc space-y-1 pl-5 text-muted-foreground">
          {list.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(
        <h3 key={key++} className="mt-8 font-display text-2xl">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      flushPara();
      flushList();
      blocks.push(
        <h2 key={key++} className="mt-8 font-display text-3xl">
          {line.slice(2)}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-4">{blocks.map((b, i) => (
    <Fragment key={i}>{b}</Fragment>
  ))}</div>;
}
