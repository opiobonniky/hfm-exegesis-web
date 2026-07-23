// ── Home Dashboard ───────────────────────────────────────────────────────────
// The user's landing page after login. Shows today's spiritual content:
//   • Daily Verse card
//   • Lordsbook Daily Exegesis card
//   • Daily Devotional card
//   • Bible Trivia card
//   • Continue Reading card (last Bible location)
//   • Continue Exegesis Lab card
//   • Recent Journal Entry preview
//   • Stats (chapters read, highlights, notes, etc.)
//   • Quick action links
//
// This component delegates to UserDashboard which implements the full spec from
// improving-features.md Screen 4: Home Dashboard.
//
// Wireframe (from spec):
//   ------------------------------------------------
//  | Good Morning, [Name]                          |
//  | Today in the Word                             |
//   ------------------------------------------------
//  | Daily Verse Card                              |
//  | Lordsbook Daily Exegesis Card                 |
//  | Daily Devotional Card                         |
//  | Bible Trivia Card                             |
//  | Continue Reading Card                         |
//  | Continue Exegesis Lab Card                    |
//  | Recent Journal Entry preview                  |
//   ------------------------------------------------

import UserDashboard from "./UserDashboard";

export default function Index() {
  return <UserDashboard />;
}
