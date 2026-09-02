import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/Routes/routes";

interface Props {
  navigate: (path: string) => void;
}

export function ActionButtons({ navigate }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
      <Button size="lg" className="w-full" onClick={() => navigate(routes.register.path)}>
        Create Account <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <Button variant="outline" size="lg" className="w-full" onClick={() => navigate(routes.login.path)}>
        Sign In
      </Button>
    </div>
  );
}
