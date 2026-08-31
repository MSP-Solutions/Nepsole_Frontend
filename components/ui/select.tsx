"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Select<Value = any, Multiple extends boolean | undefined = false>({
  ...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  className,
  ...props
}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("p-1", className)}
      {...props}
    />
  );
}

function SelectValue({
  className,
  placeholder,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("line-clamp-1 text-sm text-foreground", className)}
      placeholder={placeholder}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none cursor-pointer focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[placeholder]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="size-4 shrink-0 opacity-50 flex items-center justify-center">
        <ChevronDownIcon className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  sideOffset = 4,
  ...props
}: SelectPrimitive.Popup.Props & { sideOffset?: number }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={sideOffset} className="z-50 min-w-[var(--anchor-width)]">
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "relative max-h-60 min-w-[8rem] overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md transition-all animate-in fade-in-80 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex size-3.5 items-center justify-center">
        <CheckIcon className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
