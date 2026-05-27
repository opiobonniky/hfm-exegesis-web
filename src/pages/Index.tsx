import { useLanguage } from "@/components/languages/languageProvider";

const Index = () => {
  const { t, isRtl } = useLanguage();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">
          {t.common?.appName || "Welcome"}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t.common?.loading || "Start building your amazing project here!"}
        </p>
      </div>
    </div>
  );
};

export default Index;
