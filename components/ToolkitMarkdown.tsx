function inlineText(text: string) {
  const pieces = text.split(/(\*\*[^*]+\*\*)/g);
  return pieces.map((piece, index) => {
    if (piece.startsWith("**") && piece.endsWith("**")) {
      return <strong key={`${piece}-${index}`}>{piece.slice(2, -2)}</strong>;
    }
    return piece;
  });
}

export function ToolkitMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: Array<{ type: "heading" | "paragraph" | "list"; text?: string; items?: string[] }> = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    blocks.push({ type: "list", items: list });
    list = [];
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.replace(/^##\s+/, "") });
      return;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.replace(/^-\s+/, ""));
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }
    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return (
    <div className="toolkit-prose">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return <h2 key={`${block.type}-${index}`}>{inlineText(block.text || "")}</h2>;
        }
        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`}>
              {(block.items || []).map((item) => <li key={item}>{inlineText(item)}</li>)}
            </ul>
          );
        }
        return <p key={`${block.type}-${index}`}>{inlineText(block.text || "")}</p>;
      })}
    </div>
  );
}
