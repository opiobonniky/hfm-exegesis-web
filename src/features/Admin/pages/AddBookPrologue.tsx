// AddBookPrologue — thin page composing hook + components (no inline HTML).
// Handles both create and edit (edit derives from the :bookName route param).
"use client";

import { useAddBookPrologue } from "../hooks/useAddBookPrologue";
import { AddBookProloguePageLayout } from "../components/AddBookProloguePageLayout";

export default function AddBookProloguePage() {
  const { data, actions } = useAddBookPrologue();

  return <AddBookProloguePageLayout data={data} actions={actions} />;
}
