'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/list', label: 'รายการทั้งหมด' },
    { href: '/analytics', label: 'ตั้งค่า/สรุป' },
    { href: '/other', label: 'อื่นๆ' },
];

export default function TopTabs() {
    const pathname = usePathname();

    return (
        <div className="w-full border-b bg-background">
            <div className="mx-auto flex max-w-4xl gap-1 p-2">
                {tabs.map((t) => {
                    const active = pathname === t.href;
                    return (
                        <Link
                            key={t.href}
                            href={t.href}
                            className={[
                                'rounded-md px-3 py-2 text-sm transition',
                                active
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                            ].join(' ')}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
