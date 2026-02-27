import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSheetsClient, SHEET_ID, EXPENSES_SHEET } from '@/lib/sheets';

const ExpenseSchema = z.object({
    date: z.string().min(1), // "01/03/2026"
    item: z.string().min(1), // รายการ
    type: z.string().min(1), // "รายจ่าย" | "รายรับ"
    amount: z.number().finite(), // จำนวนเงิน
    category: z.string().optional().default(''),
    owner: z.string().optional().default(''),
});

export async function GET() {
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${EXPENSES_SHEET}!A2:F`,
    });

    const rows = res.data.values ?? [];
    const expenses = rows.map((r) => ({
        date: r[0] ?? '',
        item: r[1] ?? '',
        type: r[2] ?? '',
        amount: Number(r[3] ?? 0),
        category: r[4] ?? '',
        owner: r[5] ?? '',
    }));

    return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
    const body = await req.json();

    if (typeof body?.amount === 'string') body.amount = Number(body.amount);

    const parsed = ExpenseSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { date, item, type, amount, category, owner } = parsed.data;

    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${EXPENSES_SHEET}!A:F`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[date, item, type, amount, category ?? '', owner ?? '']],
        },
    });

    return NextResponse.json({ ok: true });
}
