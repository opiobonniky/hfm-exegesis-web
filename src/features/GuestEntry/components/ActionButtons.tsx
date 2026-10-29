import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/Routes/routes";
import { tt } from '@/components/languages/hardcodedTranslate';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  navigate: (path: string) => void;
}

export function ActionButtons({ navigate }: Props) {
  const { startGuest } = useAuth();
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
      <Button variant="outline" size="lg" className="w-full" onClick={startGuest}>{tt("Continue as Guest")}</Button>
      <Button size="lg" className="w-full" onClick={() => navigate(routes.register.path)}>{tt("Create Account")}<ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <Button variant="outline" size="lg" className="w-full" onClick={() => navigate(routes.login.path)}>{tt("Sign In")}</Button>
    </div>
  );
}
