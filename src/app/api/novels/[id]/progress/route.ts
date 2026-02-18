import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const progress = await prisma.readingProgress.findUnique({
      where: {
        userId_novelId: {
          userId: session.user.id,
          novelId: id,
        },
      },
    });

    return NextResponse.json(progress || { page: 1, status: "READING" });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { page, status } = body;

  try {
    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_novelId: {
          userId: session.user.id,
          novelId: id,
        },
      },
      update: {
        page,
        status: status || "READING",
      },
      create: {
        userId: session.user.id,
        novelId: id,
        page,
        status: status || "READING",
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
