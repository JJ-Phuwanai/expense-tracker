import { google } from 'googleapis';

export const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL!;
const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function getSheetsClient() {
    await auth.authorize();
    return google.sheets({ version: 'v4', auth });
}

export const EXPENSES_SHEET = process.env.EXPENSES_SHEET_NAME;
export const SETTINGS_SHEET = process.env.SETTINGS_SHEET_NAME;
export const SETTINGS_SHEET_JJ = process.env.SETTINGS_SHEET_NAME_JJ;
export const STATEMENT_SHEET_JJ = process.env.STATEMENT_SHEET_NAME_JJ;
export const BUDGET_SHEET = process.env.BUDGET_SHEET;
export const BUDGET_LINES_SHEET = process.env.BUDGET_LINES_SHEET;
