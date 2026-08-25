"use client";

import { useEffect, useRef } from "react";
import { parseQuillContent } from "@/utils/quillDecoder";

const EMPTY_DELTA = JSON.stringify([{ insert: "\n" }]);

export default function TextEditorEdit({
  value = "",
  initialHtml,
  onChange,
}: {
  value?: string;
  initialHtml?: string;
  onChange?: (val: string) => void;
}) {
  const editorRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const isReady = useRef(false);
  const lastLoadedContentRef = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const applyContent = (retries = 20) => {
    const editor = editorRef.current;
    if (!editor) return;

    const rawContent =
      initialHtml !== undefined && initialHtml !== null && initialHtml !== ""
        ? initialHtml
        : value;

    const decodedHtml = parseQuillContent(rawContent);

    if (
      decodedHtml === lastLoadedContentRef.current &&
      lastLoadedContentRef.current !== null
    ) {
      return;
    }

    const quill = editor._editor;
    const htmlContentEl = editor.shadowRoot?.querySelector(".ql-editor");

    if (quill && htmlContentEl) {
      if (decodedHtml) {
        quill.clipboard.dangerouslyPasteHTML(decodedHtml);
      } else {
        editor.value = EMPTY_DELTA;
      }
      lastLoadedContentRef.current = decodedHtml;
    } else if (retries > 0) {
      setTimeout(() => applyContent(retries - 1), 50);
    }
  };

  useEffect(() => {
    if (isReady.current) {
      applyContent();
    }
  }, [initialHtml, value]);

  useEffect(() => {
    let cancelled = false;

    import("@vaadin/rich-text-editor").then(() => {
      if (cancelled) return;
      const editor = editorRef.current;
      if (!editor) return;

      const handleChange = () => {
        const val = editor.value;
        onChangeRef.current?.(val);
      };

      customElements.whenDefined("vaadin-rich-text-editor").then(() => {
        if (cancelled) return;
        isReady.current = true;
        editor.addEventListener("value-changed", handleChange);

        applyContent();

        const injectStyles = () => {
          const content = editor.shadowRoot?.querySelector('[part="content"]');
          const toolbar = editor.shadowRoot?.querySelector('[part="toolbar"]');
          if (toolbar) {
            toolbar.style.flexWrap = "wrap";
            toolbar.style.overflow = "visible";
          }
          if (content && !content.querySelector("#custom-line-style")) {
            const style = document.createElement("style");
            style.id = "custom-line-style";
            content.appendChild(style);
          }
        };
        setTimeout(injectStyles, 150);
      });
    });

    return () => {
      cancelled = true;
      const editor = editorRef.current;
      if (editor) {
        editor.removeEventListener("value-changed", () => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <vaadin-rich-text-editor
      ref={editorRef}
      style={{
        width: "100%",
        minHeight: "340px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
      }}
    />
  );
}
