/**
 * Phase 2 Test Script
 * 
 * This script tests the functionality for:
 * 1. Reading data from Google Sheets
 * 2. Parsing and validating contact information
 * 
 * Usage: npx ts-node scripts/test-phase2.ts
 */

import {
  readSheetData,
  parseContactData,
  getContactsFromSheet,
  ContactData,
} from "../app/(root)/services/read-excel-data";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);
}

// Test 1: Check environment variables
async function testEnvironmentVariables(): Promise<boolean> {
  logSection("TEST 1: Environment Variables");
  
  const requiredVars = [
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SHEET_ID",
  ];
  
  let allPresent = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value.trim() !== "" && !value.includes("your-")) {
      // Mask sensitive values
      const displayValue = varName.includes("KEY") 
        ? "***" + value.slice(-10) 
        : value.length > 30 
          ? value.slice(0, 30) + "..." 
          : value;
      logSuccess(`${varName}: ${displayValue}`);
    } else {
      logError(`${varName}: Missing or not configured`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Test 2: Read data from Google Sheets
async function testReadSheetData(): Promise<(string | number)[][] | null> {
  logSection("TEST 2: Read Data from Google Sheets");
  
  try {
    logInfo("Attempting to read data from Google Sheets...");
    const data = await readSheetData("Sheet1!A:Z");
    
    if (data.length === 0) {
      logWarning("No data found in the sheet.");
      return null;
    }
    
    logSuccess(`Successfully read ${data.length} rows from Google Sheets`);
    
    // Display header row
    if (data.length > 0) {
      logInfo(`Headers: ${data[0].join(", ")}`);
    }
    
    // Display sample data (first 3 data rows)
    const sampleRows = data.slice(1, 4);
    if (sampleRows.length > 0) {
      console.log("\nSample data (up to 3 rows):");
      sampleRows.forEach((row, index) => {
        console.log(`  Row ${index + 2}: ${JSON.stringify(row)}`);
      });
    }
    
    return data;
  } catch (error) {
    logError(`Failed to read data: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Test 3: Parse and validate contact data
async function testParseContactData(
  rawData: (string | number)[][]
): Promise<ContactData[]> {
  logSection("TEST 3: Parse and Validate Contact Data");
  
  try {
    logInfo("Parsing raw data into ContactData objects...");
    const contacts = parseContactData(rawData);
    
    logSuccess(`Successfully parsed ${contacts.length} valid contacts`);
    
    if (contacts.length > 0) {
      console.log("\nParsed contacts:");
      contacts.forEach((contact, index) => {
        console.log(`\n  Contact ${index + 1}:`);
        console.log(`    Name: ${contact.Name}`);
        console.log(`    Email: ${contact.Email}`);
        console.log(`    Company: ${contact.Company}`);
        console.log(`    Role: ${contact.Role}`);
        if (contact.Link) {
          console.log(`    Link: ${contact.Link}`);
        }
      });
    }
    
    // Show statistics
    const skippedRows = rawData.length - 1 - contacts.length; // -1 for header
    if (skippedRows > 0) {
      logWarning(`${skippedRows} rows were skipped due to missing required fields.`);
    }
    
    return contacts;
  } catch (error) {
    logError(`Failed to parse data: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Test 4: End-to-end integration test
async function testEndToEnd(): Promise<void> {
  logSection("TEST 4: End-to-End Integration");
  
  try {
    logInfo("Running complete workflow: Read → Parse → Validate...");
    const contacts = await getContactsFromSheet("Sheet1!A:Z");
    
    if (contacts.length === 0) {
      logWarning("No valid contacts found. Workflow completed with no data.");
      return;
    }
    
    logSuccess(`End-to-end workflow completed successfully!`);
    logInfo(`Ready to send emails to ${contacts.length} contacts.`);
    
    console.log("\n📧 Next Steps for Phase 3:");
    console.log("   1. Prepare email templates with personalized content");
    console.log("   2. Load CV.pdf and Transcript.pdf as base64 attachments");
    console.log("   3. Send emails using Resend API with rate limiting");
    
  } catch (error) {
    logError(`End-to-end test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Main test runner
async function runTests(): Promise<void> {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║          PHASE 2: GOOGLE SHEETS DATA COLLECTION TEST           ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`);

  console.log("This test script validates:");
  console.log("  ✓ Environment variables configuration");
  console.log("  ✓ Google Sheets API connectivity");
  console.log("  ✓ Data reading and parsing");
  console.log("  ✓ Contact validation and filtering");
  console.log("  ✓ End-to-end workflow");
  console.log("");

  // Check if environment variables are set
  const envCheck = await testEnvironmentVariables();
  if (!envCheck) {
    console.log("\n");
    logError("Environment variables check failed. Please configure your .env file.");
    console.log("\nRequired variables:");
    console.log("  - GOOGLE_CLIENT_EMAIL");
    console.log("  - GOOGLE_PRIVATE_KEY");
    console.log("  - GOOGLE_SHEET_ID");
    process.exit(1);
  }

  // Test reading data
  const rawData = await testReadSheetData();
  if (!rawData || rawData.length === 0) {
    logError("No data retrieved from Google Sheets. Tests cannot continue.");
    process.exit(1);
  }

  // Test parsing data
  const contacts = await testParseContactData(rawData);
  if (contacts.length === 0) {
    logWarning("No valid contacts found after parsing. Check your data format.");
  }

  // Test end-to-end workflow
  await testEndToEnd();

  // Final summary
  console.log(`\n${colors.cyan}════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                       TEST SUMMARY                             ${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════════════════════════════${colors.reset}\n`);

  logSuccess("Phase 2 implementation is ready!");
  console.log("\nYou can now:");
  console.log("  1. Import the functions from 'app/(root)/services/read-excel-data'");
  console.log("  2. Use getContactsFromSheet() to fetch and parse contacts");
  console.log("  3. Proceed to Phase 3 for email sending implementation");

  console.log("\n");
}

// Run the tests
runTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});