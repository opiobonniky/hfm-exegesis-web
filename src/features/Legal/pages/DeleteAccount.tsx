import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

const CONFIRMATION_WORD = "DELETE";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    password.length > 0 &&
    confirmation.trim().toUpperCase() === CONFIRMATION_WORD &&
    !submitting;

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response: any = await sendPostRequest("auth", "delete-account", {
        password,
        confirmation: CONFIRMATION_WORD,
      });
      if (
        response?.success === false ||
        (typeof response?.returnCode === "number" && response.returnCode >= 400)
      ) {
        setError(
          response?.message ||
            "We could not delete your account. Please try again.",
        );
        return;
      }
      await logout();
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "We could not delete your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-12 sm:px-8">
      <Link
        to="/settings"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Delete account
      </h1>

      <div className="mt-6 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <p className="text-sm leading-6 text-muted-foreground">
          This permanently closes your account. Your journals, notes,
          highlights and favourites will be removed, any active subscription
          will be cancelled, and you will be signed out. Billing records may be
          kept where the law requires it. This cannot be undone.
        </p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) void handleDelete();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="delete-password">Enter your password</Label>
          <Input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="delete-confirmation">
            Type {CONFIRMATION_WORD} to confirm
          </Label>
          <Input
            id="delete-confirmation"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={CONFIRMATION_WORD}
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="destructive"
          className="w-full"
          disabled={!canSubmit}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Delete my account"
          )}
        </Button>
      </form>
    </div>
  );
}
