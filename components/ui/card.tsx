import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white shadow-sm border border-slate-100",
        className
      )}
    >
      {children}
    </div>
  );
}