import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSummary } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, type = "detailed" } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const validTypes = ["brief", "detailed", "bullet_points"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid summary type" }, { status: 400 });
    }

    const summary = await generateSummary(text, type);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
