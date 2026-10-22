import LegalPage from "../components/LegalPage";
import { PRIVACY_POLICY } from "../content/legal";

export default function Privacy() {
  return <LegalPage document={PRIVACY_POLICY} title="Privacy Policy" />;
}
