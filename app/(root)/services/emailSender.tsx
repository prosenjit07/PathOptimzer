/**
 * Email Sender Service
 * 
 * This service handles sending emails via the Resend API, including
 * support for HTML/text content and PDF attachments.
 */

import { Resend } from "resend";
import { ContactData } from "./read-excel-data";
import {
  generateEmailHTML,
  generateEmailText,
  generateEmailSubject,
  generateTemplateData,
  SenderConfig,
} from "./emailTemplates";
import { getAttachmentsForResend } from "./attachmentService";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Resend API rate limits (free tier): 100 emails per day, 2 emails per second
const RATE_LIMIT_PER_SECOND = 2;
const RATE_LIMIT_PER_DAY = 100;

// Delay between emails in milliseconds (for rate limiting)
const EMAIL_DELAY_MS = (1000 / RATE_LIMIT_PER_SECOND) + 100; // 600ms for safety

export interface EmailSendResult {
  success: boolean;
  contact: ContactData;
  messageId?: string;
  error?: string;
  retryable?: boolean;
}

export interface BatchSendResult {
  total: number;
  successful: number;
  failed: number;
  results: EmailSendResult[];
  rateLimitRemaining?: number;
}

/**
 * Send a single email via Resend API
 * @param contact - Contact data for the recipient
 * @param senderConfig - Sender configuration
 * @param from - Sender email address (must be verified in Resend)
 * @param attachments - Optional array of attachment objects with filename and content
 * @returns EmailSendResult with success status and message ID or error
 */
export async function sendEmail(
  contact: ContactData,
  senderConfig: SenderConfig,
  from: string,
  attachments?: Array<{ filename: string; content: string }>
): Promise<EmailSendResult> {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        contact,
        error: "RESEND_API_KEY environment variable is not set",
        retryable: false,
      };
    }

    // Generate template data
    const templateData = generateTemplateData(contact, senderConfig);

    // Generate email content
    const subject = generateEmailSubject(templateData);
    const htmlContent = generateEmailHTML(templateData);
    const textContent = generateEmailText(templateData);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from,
      to: contact.Email,
      subject,
      html: htmlContent,
      text: textContent,
      attachments,
    });

    if (error) {
      // Check if error is retryable (network errors, rate limits, etc.)
      const isRetryable = isRetryableError(error);

      return {
        success: false,
        contact,
        error: error.message || "Unknown error from Resend API",
        retryable: isRetryable,
      };
    }

    if (!data || !data.id) {
      return {
        success: false,
        contact,
        error: "No message ID returned from Resend API",
        retryable: false,
      };
    }

    return {
      success: true,
      contact,
      messageId: data.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Check if error is retryable
    const isRetryable = isRetryableError(error);

    return {
      success: false,
      contact,
      error: `Exception thrown: ${errorMessage}`,
      retryable: isRetryable,
    };
  }
}

/**
 * Check if an error is retryable (network errors, rate limits, server errors)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network-related errors are retryable
    const networkErrors = [
      "network",
      "timeout",
      "econnrefused",
      "econnreset",
      "enotfound",
      "etimedout",
      "socket",
      "dns",
    ];

    if (networkErrors.some((e) => message.includes(e))) {
      return true;
    }

    // HTTP 429 (Too Many Requests) - rate limit
    if (message.includes("429") || message.includes("rate limit")) {
      return true;
    }

    // HTTP 5xx errors - server errors
    if (message.match(/5\d\d/)) {
      return true;
    }
  }

  return false;
}

/**
 * Delay execution for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send emails to multiple contacts with rate limiting and error handling
 * @param contacts - Array of contact data
 * @param senderConfig - Sender configuration
 * @param from - Sender email address
 * @param attachments - Optional array of attachment objects
 * @param options - Optional configuration for batch sending
 * @returns BatchSendResult with detailed results for each email
 */
export async function sendEmailsBatch(
  contacts: ContactData[],
  senderConfig: SenderConfig,
  from: string,
  attachments?: Array<{ filename: string; content: string }>,
  options?: {
    delayMs?: number;
    maxRetries?: number;
    stopOnError?: boolean;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<BatchSendResult> {
  const {
    delayMs = (1000 / RATE_LIMIT_PER_SECOND) + 100, // 600ms for safety
    maxRetries = 3,
    stopOnError = false,
    onProgress,
  } = options || {};

  const results: EmailSendResult[] = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`\nStarting batch email send to ${contacts.length} contacts...`);
  console.log(`Rate limit: ${RATE_LIMIT_PER_SECOND} emails/second`);
  console.log(`Delay between emails: ${delayMs}ms`);
  console.log(`Max retries: ${maxRetries}\n`);

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    console.log(`\n[${i + 1}/${contacts.length}] Sending email to ${contact.Name} (${contact.Email})...`);

    let result: EmailSendResult;
    let attempts = 0;

    // Retry loop for failed requests
    do {
      result = await sendEmail(contact, senderConfig, from, attachments);
      attempts++;

      if (!result.success && result.retryable && attempts <= maxRetries) {
        const retryDelay = Math.pow(2, attempts) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`  ⚠ Attempt ${attempts} failed: ${result.error}`);
        console.log(`  🔄 Retrying in ${retryDelay}ms...`);
        await delay(retryDelay);
      } else {
        break;
      }
    } while (attempts <= maxRetries);

    // Log final result
    if (result.success) {
      console.log(`  ✓ Email sent successfully! Message ID: ${result.messageId}`);
      successCount++;
    } else {
      console.log(`  ✗ Failed to send: ${result.error}`);
      failCount++;

      if (stopOnError) {
        console.log("\n🛑 Stopping batch due to error (stopOnError is enabled)");
        results.push(result);
        break;
      }
    }

    results.push(result);

    // Report progress
    if (onProgress) {
      onProgress(i + 1, contacts.length);
    }

    // Apply rate limiting delay (except for the last email)
    if (i < contacts.length - 1) {
      await delay(delayMs);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("BATCH SEND COMPLETE");
  console.log(`${"=".repeat(60)}`);
  console.log(`Total emails: ${contacts.length}`);
  console.log(`Successful: ${successCount} ✅`);
  console.log(`Failed: ${failCount} ❌`);
  console.log(`${"=".repeat(60)}\n`);

  return {
    total: contacts.length,
    successful: successCount,
    failed: failCount,
    results,
  };
}

/**
 * Retry failed emails from a previous batch
 * @param failedResults - Array of failed EmailSendResult objects
 * @param senderConfig - Sender configuration
 * @param from - Sender email address
 * @param attachments - Optional array of attachment objects
 * @returns BatchSendResult with results of retry attempts
 */
export async function retryFailedEmails(
  failedResults: EmailSendResult[],
  senderConfig: SenderConfig,
  from: string,
  attachments?: Array<{ filename: string; content: string }>
): Promise<BatchSendResult> {
  const contacts = failedResults.map((result) => result.contact);

  console.log(`\nRetrying ${contacts.length} failed emails...\n`);

  return sendEmailsBatch(contacts, senderConfig, from, attachments, {
    delayMs: (1000 / RATE_LIMIT_PER_SECOND) + 100, // 600ms for safety
    maxRetries: 5, // More retries for previously failed emails
  });
}

// Export types for convenience
export type { ContactData } from "./read-excel-data";
export type { SenderConfig, EmailTemplateData } from "./emailTemplates";