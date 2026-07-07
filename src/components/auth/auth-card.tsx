import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, description, icon, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-primary to-indigo-500" />
      <CardHeader className="text-center pb-4 pt-6">
        {icon && (
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            {icon}
          </div>
        )}
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-6 px-6">
        {children}
      </CardContent>
    </Card>
  );
}
