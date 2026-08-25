import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "vaadin-rich-text-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: React.Ref<any>;
        value?: string;
        theme?: string;
        disabled?: boolean;
        readonly?: boolean;
      };
    }
  }

  namespace React.JSX {
    interface IntrinsicElements {
      "vaadin-rich-text-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: React.Ref<any>;
        value?: string;
        theme?: string;
        disabled?: boolean;
        readonly?: boolean;
      };
    }
  }
}
