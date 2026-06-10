import sheets from "./googleSheets";

// Define the contact data interface
export interface ContactData {
  Name: string;
  Email: string;
  Company: string;
  Role: string;
  Link?: string;
  [key: string]: string | undefined;
}

/**
 * Read data from Google Sheets
 * @param range - The cell range to read (e.g., "Sheet1!A:E")
 * @returns Array of arrays containing sheet data
 */
export async function readSheetData(
  range: string = "Sheet1!A:Z"
): Promise<(string | number)[][]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in the sheet.");
      return [];
    }

    return rows as (string | number)[][];
  } catch (error) {
    console.error("Error reading from Google Sheet:", error);
    throw new Error(
      `Failed to read data from Google Sheet: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Parse raw sheet data into ContactData objects
 * @param rows - Raw data from Google Sheets (array of arrays)
 * @returns Array of ContactData objects
 */
export function parseContactData(
  rows: (string | number)[][]
): ContactData[] {
  if (rows.length < 2) {
    console.log("Not enough data to parse (need at least header + 1 row).");
    return [];
  }

  const headers = rows[0].map((header) => String(header).trim());
  const contacts: ContactData[] = [];

  // Start from index 1 to skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const contact: Partial<ContactData> = {};

    // Map each column to the corresponding header
    headers.forEach((header, index) => {
      const value = row[index];
      // Convert to string if it's a number, otherwise use as-is or empty string
      contact[header] =
        value !== undefined && value !== null ? String(value) : "";
    });

    // Validate required fields
    if (isValidContact(contact)) {
      contacts.push(contact as ContactData);
    } else {
      console.warn(
        `Row ${i + 1} skipped: Missing required fields (Name, Email, Company, Role).`
      );
    }
  }

  return contacts;
}

/**
 * Validate that a contact has all required fields
 * @param contact - Partial contact object
 * @returns boolean indicating if contact is valid
 */
function isValidContact(contact: Partial<ContactData>): boolean {
  return (
    !!contact.Name &&
    contact.Name.trim() !== "" &&
    !!contact.Email &&
    contact.Email.trim() !== "" &&
    !!contact.Company &&
    contact.Company.trim() !== "" &&
    !!contact.Role &&
    contact.Role.trim() !== ""
  );
}

/**
 * Main function to read and parse contact data from Google Sheets
 * @param range - The cell range to read from Google Sheets
 * @returns Array of validated ContactData objects
 */
export async function getContactsFromSheet(
  range: string = "Sheet1!A:Z"
): Promise<ContactData[]> {
  try {
    console.log("Reading data from Google Sheets...");
    const rawData = await readSheetData(range);

    console.log(`Retrieved ${rawData.length} rows from the sheet.`);

    console.log("Parsing and validating contact data...");
    const contacts = parseContactData(rawData);

    console.log(`Successfully parsed ${contacts.length} valid contacts.`);
    return contacts;
  } catch (error) {
    console.error("Error in getContactsFromSheet:", error);
    throw error;
  }
}

// Export types for use in other modules
export type { ContactData as Contact } from "./read-excel-data";
export default getContactsFromSheet;