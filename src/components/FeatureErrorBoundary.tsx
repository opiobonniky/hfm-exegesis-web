import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  featureName?: string;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Feature-level error boundary. Wraps individual features/pages
 * so one broken feature doesn't crash the entire app.
 *
 * Usage:
 * ```tsx
 * <FeatureErrorBoundary featureName="Daily Verse">
 *   <DailyVersePage />
 * </FeatureErrorBoundary>
 * ```
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[FeatureErrorBoundary:${this.props.featureName || "Feature"}] Caught error:`, error.message, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const { error, errorInfo } = this.state;
      const { featureName, showDetails = true } = this.props;

      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 ring-1 ring-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">
            {featureName ? `${featureName} failed to load` : "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm">
            {featureName
              ? `The ${featureName} section encountered an error. You can try reloading or go back.`
              : "This section failed to load. This may be due to a temporary issue."}
          </p>
          <div className="flex items-center gap-2.5">
            <Button variant="default" size="sm" onClick={this.handleRetry} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
            <Button variant="outline" size="sm" onClick={this.handleGoBack} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Go Back
            </Button>
          </div>
          {showDetails && error && (
            <details className="mt-5 max-w-lg w-full">
              <summary className="text-[11px] text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors flex items-center gap-1">
                <Bug className="w-3 h-3" /> Error details
              </summary>
              <pre className="mt-2 text-[10px] text-left text-destructive/70 bg-muted/30 p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap">
                {error.message}
                {errorInfo?.componentStack && `\n\nComponent Stack:\n${errorInfo.componentStack}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
