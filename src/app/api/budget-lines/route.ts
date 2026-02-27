import { NextResponse } from 'next/server';
import { getSheetsClient, SHEET_ID } from '@/lib/sheets';

const SHEET_NAME = 'Budget_lines';

export async function GET() {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:F`,
    });

    const rows = res.data.values ?? [];
    // กรองเฉพาะ person_id = 1
    const lines = rows
        .map((r, idx) => ({
            rowIndex: idx + 2,
            person_id: r[0],
            section: r[1], // income, fixed, save, variable
            item: r[2],
            amount: Number(r[3] || 0),
            note: r[4] || '',
            locked: r[5] === 'TRUE',
        }))
        .filter((item) => item.person_id === '1');

    return NextResponse.json({ lines });
}

export async function POST(req: Request) {
    const body = await req.json();
    const sheets = await getSheetsClient();

    // เพิ่มข้อมูลใหม่ต่อท้าย
    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['1', body.section, body.item, body.amount, body.note, 'FALSE']],
        },
    });
    return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
    const { rowIndex, ...data } = await req.json();
    const sheets = await getSheetsClient();

    // อัปเดตข้อมูลตามแถว
    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A${rowIndex}:F${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [['1', data.section, data.item, data.amount, data.note, data.locked ? 'TRUE' : 'FALSE']],
        },
    });
    return NextResponse.json({ ok: true });
}
