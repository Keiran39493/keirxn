import { findFundMatches } from "@/lib/fund-matcher";
import type { FundQuizAnswers } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FundQuizAnswers;
    const results = findFundMatches(body);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
