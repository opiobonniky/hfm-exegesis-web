import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Eye,
  HelpCircle,
  BookOpen,
  Search,
  PenLine,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

// ── Types ──

interface HowToStudySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookName?: string;
  chapter?: number;
  verseRef?: string;
  onMarkRepeatedWords?: () => void;
  onOpenContext?: () => void;
  onSearchBible?: () => void;
  onOpenJournal?: () => void;
}

// ── Step data ──

interface StudyStep {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  questions: string[];
  action: {
    label: string;
    onClick?: () => void;
  } | null;
}

const STEPS: (props: HowToStudySheetProps) => StudyStep[] = (props) => [
  {
    number: 1,
    title: "Observe",
    subtitle: "What does the text say?",
    icon: <Eye className="w-5 h-5" />,
    description:
      "Begin by simply reading the passage. Notice what stands out. Look for repeated words, key phrases, and the flow of the argument.",
    questions: [
      "What words or phrases repeat?",
      "Who is speaking? Who is listening?",
      "What is the tone — command, promise, warning, or comfort?",
      "What characters or parties are mentioned?",
    ],
    action: props.onMarkRepeatedWords
      ? { label: "Mark Repeated Words", onClick: props.onMarkRepeatedWords }
      : null,
  },
  {
    number: 2,
    title: "Ask",
    subtitle: "What questions does the text raise?",
    icon: <HelpCircle className="w-5 h-5" />,
    description:
      "Good questions lead to good understanding. Write down what puzzles you or what you'd like to explore further.",
    questions: [
      "Why did the author include this detail?",
      "What would this have meant to the original audience?",
      "Is there something I don't understand?",
      "What does this reveal about God? About humanity?",
    ],
    action: null,
  },
  {
    number: 3,
    title: "Understand",
    subtitle: "What did this mean then?",
    icon: <BookOpen className="w-5 h-5" />,
    description:
      "Context is key. Use study tools to understand the historical, cultural, and literary background of the passage.",
    questions: [
      "What was the historical context?",
      "What kind of writing is this — narrative, poetry, letter, prophecy?",
      "How did the original audience hear this?",
      "What does the surrounding context tell us?",
    ],
    action: props.onOpenContext
      ? { label: "Open Context", onClick: props.onOpenContext }
      : null,
  },
  {
    number: 4,
    title: "Search",
    subtitle: "What else does Scripture say?",
    icon: <Search className="w-5 h-5" />,
    description:
      "Let Scripture interpret Scripture. Search for cross-references, themes, and how this passage connects to the whole Bible story.",
    questions: [
      "Where else does this theme appear in Scripture?",
      "Are there cross-references I should explore?",
      "How does the New Testament reference or fulfill this?",
      "What does the broader biblical story tell us?",
    ],
    action: props.onSearchBible
      ? { label: "Search the Bible", onClick: props.onSearchBible }
      : null,
  },
  {
    number: 5,
    title: "Apply",
    subtitle: "How should I respond?",
    icon: <PenLine className="w-5 h-5" />,
    description:
      "The goal of Bible study is not just information, but transformation. Let the Word shape your belief, behavior, and prayers.",
    questions: [
      "What should I believe because of this passage?",
      "Is there something I need to obey?",
      "Is there a sin I need to confess?",
      "What can I pray based on this passage?",
    ],
    action: props.onOpenJournal
      ? { label: "Open Journal", onClick: props.onOpenJournal }
      : null,
  },
];

// ── Component ──

export default function HowToStudySheet({
  open,
  onOpenChange,
  bookName,
  chapter,
  verseRef,
  onMarkRepeatedWords,
  onOpenContext,
  onSearchBible,
  onOpenJournal,
}: HowToStudySheetProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = STEPS({
    open,
    onOpenChange,
    bookName,
    chapter,
    verseRef,
    onMarkRepeatedWords,
    onOpenContext,
    onSearchBible,
    onOpenJournal,
  });

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const isStepCompleted = completedSteps.has(currentStep);

  // Reset state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
    onOpenChange(newOpen);
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markComplete = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
  };

  const handleAction = () => {
    if (step.action?.onClick) {
      step.action.onClick();
    }
    markComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step.icon}
            <span>How Do I Study This Passage?</span>
          </DialogTitle>
          <DialogDescription>
            {bookName && chapter && (
              <span className="text-xs font-medium">
                {bookName} {chapter}{verseRef ? `:${verseRef}` : ""}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Step progress indicator */}
        <div className="flex items-center gap-1.5 px-1 py-2">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                if (i <= currentStep || completedSteps.has(i)) {
                  setCurrentStep(i);
                }
              }}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                i === currentStep
                  ? "bg-primary h-2"
                  : completedSteps.has(i)
                    ? "bg-primary/40"
                    : "bg-muted",
              )}
              title={`Step ${s.number}: ${s.title}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="space-y-4 py-2">
          {/* Step header */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
            >
              Step {step.number} of {steps.length}
            </Badge>
            {isStepCompleted && (
              <Badge
                variant="secondary"
                className="text-[10px] font-bold gap-1 px-2 py-0.5"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Completed
              </Badge>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {step.subtitle}
            </p>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">
            {step.description}
          </p>

          {/* Guiding questions */}
          <div className="rounded-lg bg-muted/50 border border-border/50 p-3 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Guiding Questions
            </p>
            <ul className="space-y-1.5">
              {step.questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action button */}
          {step.action && (
            <Button
              onClick={handleAction}
              variant="default"
              size="sm"
              className="w-full gap-1.5 h-9 text-xs font-semibold"
            >
              {step.action.label}
            </Button>
          )}

          {/* Tip for last step */}
          {isLast && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3">
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Tip:</strong> Bible study is a lifelong journey. Return to these
                steps anytime you read a passage. The goal is not speed, but depth — to
                know God and be transformed by His Word.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={isFirst}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {!isStepCompleted && currentStep < steps.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markComplete}
                className="text-xs text-muted-foreground"
              >
                Skip
              </Button>
            )}

            {isLast ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="gap-1 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </Button>
            ) : (
              <Button
                variant={isStepCompleted ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (!isStepCompleted) markComplete();
                  goNext();
                }}
                className="gap-1 text-xs"
              >
                {isStepCompleted ? "Next" : "Mark & Next"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
