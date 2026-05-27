import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/components/languages/languageProvider";

const NotFound = () => {
  const location = useLocation();
  const { t, isRtl } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">
          {t.error?.notFound || "404"}
        </h1>
        <p className="mb-4 text-xl text-muted-foreground">
          {t.error?.pageNotFound || "Oops! Page not found"}
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {t.common?.goHome || "Return to Home"}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
