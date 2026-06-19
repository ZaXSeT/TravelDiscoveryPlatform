import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        centered && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-prose", centered && "mx-auto")}>
        {eyebrow && (
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-accent-goldText">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
