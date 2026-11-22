"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { submitRate, approveSubmission, rejectSubmission, toggleSourceAutoPublish, updateUserRole, submitPrizeBondWinners, approveWinnerSubmission, rejectWinnerSubmission } from "@/lib/data/admin";
import { savePost, deletePost, type PostInput } from "@/lib/data/posts";
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

export async function submitPrizeBondWinnersAction(
  drawId: string,
  prizeTier: number,
  prizeAmount: string,
  bondNumbersText: string,
  sourceId: string
): Promise<{ error?: string }> {
  const bondNumbers = bondNumbersText
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter(Boolean);
  if (!drawId) return { error: "Select a draw first." };
  if (bondNumbers.length === 0) return { error: "Enter at least one winning bond number." };
  try {
    await submitPrizeBondWinners(drawId, prizeTier, prizeAmount, bondNumbers, sourceId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Winners submit failed." };
  }
  revalidatePath("/admin/prize-bonds");
  return {};
}

export async function approveWinnerSubmissionAction(submissionId: string): Promise<{ error?: string }> {
  try {
    await approveWinnerSubmission(submissionId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Approve failed." };
  }
  revalidatePath("/admin/prize-bonds");
  revalidatePath("/prize-bonds");
  revalidatePath("/");
  return {};
}

export async function rejectWinnerSubmissionAction(submissionId: string, notes: string): Promise<{ error?: string }> {
  try {
    await rejectWinnerSubmission(submissionId, notes);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Reject failed." };
  }
  revalidatePath("/admin/prize-bonds");
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

export async function savePostAction(input: PostInput): Promise<{ error?: string }> {
  try {
    await savePost(input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Save failed." };
  }
  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/blog");
  revalidatePath("/");
  return {};
}

export async function deletePostAction(id: string): Promise<{ error?: string }> {
  try {
    await deletePost(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Delete failed." };
  }
  revalidatePath("/admin/posts");
  revalidatePath("/news");
  revalidatePath("/blog");
  revalidatePath("/");
  return {};
}
