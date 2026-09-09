// Login — thin compositor using a page hook and focused render components
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { useLoginPage } from "../hooks/useLoginPage";
import { LoginBrandedPanel, LoginFormContent } from "../components";

export default function Login() {
  const { data, actions } = useLoginPage();
  const p = { ...data, ...actions };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden" dir={p.isRtl ? "rtl" : "ltr"}>
      <LoginBrandedPanel
        isRtl={p.isRtl}
        taglineStart={p.taglineStart}
        taglineEnd={p.taglineEnd}
        wordLabel={p.wordLabel}
        quote={p.quote}
        attribution={p.attribution}
      />
      <LoginFormContent
        p={p}
        logoSrc={logoImage}
      />
    </div>
  );
}
