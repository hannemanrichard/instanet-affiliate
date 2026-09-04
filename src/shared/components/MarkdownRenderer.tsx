import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/utils";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatInline = (value: string) => {
  let formatted = escapeHtml(value);

  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");
  formatted = formatted.replace(/`(.+?)`/g, "<code>$1</code>");
  formatted = formatted.replace(
    /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>'
  );

  return formatted;
};

const formatMarkdown = (markdown: string) => {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const segments: string[] = [];
  let inList = false;

  const closeListIfNeeded = () => {
    if (inList) {
      segments.push("</ul>");
      inList = false;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      closeListIfNeeded();
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeListIfNeeded();
      const level = headingMatch[1].length;
      const content = formatInline(headingMatch[2]);
      segments.push(`<h${level}>${content}</h${level}>`);
      return;
    }

    if (/^[-*+]\s+/.test(line)) {
      if (!inList) {
        segments.push("<ul>");
        inList = true;
      }
      const itemContent = formatInline(line.replace(/^[-*+]\s+/, ""));
      segments.push(`<li>${itemContent}</li>`);
      return;
    }

    closeListIfNeeded();
    segments.push(`<p>${formatInline(line)}</p>`);
  });

  closeListIfNeeded();

  return segments.length ? segments.join("") : "";
};

interface MarkdownRendererProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  content: string | null | undefined;
}

export const MarkdownRenderer = ({
  content,
  className,
  ...props
}: MarkdownRendererProps) => {
  if (!content) {
    return null;
  }

  const html = formatMarkdown(content);

  if (!html) {
    return null;
  }

  return (
    <div
      {...props}
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
