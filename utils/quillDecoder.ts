/**
 * Utility to decode single, double, or triple JSON-stringified Quill Delta contents
 * into formatted HTML or clean text.
 */
export const parseQuillContent = (content?: string | null): string => {
  if (!content) return "";
  let curr: any = content;

  // Unpack up to 5 layers of JSON stringification
  for (let i = 0; i < 5; i++) {
    if (typeof curr === "string") {
      const trimmed = curr.trim();
      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))
      ) {
        try {
          curr = JSON.parse(trimmed);
        } catch {
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (Array.isArray(curr)) {
    return renderQuillOps(curr);
  }

  if (typeof curr === "object" && curr !== null && Array.isArray(curr.ops)) {
    return renderQuillOps(curr.ops);
  }

  if (typeof curr === "string") {
    return curr;
  }

  return String(curr);
};

const renderQuillOps = (ops: any[]): string => {
  let html = "";
  for (const op of ops) {
    if (!op) continue;
    let text = op.insert;
    if (typeof text !== "string") {
      if (typeof text === "object") {
        text = JSON.stringify(text);
      } else {
        continue;
      }
    }

    // If insert string is itself a JSON array of ops
    if (text.trim().startsWith("[") && text.trim().endsWith("]")) {
      try {
        const nestedOps = JSON.parse(text.trim());
        if (Array.isArray(nestedOps)) {
          html += renderQuillOps(nestedOps);
          continue;
        }
      } catch {
        // Fall through
      }
    }

    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    if (op.attributes) {
      if (op.attributes.bold) formatted = `<strong>${formatted}</strong>`;
      if (op.attributes.italic) formatted = `<em>${formatted}</em>`;
      if (op.attributes.underline) formatted = `<u>${formatted}</u>`;
      if (op.attributes.link) {
        formatted = `<a href="${op.attributes.link}" target="_blank" rel="noreferrer" class="text-indigo-600 underline">${formatted}</a>`;
      }
    }

    html += formatted;
  }
  return html;
};
