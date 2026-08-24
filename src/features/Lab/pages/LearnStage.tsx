import { BookOpen, Lightbulb, ExternalLink, ArrowLeft, Sparkles, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLearnStagePage } from "../hooks/useLearnStagePage";
import { ResourceButton, EmptyPanel, PanelShell, LoadingPanel } from "../components/LearnStageUI";

export default function LearnStage(props: any) {
  const p = useLearnStagePage(props);
  const { t, isRtl, navigate, session, loading, activeTab, setActiveTab, commentary, commentaryLoading } = p;
  const tabs = [
    { id: "commentary", label: "Commentary", icon: BookOpen },
    { id: "resources", label: "Resources", icon: ExternalLink },
    { id: "notes", label: "My Notes", icon: FileText },
  ];
  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-all">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">Learn Stage</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stage 3 of 4</p>
          </div>
          <Badge variant="outline" className="text-[10px]">Learn</Badge>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold transition-all",
                  activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <Icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            );
          })}
        {/* Commentary Tab */}
        {activeTab === "commentary" && (
          <PanelShell title="Commentary" subtitle="Read the study commentary for this passage">
            {commentaryLoading ? <LoadingPanel color="violet" /> : commentary ? (
              <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-line">{commentary}</div>
            ) : (
              <EmptyPanel icon={<BookOpen className="w-8 h-8 text-muted-foreground/30" />} title="No commentary available" message="Commentary for this passage will appear here once loaded." />
            )}
          </PanelShell>
        )}
        {/* Resources Tab */}
        {activeTab === "resources" && (
          <PanelShell title="Resources" subtitle="Additional study materials and references">
            <div className="space-y-2">
              <ResourceButton icon={<Globe className="w-4 h-4" />} label="Cross References" sublabel="Related passages" color="bg-blue-100 text-blue-700" />
              <ResourceButton icon={<Lightbulb className="w-4 h-4" />} label="Word Studies" sublabel="Original language insights" color="bg-amber-100 text-amber-700" />
              <ResourceButton icon={<Sparkles className="w-4 h-4" />} label="Historical Context" sublabel="Background information" color="bg-emerald-100 text-emerald-700" />
            </div>
        {/* Notes Tab */}
        {activeTab === "notes" && (
          <PanelShell title="My Notes" subtitle="Write your personal study notes">
            <textarea placeholder="Write your notes here..." className="w-full min-h-[200px] p-3 rounded-xl border border-border/50 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />Back
          </Button>
      </div>
    </div>
  );
}
