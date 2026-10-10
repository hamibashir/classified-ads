import { MessageSquareDashed, ShieldCheck } from 'lucide-react';

export function ChatEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-card/40">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-2xs">
        <MessageSquareDashed className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-foreground">
        Select a conversation
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
        Choose a chat from the sidebar to view messages, negotiate with buyers or sellers, and agree on deal details.
      </p>

      <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/60 border border-border px-3.5 py-1.5 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>End-to-end verified marketplace chat</span>
      </div>
    </div>
  );
}
