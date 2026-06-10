import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getContactsFromSheet } from "@/app/(root)/services/read-excel-data";

/**
 * POST /api/email-automation/preview
 * Body: { range?: string }
 * Returns: parsed contacts from the configured Google Sheet.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_SHEET_ID) {
      return NextResponse.json(
        { error: "GOOGLE_SHEET_ID is not configured" },
        { status: 500 }
      );
    }

    let body: { range?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const range = (body.range || "Sheet1!A:Z").trim();
    const contacts = await getContactsFromSheet(range);

    return NextResponse.json({
      success: true,
      range,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error("[email-automation/preview] error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
