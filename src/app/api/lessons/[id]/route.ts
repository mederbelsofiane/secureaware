import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, orgOrGlobalWhere } from "@/lib/server-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, order: true },
            },
          },
        },
        lessonProgress: {
          where: { userId: session.id },
          take: 1,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify the lesson's module belongs to user's org or is global
    if (session.organizationId) {
      const moduleOrg = lesson.module.organizationId;
      const isGlobal = lesson.module.isGlobal;
      if (moduleOrg !== session.organizationId && !isGlobal) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
    }

    const allLessons = lesson.module.lessons;
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      content: lesson.content,
      durationMins: lesson.durationMins,
      order: lesson.order,
      moduleId: lesson.moduleId,
      moduleTitle: lesson.module.title,
      totalLessons: allLessons.length,
      isCompleted: lesson.lessonProgress.length > 0 && lesson.lessonProgress[0].isCompleted,
      prevLesson,
      nextLesson,
      allLessons,
    });
  } catch (error) {
    console.error("Lesson fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
