export type Expense = {
  date: string;
  item: string;
  type: string;
  amount: number;
  category: string;
  owner: string;
};

export type SortKey =
  | "date"
  | "category"
  | "item"
  | "type"
  | "owner"
  | "amount";

export function formatMoney(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("th-TH");
}

export function toStartOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toEndOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
