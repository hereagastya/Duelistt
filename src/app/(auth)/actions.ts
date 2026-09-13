"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { safeDestination } from "@/lib/routes";

export type AuthState = { error: string | null; message?: string | null };

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    timezone: String(formData.get("timezone") ?? "") || "UTC",
    next: String(formData.get("next") ?? "/today"),
  };
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, next } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase returns the same message for a wrong password and an unknown
    // address, by design. Do not invent a more specific one -- it would leak
    // which addresses have accounts.
    return { error: "That email and password do not match an account." };
  }

  revalidatePath("/", "layout");
  redirect(safeDestination(next));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password, timezone } = readCredentials(formData);

  if (!email) return { error: "Enter your email address." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  // The profile row is created by the on_auth_user_created trigger, which cannot
  // know the browser's timezone. Write it now, while we have it, so the first
  // digest lands at 7am local rather than 7am UTC.
  if (data.session) {
    await supabase.from("profiles").update({ timezone }).eq("id", data.user!.id);
    revalidatePath("/", "layout");
    redirect("/today");
  }

  // Email confirmation is on: there is no session yet.
  return {
    error: null,
    message: `Check ${email} for a confirmation link. Your 7-day trial starts once you confirm.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
