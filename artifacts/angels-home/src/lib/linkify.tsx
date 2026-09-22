import React from "react";

const URL_REGEX = /https?:\/\/[^\s<>"']+/g;

function trimTrailingPunctuation(url: string): { url: string; trailing: string } {
  const match = url.match(/[),.!?;:'"]+$/);
  if (!match) return { url, trailing: "" };
  return { url: url.slice(0, -match[0].length), trailing: match[0] };
}

/** Splits plain text on bare URLs and renders them as clickable links. For content rendered as plain React text (e.g. whitespace-pre-wrap). */
export function linkifyPlainText(text: string): React.ReactNode[] {
  const parts = text.split(URL_REGEX);
  const matches = text.match(URL_REGEX) ?? [];
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    if (part) nodes.push(part);
    const rawMatch = matches[i];
    if (rawMatch) {
      const { url, trailing } = trimTrailingPunctuation(rawMatch);
      nodes.push(
        <a
          key={`link-${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
        >
          {url}
        </a>,
      );
      if (trailing) nodes.push(trailing);
    }
  });

  return nodes;
}

/** Wraps bare URLs found in raw HTML text nodes with <a> tags, leaving existing tags/attributes untouched. For content rendered via dangerouslySetInnerHTML. */
export function linkifyHtml(html: string): string {
  if (typeof document === "undefined" || !html) return html;

  const container = document.createElement("div");
  container.innerHTML = html;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parentTag = node.parentElement?.tagName;
      if (parentTag === "A" || parentTag === "SCRIPT" || parentTag === "STYLE") {
        return NodeFilter.FILTER_REJECT;
      }
      return URL_REGEX.test(node.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });

  const textNodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const node of textNodes) {
    const text = node.textContent ?? "";
    URL_REGEX.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = URL_REGEX.exec(text))) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const { url, trailing } = trimTrailingPunctuation(match[0]);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = "text-primary underline break-all";
      anchor.textContent = url;
      fragment.appendChild(anchor);
      if (trailing) fragment.appendChild(document.createTextNode(trailing));
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    node.replaceWith(fragment);
  }

  return container.innerHTML;
}
