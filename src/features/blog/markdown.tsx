/**
 * Minimal server-side markdown renderer for blog content.
 *
 * Supports exactly what our posts use: ## h2, ### h3, paragraphs, - bullet
 * lists, 1. numbered lists, **bold**, *italic* and [text](url) links.
 *
 * Safety: the ENTIRE source is HTML-escaped first, then transformed — the
 * generated markup only ever contains tags this file emits, so passing it to
 * dangerouslySetInnerHTML is safe.
 */

const CLASSES = {
  p: "mt-5 first:mt-0 text-[15.5px] leading-[1.8] text-body",
  h2: "mt-10 first:mt-0 text-2xl font-bold tracking-tight text-foreground",
  h3: "mt-8 text-[19px] font-bold text-foreground",
  ul: "mt-5 list-disc space-y-2 pl-6 text-[15.5px] leading-relaxed text-body marker:text-primary",
  ol: "mt-5 list-decimal space-y-2 pl-6 text-[15.5px] leading-relaxed text-body marker:font-semibold marker:text-primary",
  a: "font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary-strong",
  strong: "font-semibold text-foreground",
} as const;

function escapeHtml(source: string): string {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Inline transforms — input is already escaped. */
function renderInline(text: string): string {
  return (
    text
      // [text](url) — only allow http(s), site-relative, hash and mailto targets.
      .replace(/\[([^\]]+)\]\(([^()\s]+)\)/g, (match, label: string, href: string) => {
        if (!/^(https?:\/\/|\/|#|mailto:)/.test(href)) return match;
        const external = /^https?:\/\//.test(href);
        return `<a href="${href}" class="${CLASSES.a}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
      })
      // **bold**
      .replace(/\*\*([^*]+)\*\*/g, `<strong class="${CLASSES.strong}">$1</strong>`)
      // *italic* (single asterisks, not part of a **)
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
  );
}

export function renderMarkdown(markdown: string): string {
  const lines = escapeHtml(markdown.replace(/\r\n/g, "\n")).split("\n");
  const out: string[] = [];
  const paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p class="${CLASSES.p}">${renderInline(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      flushParagraph();
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      out.push(`<h3 class="${CLASSES.h3}">${renderInline(line.slice(4).trim())}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      out.push(`<h2 class="${CLASSES.h2}">${renderInline(line.slice(3).trim())}</h2>`);
      i++;
      continue;
    }
    if (/^- /.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].slice(2).trim())}</li>`);
        i++;
      }
      out.push(`<ul class="${CLASSES.ul}">${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(/^\d+\. /, "").trim())}</li>`);
        i++;
      }
      out.push(`<ol class="${CLASSES.ol}">${items.join("")}</ol>`);
      continue;
    }

    paragraph.push(line.trim());
    i++;
  }
  flushParagraph();

  return out.join("\n");
}

/** Server component: renders post markdown as styled, sanitized HTML. */
export function Markdown({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}
