import { NextResponse } from "next/server";
import { searchBondNumber } from "@/lib/data/prize-bonds";

/**
 * Public bond-number search: GET /api/prize-bonds/search?number=290479
 * Returns every published win for that bond number across all
 * denominations and draws. Reads through the anon/RLS client —
 * prize_bond_winners has a public select policy.
 */
export async function GET(request: Request) {
  const number = new URL(request.url).searchParams.get("number") ?? "";
  const digits = number.replace(/\D/g, "");
  if (digits.length < 4 || digits.length > 10) {
    return NextResponse.json(
      { error: "Please enter a valid bond number (digits only)." },
      { status: 400 }
    );
  }

  try {
    const results = await searchBondNumber(digits);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[prize-bonds search error]", err);
    return NextResponse.json(
      { error: "Search is not available right now — please try again later." },
      { status: 503 }
    );
  }
}
