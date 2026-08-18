"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left w-full">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export function DropdownMenuTrigger({
  asChild = false,
  className,
  children,
  ...props
}: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return null;

  const handleClick = (e: React.MouseEvent) => {
    context.setOpen(!context.open);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props?.onClick?.(e);
        handleClick(e);
      },
      className: cn(child.props?.className, className),
      ...props,
    });
  }

  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center cursor-pointer", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export function DropdownMenuContent({
  align = "start",
  side = "bottom",
  sideOffset,
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-all animate-in fade-in-80 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
        align === "end" ? "right-0" : "left-0",
        side === "right" && "left-full top-0 ml-2 mt-0",
        side === "top" && "bottom-full mb-2 mt-0",
        side === "left" && "right-full top-0 mr-2 mt-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function DropdownMenuItem({
  asChild = false,
  className,
  children,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);

  const baseClasses = cn(
    "relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    className
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      className: cn(baseClasses, child.props?.className),
      onClick: (e: React.MouseEvent) => {
        child.props?.onClick?.(e);
        handleClick(e as any);
      },
      ...props,
    });
  }

  return (
    <div
      className={baseClasses}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function DropdownMenuSeparator({
  asChild,
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted bg-zinc-200 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}
