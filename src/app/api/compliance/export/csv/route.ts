import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOrgRole, unauthorized, forbidden, noOrganization, serverError } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireOrgRole(["ADMIN", "SUPER_ADMIN"]);
    const orgId = user.organizationId!;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    const hasDateFilter = !!(from || to);

    const userWhere: any = { organizationId: orgId, status: "ACTIVE" };
    if (userId) userWhere.id = userId;

    const users = await prisma.user.findMany({
      where: userWhere,
      include: {
        department: { select: { name: true } },
        moduleProgress: {
          where: hasDateFilter ? { completedAt: dateFilter } : undefined,
          include: { module: { select: { title: true } } },
        },
        quizResults: {
          where: hasDateFilter ? { createdAt: dateFilter } : undefined,
          include: { quiz: { select: { title: true } } },
        },
        phishingEvents: {
          where: hasDateFilter ? { createdAt: dateFilter } : undefined,
        },
        certificates: {
          where: hasDateFilter ? { issuedAt: dateFilter } : undefined,
        },
      },
      orderBy: { name: "asc" },
    });

    // Build CSV
    const headers = [
      "Name", "Email", "Department", "Role", "Join Date",
      "Modules Completed", "Total Modules Assigned", "Module Completion %",
      "Quizzes Passed", "Total Quizzes", "Avg Quiz Score", "Quiz Pass %",
      "Phishing Simulations", "Phishing Clicked", "Phishing Reported",
      "Certificates Earned", "Compliance Score",
    ];

    const escCsv = (v: string) => {
      if (v.includes(",") || v.includes("\"") || v.includes("\n")) {
        return `"${v.replace(/"/g, "\"\"")}"` ;
      }
      return v;
    };

    const rows = users.map((u) => {
      const completed = u.moduleProgress.filter((m) => m.isCompleted).length;
      const totalMod = u.moduleProgress.length;
      const modRate = totalMod > 0 ? Math.round((completed / totalMod) * 100) : 0;
      const passed = u.quizResults.filter((q) => q.passed).length;
      const totalQ = u.quizResults.length;
      const avgScore = totalQ > 0 ? Math.round(u.quizResults.reduce((s, q) => s + q.score, 0) / totalQ) : 0;
      const qRate = totalQ > 0 ? Math.round((passed / totalQ) * 100) : 0;
      const phishTotal = u.phishingEvents.length;
      const clicked = u.phishingEvents.filter((e) => e.linkClickedAt).length;
      const reported = u.phishingEvents.filter((e) => e.reportedAt).length;
      const phishScore = phishTotal > 0 ? Math.round(((phishTotal - clicked) / phishTotal) * 100) : 100;
      const overall = Math.round((modRate + qRate + phishScore) / 3);

      return [
        u.name, u.email, u.department?.name || "N/A", u.role,
        u.createdAt.toISOString().split("T")[0],
        completed, totalMod, modRate,
        passed, totalQ, avgScore, qRate,
        phishTotal, clicked, reported,
        u.certificates.length, overall,
      ].map((v) => escCsv(String(v)));
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="compliance-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "UNAUTHORIZED") return unauthorized();
    if (message === "FORBIDDEN") return forbidden();
    if (message === "NO_ORGANIZATION") return noOrganization();
    return serverError();
  }
}