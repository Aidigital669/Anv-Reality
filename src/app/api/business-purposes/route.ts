import { NextRequest, NextResponse } from "next/server";
import { getAllBusinessPurposes } from "@/lib/business-purposes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const purposes = await getAllBusinessPurposes();
    return NextResponse.json({
      success: true,
      count: purposes.length,
      purposes
    });
  } catch (error: any) {
    console.error("GET /api/business-purposes error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
