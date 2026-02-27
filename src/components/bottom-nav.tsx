'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, Settings, TableProperties, CalendarSync } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'หน้าแรก', href: '/', icon: Home },
        { name: 'รายการ', href: '/list', icon: TableProperties },
        { name: 'ค่าใช้จ่าย', href: '/budget-plan', icon: CalendarSync },
        { name: 'สถิติ', href: '/analytics', icon: PieChart },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-md px-6 pb-8 pt-3 bg-background/80 backdrop-blur-lg border-t border-border flex justify-around items-center">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-colors ${
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
