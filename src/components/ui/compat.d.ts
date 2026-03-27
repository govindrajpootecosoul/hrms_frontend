declare module "@/components/ui/tabs" {
  import * as React from "react";

  export const Tabs: React.ComponentType<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children?: React.ReactNode;
  }>;
  export const TabsList: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const TabsTrigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> &
      React.RefAttributes<HTMLButtonElement> & { value: string }
  >;
  export const TabsContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> &
      React.RefAttributes<HTMLDivElement> & { value: string }
  >;
}

declare module "@/components/ui/select" {
  import * as React from "react";

  export const Select: React.ComponentType<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }>;
  export const SelectGroup: React.ComponentType<{ children?: React.ReactNode }>;
  export const SelectValue: React.ComponentType<{ placeholder?: string }>;
  export const SelectTrigger: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
  >;
  export const SelectContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;
  export const SelectItem: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement> & { value: string }
  >;
}

declare module "@/components/ui/button" {
  import * as React from "react";

  export const Button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> &
      React.RefAttributes<HTMLButtonElement> & {
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
        size?: "default" | "sm" | "lg" | "icon";
        asChild?: boolean;
      }
  >;
}

declare module "@/components/ui/badge" {
  import * as React from "react";

  export const Badge: React.ComponentType<
    React.HTMLAttributes<HTMLDivElement> & {
      variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
    }
  >;
}

declare module "@/components/ui/input" {
  import * as React from "react";

  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;
}

declare module "@/components/ui/label" {
  import * as React from "react";

  export const Label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module "@/components/ui/textarea" {
  import * as React from "react";

  export const Textarea: React.ForwardRefExoticComponent<
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & React.RefAttributes<HTMLTextAreaElement>
  >;
}

declare module "@/components/ui/calendar" {
  import * as React from "react";

  export const Calendar: React.ComponentType<Record<string, unknown> & { className?: string }>;
}

declare module "@/components/ui/popover" {
  import * as React from "react";

  export const Popover: React.ComponentType<{ children?: React.ReactNode }>;
  export const PopoverTrigger: React.ComponentType<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; children?: React.ReactNode }
  >;
  export const PopoverContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> &
      React.RefAttributes<HTMLDivElement> & {
        align?: "start" | "center" | "end";
        sideOffset?: number;
      }
  >;
}
