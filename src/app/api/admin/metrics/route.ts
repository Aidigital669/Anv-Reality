import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    const propCount = await queryOne(`SELECT COUNT(*) as count FROM "Property";`);
    const propPublished = await queryOne(`SELECT COUNT(*) as count FROM "Property" WHERE "publishStatus" = 'Published';`);
    const propDraft = await queryOne(`SELECT COUNT(*) as count FROM "Property" WHERE "publishStatus" = 'Draft';`);
    const projectCount = await queryOne(`SELECT COUNT(*) as count FROM "Project";`);
    const blogCount = await queryOne(`SELECT COUNT(*) as count FROM "Blog";`);
    let enqCountVal = 0;
    try {
      const enqCount = await queryOne(`SELECT COUNT(*) as count FROM "WebsiteEnquiry";`);
      const crmCount = await queryOne(`SELECT COUNT(*) as count FROM crm_leads;`);
      enqCountVal = Math.max(parseInt(enqCount?.count || "0", 10), parseInt(crmCount?.count || "0", 10));
    } catch {
      enqCountVal = 0;
    }
    const mediaCount = await queryOne(`SELECT COUNT(*) as count FROM "Media";`);

    return NextResponse.json({
      success: true,
      metrics: {
        totalProperties: parseInt(propCount?.count || "0", 10),
        publishedProperties: parseInt(propPublished?.count || "0", 10),
        draftProperties: parseInt(propDraft?.count || "0", 10),
        activeProjects: parseInt(projectCount?.count || "0", 10),
        publishedBlogs: parseInt(blogCount?.count || "0", 10),
        publicEnquiries: enqCountVal,
        mediaAssets: parseInt(mediaCount?.count || "0", 10)
      }
    });
  } catch (error: any) {
    console.error("GET /api/admin/metrics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin metrics" },
      { status: 500 }
    );
  }
}
