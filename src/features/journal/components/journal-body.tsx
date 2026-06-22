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
      const isFirst = key === 0;
      blocks.push(
        <p 
          key={key++} 
          className={`font-serif text-lg md:text-xl leading-loose tracking-wide text-primary/90 ${
            isFirst ? "first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-display first-letter:leading-[0.8] first-letter:text-accent-goldText mt-2" : ""
          }`}
        >
          {para.join(" ")}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="font-serif text-lg md:text-xl leading-loose tracking-wide text-primary/90 list-disc space-y-2 pl-6 mt-4 mb-8">
          {list.map((li, i) => (
            <li key={i} className="pl-2">{li}</li>
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
        <h3 key={key++} className="mt-12 mb-6 font-display text-3xl tracking-tight text-primary">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      flushPara();
      flushList();
      blocks.push(
        <h2 key={key++} className="mt-16 mb-8 font-display text-4xl md:text-5xl tracking-tight text-primary">
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
