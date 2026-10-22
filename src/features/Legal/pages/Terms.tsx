import LegalPage from "../components/LegalPage";
import { TERMS_OF_SERVICE } from "../content/legal";

export default function Terms() {
  return <LegalPage document={TERMS_OF_SERVICE} title="Terms of Service" />;
}
