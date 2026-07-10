import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onChange, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  const handleInput = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (innerRef.current) {
      innerRef.current.style.height = "auto";
      innerRef.current.style.height = `${innerRef.current.scrollHeight + 2}px`;
    }
    onChange?.(e);
  }, [onChange]);

  React.useEffect(() => {
    if (innerRef.current) {
      innerRef.current.style.height = "auto";
      innerRef.current.style.height = `${innerRef.current.scrollHeight + 2}px`;
    }
  }, [props.value, props.defaultValue]);

  return (
    <textarea
      ref={innerRef}
      onChange={handleInput}
      className={cn(
        "flex min-h-[8rem] w-full resize-none overflow-hidden rounded-md border border-input bg-surface px-3 py-2 text-base text-foreground shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
