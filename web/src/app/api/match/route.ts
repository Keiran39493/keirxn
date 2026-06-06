import { NextResponse } from "next/server";
import { findMatches } from "@/lib/matcher";
import type { QuizAnswers } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuizAnswers;

    if (!body.sectors?.length) {
      return NextResponse.json(
        { detail: "At least one sector must be selected" },
        { status: 422 },
      );
    }

    const results = findMatches(body, 5);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }
}
