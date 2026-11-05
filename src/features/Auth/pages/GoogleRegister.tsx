import { useNavigate } from "react-router-dom";
import { useGoogleRegisterPage } from "../hooks/useGoogleRegisterPage";
import { GoogleRegisterWrapper, GoogleRegisterForm, GoogleRegisterHeader, GoogleRegisterEmailCard, GoogleRegisterFooter } from "../components";
import { tt } from "@/components/languages/hardcodedTranslate";

export default function GoogleRegister() {
  const model = useGoogleRegisterPage(); const { data: p } = model; const navigate = useNavigate();
  return <GoogleRegisterWrapper isRtl={p.isRtl}>
    <GoogleRegisterHeader photoUrl={p.profilePhoto || p.state?.photoUrl || ""} firstName={p.state?.firstName || ""} lastName={p.state?.lastName || ""} welcomeText={tt("Complete your Google account")} description={tt(p.state?.registrationProof ? "Your Google identity is verified. Add your profile and secure your account." : "Sign in with Google to continue creating your account.")} />
    {p.state?.email && <GoogleRegisterEmailCard email={p.state.email} firstName={p.state.firstName || ""} lastName={p.state.lastName || ""} />}
    <GoogleRegisterForm model={model} />
    <GoogleRegisterFooter label={tt("Use different account")} onClick={() => navigate("/login")} />
  </GoogleRegisterWrapper>;
}
