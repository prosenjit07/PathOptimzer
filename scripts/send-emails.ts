#!/usr/bin/env ts-node
/**
 * Email Automation Script - Main Entry Point
 *
 * This script orchestrates the complete email automation workflow:
 * 1. Reads contact data from Google Sheets
 * 2. Loads CV and Transcript PDF attachments
 * 3. Sends personalized emails via Resend API with rate limiting
 * 4. Provides comprehensive logging and error handling
 *
 * Usage:
 *   npx ts-node scripts/send-emails.ts
 *   npx ts-node scripts/send-emails.ts --dry-run
 *   npx ts-node scripts/send-emails.ts --retry-failed
 *   npx ts-node scripts/send-emails.ts --sheet-range="Sheet1!A:Z"
 *
 * Environment Variables Required:
 *   - RESEND_API_KEY
 *   - GOOGLE_CLIENT_EMAIL
 *   - GOOGLE_PRIVATE_KEY
 *   - GOOGLE_SHEET_ID
 *   - SENDER_EMAIL (optional, defaults to onbarding@resend.dev)
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { getContactsFromSheet, ContactData } from "../app/(root)/services/read-excel-data";
import {
  loadEmailAttachments,
  getAttachmentsForResend,
  validateAttachments,
} from "../app/(root)/services/attachmentService";
import {
  sendEmailsBatch,
  retryFailedEmails,
  BatchSendResult,
  EmailSendResult,
} from "../app/(root)/services/emailSender";
import { defaultSenderConfig } from "../app/(root)/services/emailTemplates";

// Load environment variables from .env.local first, then .env
dotenv.config({ path: ".env.local" });
dotenv.config();

// ANSI color codes for better console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// Logging helper functions
function logInfo(message: string) {
  console.log(`${colors.blue}ℹ ${colors.reset}${message}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓ ${colors.reset}${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗ ${colors.reset}${message}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠ ${colors.reset}${message}`);
}

function logSection(title: string) {
  const line = "═".repeat(70);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.cyan}${title.padStart(35 + title.length / 2).padEnd(70)}${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

// Parse command line arguments
function parseArgs(): {
  dryRun: boolean;
  retryFailed: boolean;
  sheetRange: string;
  senderEmail: string;
  showHelp: boolean;
} {
  const args = process.argv.slice(2);

  return {
    dryRun: args.includes("--dry-run") || args.includes("-d"),
    retryFailed: args.includes("--retry-failed") || args.includes("-r"),
    sheetRange: args.find((arg) => arg.startsWith("--sheet-range="))?.split("=")[1] || "Sheet1!A:Z",
    senderEmail:
      args.find((arg) => arg.startsWith("--sender="))?.split("=")[1] ||
      process.env.SENDER_EMAIL ||
      "onboarding@resend.dev",
    showHelp: args.includes("--help") || args.includes("-h"),
  };
}

// Print help message
function printHelp() {
  console.log(`
${colors.cyan}Email Automation Script${colors.reset}

Usage: npx ts-node scripts/send-emails.ts [options]

Options:
  -d, --dry-run          Run in dry-run mode (no emails sent)
  -r, --retry-failed      Retry previously failed emails
  --sheet-range=RANGE    Google Sheets range (default: Sheet1!A:Z)
  --sender=EMAIL         Sender email address
  -h, --help             Show this help message

Environment Variables:
  RESEND_API_KEY         Resend API key (required)
  GOOGLE_CLIENT_EMAIL    Google Service Account email (required)
  GOOGLE_PRIVATE_KEY     Google Service Account private key (required)
  GOOGLE_SHEET_ID        Google Sheet ID (required)
  SENDER_EMAIL           Default sender email (optional)

Examples:
  npx ts-node scripts/send-emails.ts
  npx ts-node scripts/send-emails.ts --dry-run
  npx ts-node scripts/send-emails.ts --sheet-range="Contacts!A:F"
  npx ts-node scripts/send-emails.ts --sender="you@yourdomain.com"
`);
}

// Check required environment variables
function checkEnvironment(): boolean {
  const required = [
    "RESEND_API_KEY",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SHEET_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logError("Missing required environment variables:");
    missing.forEach((key) => console.log(`  - ${key}`));
    console.log("\nPlease set these variables in your .env file.");
    return false;
  }

  return true;
}

// Main execution function
async function main(): Promise<void> {
  const args = parseArgs();

  // Show help if requested
  if (args.showHelp) {
    printHelp();
    return;
  }

  // Print welcome banner
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║           📧 EMAIL AUTOMATION SYSTEM v1.0                            ║
║                                                                      ║
║     Read from Google Sheets → Send via Resend API                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  // Check environment variables
  if (!checkEnvironment()) {
    process.exit(1);
  }

  logSuccess("Environment variables configured");

  // Dry run mode
  if (args.dryRun) {
    logWarning("DRY RUN MODE ENABLED - No emails will be sent");
    console.log("");
  }

  // Phase 1: Read contacts from Google Sheets
  logSection("PHASE 1: Reading Contacts from Google Sheets");

  let contacts: ContactData[] = [];

  try {
    contacts = await getContactsFromSheet(args.sheetRange);

    if (contacts.length === 0) {
      logError("No valid contacts found in Google Sheet. Exiting.");
      process.exit(1);
    }

    logSuccess(`Found ${contacts.length} valid contacts`);

    // Display first few contacts
    console.log("\nFirst 3 contacts:");
    contacts.slice(0, 3).forEach((contact, i) => {
      console.log(`  ${i + 1}. ${contact.Name} (${contact.Email}) - ${contact.Role} at ${contact.Company}`);
    });
    if (contacts.length > 3) {
      console.log(`  ... and ${contacts.length - 3} more`);
    }
  } catch (error) {
    logError(`Failed to read contacts: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Phase 2: Load attachments
  logSection("PHASE 2: Loading Email Attachments");

  const { loadEmailAttachments, validateAttachments, getAttachmentsForResend } = await import(
    "../app/(root)/services/attachmentService"
  );

  const attachments = loadEmailAttachments();

  if (!validateAttachments(attachments)) {
    logError("Failed to load one or more attachments. Please ensure:");
    console.log("  - files/CV.pdf exists");
    console.log("  - files/Transcript.pdf exists");
    process.exit(1);
  }

  logSuccess("Attachments loaded successfully");

  // Phase 3: Send emails
  logSection("PHASE 3: Sending Emails via Resend API");

  console.log(`From: ${args.senderEmail}`);
  console.log(`Contacts: ${contacts.length}`);
  console.log(`Attachments: CV.pdf, Transcript.pdf`);
  console.log("");

  if (args.dryRun) {
    logWarning("DRY RUN: Would send the following emails:");
    contacts.forEach((contact, i) => {
      console.log(`  ${i + 1}. ${contact.Name} <${contact.Email}>`);
    });
    console.log("\nNo emails were actually sent.");
    return;
  }

  // Get attachments in Resend format
  const resendAttachments = getAttachmentsForResend(attachments);

  // Import sender config
  const { defaultSenderConfig } = await import("../app/(root)/services/emailTemplates");

  // Send emails
  let results: BatchSendResult;

  try {
    results = await sendEmailsBatch(
      contacts,
      defaultSenderConfig,
      args.senderEmail,
      resendAttachments,
      {
        delayMs: EMAIL_DELAY_MS,
        maxRetries: 3,
        stopOnError: false,
        onProgress: (completed, total) => {
          const percentage = Math.round((completed / total) * 100);
          process.stdout.write(`\r  Progress: ${completed}/${total} (${percentage}%)`);
        },
      }
    );

    console.log("\n"); // New line after progress
  } catch (error) {
    logError(`Batch send failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Phase 4: Summary and retry
  logSection("PHASE 4: Summary");

  console.log(`\nEmail Send Results:`);
  console.log(`  Total: ${results.total}`);
  console.log(`  Successful: ${results.successful} ✅`);
  console.log(`  Failed: ${results.failed} ❌`);

  // If there are failed emails, offer to retry
  if (results.failed > 0) {
    console.log("\nFailed emails:");
    results.results
      .filter((r) => !r.success)
      .forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.contact.Name} <${r.contact.Email}>: ${r.error}`);
      });

    if (!args.dryRun) {
      console.log("\nTo retry failed emails, run:");
      console.log(`  npx ts-node scripts/send-emails.ts --retry-failed`);
    }
  }

  // Save results to file for potential retry
  if (!args.dryRun && results.failed > 0) {
    const fs = await import("fs");
    const failedResults = results.results.filter((r) => !r.success);
    const retryFile = path.join(process.cwd(), "failed-emails.json");

    fs.writeFileSync(retryFile, JSON.stringify(failedResults, null, 2));
    console.log(`\nFailed email details saved to: ${retryFile}`);
  }

  // Final status
  console.log(`\n${"=".repeat(70)}`);
  if (results.failed === 0) {
    logSuccess("All emails sent successfully! 🎉");
  } else if (results.successful > 0) {
    logWarning("Some emails failed. Check the output above for details.");
  } else {
    logError("All emails failed. Please check your configuration.");
  }
  console.log(`${"=".repeat(70)}\n`);

  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1);
}

// Handle retry-failed flag
async function handleRetryFailed(): Promise<void> {
  const fs = await import("fs");
  const retryFile = path.join(process.cwd(), "failed-emails.json");

  if (!fs.existsSync(retryFile)) {
    logError(`No failed emails file found at ${retryFile}`);
    console.log("Run the main script first to generate failed emails list.");
    process.exit(1);
  }

  logSection("RETRY MODE: Sending Previously Failed Emails");

  const failedResults: EmailSendResult[] = JSON.parse(
    fs.readFileSync(retryFile, "utf-8")
  );

  console.log(`Found ${failedResults.length} failed emails to retry.\n`);

  // Load attachments
  const { loadEmailAttachments, getAttachmentsForResend, validateAttachments } = await import(
    "../app/(root)/services/attachmentService"
  );

  const attachments = loadEmailAttachments();

  if (!validateAttachments(attachments)) {
    logError("Failed to load attachments");
    process.exit(1);
  }

  const resendAttachments = getAttachmentsForResend(attachments);

  // Retry sending
  const { defaultSenderConfig } = await import("../app/(root)/services/emailTemplates");
  const senderEmail = process.env.SENDER_EMAIL || "onbarding@resend.dev";

  const results = await retryFailedEmails(
    failedResults,
    defaultSenderConfig,
    senderEmail,
    resendAttachments
  );

  // Update retry file
  if (results.failed > 0) {
    const stillFailed = results.results.filter((r) => !r.success);
    fs.writeFileSync(retryFile, JSON.stringify(stillFailed, null, 2));
    console.log(`\n${results.failed} emails still failed. Details updated in ${retryFile}`);
  } else {
    fs.unlinkSync(retryFile);
    console.log(`\nAll retry emails sent successfully! Deleted ${retryFile}`);
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Main entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--retry-failed") || args.includes("-r")) {
    handleRetryFailed().catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
  } else {
    main().catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
  }
}

// Export for testing
export { main };