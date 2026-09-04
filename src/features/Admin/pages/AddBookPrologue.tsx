// AddBookPrologue — thin page composing hook + components (no inline HTML).
// Handles both create and edit (edit derives from the :bookName route param).
"use client";

import { useAddBookPrologue } from "../hooks/useAddBookPrologue";
import { AddBookProloguePageLayout } from "../components/AddBookProloguePageLayout";
import type { AddBookPrologueModel } from "../types";

export default function AddBookProloguePage() {
  const { data, actions } = useAddBookPrologue();
  const h = { ...data, ...actions } as AddBookPrologueModel;

  return <AddBookProloguePageLayout model={h} />;
}
