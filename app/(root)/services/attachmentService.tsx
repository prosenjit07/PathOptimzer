/**
 * Attachment Service
 * 
 * This service handles loading and encoding PDF attachments (CV and Transcript)
 * for email sending via the Resend API.
 */

import * as fs from "fs";
import * as path from "path";

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded content
  type?: string;
}

export interface AttachmentLoadResult {
  success: boolean;
  attachment?: EmailAttachment;
  error?: string;
}

// Default paths for attachments
const DEFAULT_CV_PATH = path.join(process.cwd(), "files", "CV.pdf");
const DEFAULT_TRANSCRIPT_PATH = path.join(process.cwd(), "files", "Transcript.pdf");

/**
 * Load a file and convert it to base64 encoding
 * @param filePath - Path to the file to load
 * @param filename - Name to use for the attachment
 * @returns AttachmentLoadResult with the encoded attachment or error
 */
export function loadAttachment(
  filePath: string,
  filename: string
): AttachmentLoadResult {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
      };
    }

    // Read file as buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Convert to base64
    const base64Content = fileBuffer.toString("base64");

    // Determine MIME type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let mimeType = "application/octet-stream";

    switch (ext) {
      case ".pdf":
        mimeType = "application/pdf";
        break;
      case ".doc":
        mimeType = "application/msword";
        break;
      case ".docx":
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".jpg":
      case ".jpeg":
        mimeType = "image/jpeg";
        break;
      case ".png":
        mimeType = "image/png";
        break;
    }

    return {
      success: true,
      attachment: {
        filename,
        content: base64Content,
        type: mimeType,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error loading attachment: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Load both CV and Transcript attachments
 * @param cvPath - Path to CV PDF (optional, uses default if not provided)
 * @param transcriptPath - Path to Transcript PDF (optional, uses default if not provided)
 * @returns Object containing load results for both attachments
 */
export function loadEmailAttachments(
  cvPath: string = DEFAULT_CV_PATH,
  transcriptPath: string = DEFAULT_TRANSCRIPT_PATH
): {
  cv: AttachmentLoadResult;
  transcript: AttachmentLoadResult;
} {
  console.log("Loading email attachments...");

  const cvResult = loadAttachment(cvPath, "CV.pdf");
  const transcriptResult = loadAttachment(transcriptPath, "Transcript.pdf");

  // Log results
  if (cvResult.success) {
    console.log(`✓ CV loaded successfully (${cvPath})`);
  } else {
    console.error(`✗ Failed to load CV: ${cvResult.error}`);
  }

  if (transcriptResult.success) {
    console.log(`✓ Transcript loaded successfully (${transcriptPath})`);
  } else {
    console.error(`✗ Failed to load Transcript: ${transcriptResult.error}`);
  }

  return {
    cv: cvResult,
    transcript: transcriptResult,
  };
}

/**
 * Validate that both attachments are loaded successfully
 * @param attachments - Object containing CV and transcript load results
 * @returns boolean indicating if both attachments are valid
 */
export function validateAttachments(attachments: {
  cv: AttachmentLoadResult;
  transcript: AttachmentLoadResult;
}): boolean {
  return attachments.cv.success && attachments.transcript.success;
}

/**
 * Get attachment array for Resend API
 * Extracts attachments in the format required by Resend
 * @param attachments - Object containing CV and transcript load results
 * @returns Array of attachments for Resend API (empty if attachments not loaded)
 */
export function getAttachmentsForResend(attachments: {
  cv: AttachmentLoadResult;
  transcript: AttachmentLoadResult;
}): Array<{ filename: string; content: string }> {
  const resendAttachments: Array<{ filename: string; content: string }> = [];

  if (attachments.cv.success && attachments.cv.attachment) {
    resendAttachments.push({
      filename: attachments.cv.attachment.filename,
      content: attachments.cv.attachment.content,
    });
  }

  if (attachments.transcript.success && attachments.transcript.attachment) {
    resendAttachments.push({
      filename: attachments.transcript.attachment.filename,
      content: attachments.transcript.attachment.content,
    });
  }

  return resendAttachments;
}

// Types are already exported at the top of the file