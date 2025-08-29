import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, className, children }: PageHeaderProps) {
  return (
    <header className={cn("px-4 pt-6 pb-4 sm:px-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-headline">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children && <div className="ml-4">{children}</div>}
      </div>
    </header>
  );
}
