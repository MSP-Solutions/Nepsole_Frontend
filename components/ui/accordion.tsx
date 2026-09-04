"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type?: "single" | "multiple";
  collapsible?: boolean;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

function Accordion({
  type = "single",
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internalOpen, setInternalOpen] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const isControlled = value !== undefined;
  const currentOpen = isControlled
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : internalOpen;

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      let nextOpen: string[];
      if (type === "single") {
        if (currentOpen.includes(itemValue)) {
          nextOpen = collapsible ? [] : [itemValue];
        } else {
          nextOpen = [itemValue];
        }
      } else {
        if (currentOpen.includes(itemValue)) {
          nextOpen = currentOpen.filter((v) => v !== itemValue);
        } else {
          nextOpen = [...currentOpen, itemValue];
        }
      }

      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      if (onValueChange) {
        onValueChange(type === "single" ? (nextOpen[0] || "") : nextOpen);
      }
    },
    [type, collapsible, currentOpen, isControlled, onValueChange],
  );

  return (
    <AccordionContext.Provider
      value={{ openItems: currentOpen, toggleItem, type, collapsible }}
    >
      <div data-slot="accordion" className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = React.createContext<AccordionItemContextType | null>(
  null,
);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const ctx = React.useContext(AccordionContext);
  const isOpen = ctx ? ctx.openItems.includes(value) : false;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "rounded-2xl border border-slate-200/90 bg-white transition-all overflow-hidden",
          isOpen ? "shadow-sm border-indigo-200" : "hover:border-slate-300",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  if (!itemCtx) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const { value, isOpen } = itemCtx;

  return (
    <h3 className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
        onClick={() => ctx?.toggleItem(value)}
        className={cn(
          "flex flex-1 items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-800 transition-all hover:text-indigo-600 cursor-pointer group",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-transform duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600",
            isOpen && "rotate-180 bg-indigo-50 text-indigo-600",
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
    </h3>
  );
}

interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const itemCtx = React.useContext(AccordionItemContext);
  if (!itemCtx) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const { isOpen } = itemCtx;

  if (!isOpen) return null;

  return (
    <div
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5 animate-in fade-in-50 duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
