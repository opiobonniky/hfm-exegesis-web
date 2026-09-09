// AdminCreateUser — thin page composing hook + components (no inline HTML)
"use client";

import { useAdminCreateUser } from "../hooks/useAdminCreateUser";
import { CreateUserHeader } from "../components/CreateUserHeader";
import { CreateUserForm } from "../components/CreateUserForm";
import { AdminPageContent } from "../components/AdminPageContent";

export default function AdminCreateUser() {
  const { data, actions } = useAdminCreateUser();

  return (
    <div className="min-h-screen bg-background">
      <CreateUserHeader onBack={actions.handleCancel} />
      <AdminPageContent className="max-w-2xl space-y-4 sm:space-y-6">
        <CreateUserForm
          form={data.form}
          errors={data.errors}
          saving={data.saving}
          updateField={actions.updateField}
          onSubmit={actions.handleSubmit}
          onCancel={actions.handleCancel}
        />
      </AdminPageContent>
    </div>
  );
}
