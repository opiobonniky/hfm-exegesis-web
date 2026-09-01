// GoogleRegister — thin compositor using shared Auth components
import { useNavigate } from "react-router-dom";
import { useGoogleRegisterPage } from "../hooks/useGoogleRegisterPage";
import {
  GoogleRegisterWrapper,
  GoogleRegisterForm, GoogleRegisterHeader, GoogleRegisterEmailCard, GoogleRegisterFooter,
} from "../components";

const GoogleRegister = () => {
  const p = useGoogleRegisterPage();
  const {
    t, isRtl, state, phoneNumber, setPhoneNumber,
    username, setUsername, password, setPassword,
    confirmPassword, setConfirmPassword, showPassword, setShowPassword,
    passwordMismatch, loading, error, handleRegister,
  } = p;
  const navigate = useNavigate();

  const firstName = state?.firstName || "";
  const lastName = state?.lastName || "";
  const email = state?.email || "";
  const photoUrl = state?.photoUrl || "";

  return (
    <GoogleRegisterWrapper isRtl={isRtl}>
      <GoogleRegisterHeader
        photoUrl={photoUrl} firstName={firstName} lastName={lastName}
        welcomeText={(t.auth?.welcomeUser || "Welcome, {name}!").replace("{name}", firstName)}
        description={t.auth?.completeRegistrationDesc || "Complete your registration to get started"}
      />

      <GoogleRegisterEmailCard email={email} firstName={firstName} lastName={lastName} />

      <GoogleRegisterForm
        t={t} email={email} firstName={firstName} lastName={lastName}
        username={username} setUsername={setUsername} password={password} setPassword={setPassword}
        confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
        showPassword={showPassword} setShowPassword={setShowPassword}
        passwordMismatch={passwordMismatch} loading={loading} error={error}
        handleRegister={handleRegister}
      />

      <GoogleRegisterFooter label={t.auth?.useDifferentAccount || "Use different account"} onClick={() => navigate("/login")} />
    </GoogleRegisterWrapper>
  );
};

export default GoogleRegister;
