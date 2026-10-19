import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = `${process.cwd()}/`;
const readProjectFile = (path: string) => readFileSync(`${root}${path}`, "utf8");

describe("Firebase web migration", () => {
  it("keeps the app and unified service worker on the target project", () => {
    const appConfig = readProjectFile("src/firebaseConfiguration/config.ts");
    const serviceWorker = readProjectFile("public/sw.js");
    const sharedValues = [
      "AIzaSyDb7YnYD4e-yGpUr8yXrR4ayIswk-A0QCQ",
      "exegesis-bd116.firebaseapp.com",
      "exegesis-bd116",
      "exegesis-bd116.firebasestorage.app",
      "683836491679",
      "1:683836491679:web:709b41503c6e2a8ef11faa",
    ];

    for (const value of sharedValues) {
      expect(appConfig).toContain(value);
      expect(serviceWorker).toContain(value);
    }
    expect(appConfig).toContain("G-ME331TJNRE");
  });

  it("uses only the root app worker and project-scoped token cache", () => {
    const pushService = readProjectFile("src/services/pushService.ts");
    const packageJson = JSON.parse(readProjectFile("package.json"));

    expect(pushService).toContain('register("/sw.js")');
    expect(pushService).toContain("`${LEGACY_TOKEN_CACHE_KEY}:${firebaseConfig.projectId}`");
    expect(existsSync(`${root}public/firebase-messaging-sw.js`)).toBe(false);
    expect(packageJson.dependencies).not.toHaveProperty("@react-oauth/google");
  });

  it("processes popup login results and signs out both auth systems", () => {
    const loginHook = readProjectFile("src/features/Auth/hooks/useLoginPage.ts");
    const registrationHook = readProjectFile("src/features/Auth/hooks/useGoogleRegisterPage.ts");
    const authContext = readProjectFile("src/contexts/AuthContext.tsx");

    expect(loginHook).toContain("await processGoogleResult(result)");
    expect(loginHook).toContain("registrationProof: returnData.registrationProof");
    expect(registrationHook).toContain('"complete-google-registration"');
    expect(registrationHook).toContain("registrationProof: state?.registrationProof");
    expect(registrationHook).not.toContain("googleId");
    expect(authContext).toContain("Promise.allSettled([disableWebPush(), signOut(auth)])");
  });
});
