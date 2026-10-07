import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  try {
    const sections = await query(`
      SELECT 
        id, key, title, subtitle, "sortOrder", "isActive", content,
        "createdAt", "updatedAt"
      FROM "HomepageSection"
      ORDER BY "sortOrder" ASC;
    `);

    return NextResponse.json({
      success: true,
      sections: sections.map((s: any) => ({
        id: `sec-${s.id}`,
        orderNumber: String(s.sortOrder).padStart(2, '0'),
        title: s.title,
        subtitle: s.subtitle,
        isActive: s.isActive,
        key: s.key,
        tag: s.content?.tag || 'HERO',
        tagVariant: s.content?.tagVariant || 'default',
        type: s.content?.type || 'hero'
      }))
    });
  } catch (error: any) {
    console.error("GET /api/admin/sections error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch homepage sections" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sections } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: "Sections array is required." },
        { status: 400 }
      );
    }

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const sortOrder = i + 1;
      const isActive = s.isActive ?? true;

      // Extract raw ID if prefix sec- is present
      const rawId = s.id ? parseInt(String(s.id).replace('sec-', ''), 10) : null;

      if (rawId) {
        await query(`
          UPDATE "HomepageSection"
          SET 
            "sortOrder" = $1,
            "isActive" = $2,
            title = COALESCE($3, title),
            subtitle = COALESCE($4, subtitle),
            "updatedAt" = NOW()
          WHERE id = $5;
        `, [sortOrder, isActive, s.title, s.subtitle, rawId]);
      } else if (s.key) {
        await query(`
          UPDATE "HomepageSection"
          SET 
            "sortOrder" = $1,
            "isActive" = $2,
            "updatedAt" = NOW()
          WHERE key = $3;
        `, [sortOrder, isActive, s.key]);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Homepage section order & configuration saved successfully!"
    });
  } catch (error: any) {
    console.error("PUT /api/admin/sections error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save sections" },
      { status: 500 }
    );
  }
}
