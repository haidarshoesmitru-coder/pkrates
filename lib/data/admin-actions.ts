"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { submitRate, approveSubmission, rejectSubmission, toggleSourceAutoPublish, updateUserRole } from "@/lib/data/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function submitRateAction(domain: string, values: Record<string, string>, sourceId: string): Promise<{ error?: string }> {
  try {
    await submitRate(domain, values, sourceId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Submit failed." };
  }
  revalidatePath(`/admin/${domain}`);
  return {};
}

export async function approveSubmissionAction(domain: string, submissionId: string): Promise<{ error?: string }> {
  try {
    await approveSubmission(domain, submissionId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Approve failed." };
  }
  revalidatePath(`/admin/${domain}`);
  revalidatePath(`/${domain}`);
  revalidatePath("/");
  return {};
}

export async function rejectSubmissionAction(domain: string, submissionId: string, notes: string): Promise<{ error?: string }> {
  try {
    await rejectSubmission(domain, submissionId, notes);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Reject failed." };
  }
  revalidatePath(`/admin/${domain}`);
  return {};
}

export async function toggleSourceAutoPublishAction(sourceId: string, allow: boolean) {
  await toggleSourceAutoPublish(sourceId, allow);
  revalidatePath("/admin/sources");
}

export async function updateUserRoleAction(userId: string, roleName: string) {
  await updateUserRole(userId, roleName);
  revalidatePath("/admin/users");
}
