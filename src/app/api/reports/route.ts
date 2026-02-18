import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason, details, novelId, commentId } = await req.json();

  if (!reason) return NextResponse.json({ error: "Reason required" }, { status: 400 });

  try {
    const report = await prisma.report.create({
      data: {
        reason,
        details,
        userId: session.user.id,
        novelId: novelId || null,
        commentId: commentId || null,
      }
    });
    return NextResponse.json(report);
  } catch (error) {
    console.error("Report creation failed:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
