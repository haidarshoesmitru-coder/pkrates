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

export async function submitRateAction(domain: string, values: Record<string, string>, sourceId: string) {
  await submitRate(domain, values, sourceId);
  revalidatePath(`/admin/${domain}`);
}

export async function approveSubmissionAction(domain: string, submissionId: string) {
  await approveSubmission(domain, submissionId);
  revalidatePath(`/admin/${domain}`);
  revalidatePath(`/${domain}`);
  revalidatePath("/");
}

export async function rejectSubmissionAction(domain: string, submissionId: string, notes: string) {
  await rejectSubmission(domain, submissionId, notes);
  revalidatePath(`/admin/${domain}`);
}

export async function toggleSourceAutoPublishAction(sourceId: string, allow: boolean) {
  await toggleSourceAutoPublish(sourceId, allow);
  revalidatePath("/admin/sources");
}

export async function updateUserRoleAction(userId: string, roleName: string) {
  await updateUserRole(userId, roleName);
  revalidatePath("/admin/users");
}
