'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, subMonths } from 'date-fns';
import { th } from 'date-fns/locale';
import { useUser } from '@/context/user-context';

import { AnalyticsHeader } from '@/components/budget-analytics/analytics-header';
import { MonthSelector } from '@/components/budget-analytics/month-selector';
import { ChartCard } from '@/components/budget-analytics/chart-card';
import { AnalyticsList } from '@/components/budget-analytics/analytics-list';

export default function EnhancedAnalyticsPage() {
    const router = useRouter();
    const { currentUserId, userName, users, switchUser } = useUser();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);

    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM/yyyy'));
    const [compareMonth, setCompareMonth] = useState(format(subMonths(new Date(), 1), 'MM/yyyy'));
    const [isComparing, setIsComparing] = useState(false);

    const monthOptions = useMemo(
        () =>
            Array.from({ length: 6 }).map((_, i) => {
                const d = subMonths(new Date(), i);
                return { label: format(d, 'MMM yy', { locale: th }), value: format(d, 'MM/yyyy') };
            }),
        [],
    );

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [resPlans, resExp] = await Promise.all([
                fetch(`/api/budget-plan?personId=${currentUserId}`),
                fetch(`/api/expenses?personId=${currentUserId}`),
            ]);
            const dataPlans = await resPlans.json();
            const dataExp = await resExp.json();
            setPlans(dataPlans.plans || []);
            setDailyExpenses(dataExp.expenses || []);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const analyticsData = useMemo(() => {
        const processMonth = (m: string) => {
            let income = 0,
                expense = 0,
                plannedOthers = 0;
            const bySection: Record<string, number> = {};

            plans
                .filter((p) => p.date === m)
                .forEach((p) => {
                    const amt = Number(p.amount) || 0;
                    if (p.section === 'เงินเดือน') income += amt;
                    else if (p.note === 'จ่ายแล้ว') {
                        expense += amt;
                        bySection[p.section] = (bySection[p.section] || 0) + amt;
                        if (p.section === 'ค่าใช้จ่ายอื่นๆ') plannedOthers += amt;
                    }
                });

            const userItems = dailyExpenses.filter((item) => item.owner === userName && item.date.includes(m));
            let fuel = 0,
                lux = 0,
                dExp = 0,
                dInc = 0;
            userItems.forEach((item) => {
                const amt = Number(item.amount) || 0;
                if (item.category === 'น้ำมันรถ') fuel += amt;
                else if (item.category === 'ฟุ่มเฟือย') lux += amt;
                else {
                    if (item.type === 'รายรับ') dInc += amt;
                    else dExp += amt;
                }
            });

            const dailyNet = Math.max(0, dExp - dInc);
            const combinedDaily = fuel + lux + dailyNet;
            expense += combinedDaily;
            bySection['ค่าใช้จ่ายอื่นๆ'] = (bySection['ค่าใช้จ่ายอื่นๆ'] || 0) + combinedDaily;

            return {
                income,
                expense,
                bySection,
                fuel,
                lux,
                dailyNet,
                combinedDaily,
                plannedOthers,
                net: income - expense,
            };
        };

        const current = processMonth(selectedMonth);
        const prev = processMonth(compareMonth);

        const chartData = Array.from(new Set([...Object.keys(current.bySection), ...Object.keys(prev.bySection)]))
            .map((sec) => ({
                name: sec,
                current: current.bySection[sec] || 0,
                prev: prev.bySection[sec] || 0,
                details:
                    sec === 'ค่าใช้จ่ายอื่นๆ'
                        ? {
                              fuel: current.fuel,
                              lux: current.lux,
                              daily: current.dailyNet,
                              planned: current.plannedOthers,
                          }
                        : null,
            }))
            .sort((a, b) => b.current - a.current);

        return { current, prev, chartData };
    }, [plans, dailyExpenses, userName, selectedMonth, compareMonth]);

    return (
        <main className="h-screen max-w-md mx-auto flex flex-col bg-muted/40 font-sans overflow-hidden">
            <AnalyticsHeader
                userName={userName}
                users={users}
                switchUser={switchUser}
                onBack={() => router.back()}
                selectedMonth={selectedMonth}
                netBalance={analyticsData.current.net}
            />

            <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-6 pt-4 scrollbar-hide">
                <MonthSelector
                    options={monthOptions}
                    selected={selectedMonth}
                    onSelect={isComparing ? setCompareMonth : setSelectedMonth}
                    isComparing={isComparing}
                    onToggleCompare={() => setIsComparing(!isComparing)}
                    compareMonth={compareMonth}
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-border/10 text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">รายได้</p>
                        <p className="text-xl font-black text-emerald-600">
                            ฿{analyticsData.current.income.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-border/10 text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">รายจ่าย</p>
                        <p className="text-xl font-black text-destructive">
                            ฿{analyticsData.current.expense.toLocaleString()}
                        </p>
                    </div>
                </div>
                <ChartCard
                    chartData={analyticsData.chartData}
                    isComparing={isComparing}
                    income={analyticsData.current.income}
                    expense={analyticsData.current.expense}
                />
                <AnalyticsList
                    selectedMonth={selectedMonth}
                    plans={plans}
                    combinedDaily={analyticsData.current.combinedDaily}
                    plannedOthers={analyticsData.current.plannedOthers}
                />
            </div>
        </main>
    );
}
