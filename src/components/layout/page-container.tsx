import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: "default" | "wide" | "full";
}

const widths = {
  default: "max-w-container",
  wide: "max-w-[1480px]",
  full: "max-w-none",
};

export function PageContainer({
  width = "default",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 md:px-6 lg:px-12", widths[width], className)}
      {...props}
    >
      {children}
    </div>
  );
}
