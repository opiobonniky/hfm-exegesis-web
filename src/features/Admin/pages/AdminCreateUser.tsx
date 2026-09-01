// AdminCreateUser — thin page composing hook + components (no inline HTML)
"use client";

import { useAdminCreateUser } from "../hooks/useAdminCreateUser";
import { CreateUserHeader } from "../components/CreateUserHeader";
import { CreateUserForm } from "../components/CreateUserForm";
import { AdminPageContent } from "../components/AdminPageContent";

export default function AdminCreateUser() {
  const h = useAdminCreateUser();

  return (
    <div className="min-h-screen bg-background">
      <CreateUserHeader onBack={h.handleCancel} />
      <AdminPageContent className="max-w-2xl space-y-4 sm:space-y-6">
        <CreateUserForm
          form={h.form}
          errors={h.errors}
          saving={h.saving}
          updateField={h.updateField}
          onSubmit={h.handleSubmit}
          onCancel={h.handleCancel}
        />
      </AdminPageContent>
    </div>
  );
}
