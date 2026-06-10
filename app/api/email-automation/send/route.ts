import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getContactsFromSheet,
  ContactData,
} from "@/app/(root)/services/read-excel-data";
import {
  sendEmailsBatch,
  EmailSendResult,
} from "@/app/(root)/services/emailSender";
import { SenderConfig } from "@/app/(root)/services/emailTemplates";
import {
  loadEmailAttachments,
  getAttachmentsForResend,
} from "@/app/(root)/services/attachmentService";

export const maxDuration = 300; // 5 minutes for batch processing

/**
 * POST /api/email-automation/send
 * Body: {
 *   range?: string,
 *   from: string,
 *   senderConfig: SenderConfig,
 *   useAttachments?: boolean,
 *   delayMs?: number,
 *   maxRetries?: number,
 *   stopOnError?: boolean,
 * }
 *
 * Streams a simple progress log via Server-Sent Events so the UI can
 * render live progress for each email in the batch.
 */
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    range?: string;
    from: string;
    senderConfig: SenderConfig;
    useAttachments?: boolean;
    delayMs?: number;
    maxRetries?: number;
    stopOnError?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const {
    range = "Sheet1!A:Z",
    from,
    senderConfig,
    useAttachments = false,
    delayMs,
    maxRetries = 3,
    stopOnError = false,
  } = body;

  if (!from) {
    return NextResponse.json(
      { success: false, error: "Missing `from` email address" },
      { status: 400 }
    );
  }
  if (!senderConfig || !senderConfig.name || !senderConfig.email) {
    return NextResponse.json(
      { success: false, error: "Missing senderConfig.name / senderConfig.email" },
      { status: 400 }
    );
  }

  // Pull contacts
  let contacts: ContactData[] = [];
  try {
    contacts = await getContactsFromSheet(range);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `Failed to read sheet: ${message}` },
      { status: 500 }
    );
  }

  if (contacts.length === 0) {
    return NextResponse.json(
      { success: false, error: "No valid contacts found in the sheet" },
      { status: 400 }
    );
  }

  // Load attachments
  let attachments: Array<{ filename: string; content: string }> = [];
  if (useAttachments) {
    try {
      const loaded = loadEmailAttachments();
      attachments = getAttachmentsForResend(loaded);
      if (attachments.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Attachments requested but no PDF files were found in /files (CV.pdf, Transcript.pdf)",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { success: false, error: `Failed to load attachments: ${message}` },
        { status: 500 }
      );
    }
  }

  // Use Server-Sent Events to stream progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("start", { total: contacts.length, attachments: attachments.length });

      const result = await sendEmailsBatch(
        contacts,
        senderConfig,
        from,
        attachments,
        {
          delayMs,
          maxRetries,
          stopOnError,
          onProgress: (completed, total) => {
            send("progress", { completed, total });
          },
        }
      );

      // Send per-email detail events
      result.results.forEach((r: EmailSendResult, i: number) => {
        send("email", {
          index: i + 1,
          name: r.contact.Name,
          email: r.contact.Email,
          company: r.contact.Company,
          role: r.contact.Role,
          success: r.success,
          messageId: r.messageId,
          error: r.error,
        });
      });

      send("done", {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
