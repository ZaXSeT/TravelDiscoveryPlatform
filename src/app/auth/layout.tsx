export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 pb-20 pt-28 md:pt-32">
      <div className="rounded-lg border border-border bg-card p-6 shadow-soft md:p-8">
        {children}
      </div>
    </div>
  );
}
