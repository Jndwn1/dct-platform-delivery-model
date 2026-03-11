// PlaceholderPage — for nav items not yet fully implemented
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-64 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ background: "oklch(0.92 0.04 264)" }}>
        <Construction size={22} style={{ color: "oklch(0.28 0.12 264)" }} />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      <p className="text-xs text-muted-foreground mt-3 italic">
        This module is part of the DCT Platform Executive Demo Environment. Full implementation coming in a future sprint.
      </p>
    </div>
  );
}
