// useAdminCreateUser — form state + submit for admin create user
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  userRole: number; // 1 = Admin, 2 = User
}

const INITIAL_FORM: CreateUserForm = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  gender: "Not specified",
  dateOfBirth: "",
  userRole: 2,
};

export function useAdminCreateUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<CreateUserForm>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: keyof CreateUserForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = "Username is required";
    if (form.username.length < 3) errs.username = "Username must be at least 3 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await sendPostRequest("admin", "create-user", {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        userRole: form.userRole,
      });
      if (res.returnCode === 201 || res.returnCode === 200) {
        toast({ title: "User created successfully" });
        navigate("/admin/users");
      } else {
        toast({ title: "Failed to create user", description: res.returnMessage, variant: "destructive" });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.returnMessage || "Failed to create user";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [form, validate, toast, navigate]);

  return {
    form,
    updateField,
    saving,
    errors,
    handleSubmit,
    handleCancel: () => navigate("/admin/users"),
  };
}
