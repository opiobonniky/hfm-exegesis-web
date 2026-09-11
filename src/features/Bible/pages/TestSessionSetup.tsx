// TEMPORARY dev-only page for browser verification of the Bible reader.
// Writes a session into localStorage from query params, then cleans the URL.
import { useEffect } from "react";

export default function TestSessionSetup() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");
    if (token && user) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", user);
    }
    // Skip the first-time BookOverview redirect for verification
    const seen = JSON.parse(
      localStorage.getItem("exegesis_book_overview_seen") || "[]",
    );
    if (!seen.includes("Genesis")) seen.push("Genesis");
    localStorage.setItem(
      "exegesis_book_overview_seen",
      JSON.stringify(seen),
    );
    window.location.replace("/bible-reader?book=Genesis&chapter=2");
  }, []);

  return <div style={{ padding: 40 }}>Setting up test session…</div>;
}
