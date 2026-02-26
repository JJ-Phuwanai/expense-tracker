export function todayDDMMYYYY() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
}

export function parseDDMMYYYY(s: string) {
    const [dd, mm, yyyy] = s.split('/').map((x) => Number(x));
    if (!dd || !mm || !yyyy) return NaN;
    return new Date(yyyy, mm - 1, dd).getTime();
}
