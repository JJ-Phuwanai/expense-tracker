'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { BudgetHeader } from '@/components/budget-plan/budget-header';
import { BudgetGrid } from '@/components/budget-plan/budget-grid';
import { BudgetItemList } from '@/components/budget-plan/budget-item-list';
import { BudgetFormModal } from '@/components/budget-plan/budget-form-modal';

export default function BudgetPlanPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<number | null>(null);

    const currentMonthLabel = format(new Date(), 'MMMM yyyy', { locale: th });
    const currentMonthValue = format(new Date(), 'MM/yyyy'); // เช่น "04/2026"

    const [formData, setFormData] = useState({ section: '', item: '', amount: '', date: '' });

    const loadPlans = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/budget-plan', { cache: 'no-store' });
            const data = await res.json();
            setPlans(data.plans || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const groupedPlans = useMemo(() => {
        const groups: any = {};
        plans.forEach((p) => {
            const sec = p.section || 'อื่นๆ';
            if (!groups[sec]) groups[sec] = { total: 0, count: 0, items: [] };
            groups[sec].total += Number(p.amount);
            groups[sec].count += 1;
            groups[sec].items.push(p);
        });
        return groups;
    }, [plans]);

    const totalManagement = useMemo(
        () => plans.filter((p) => p.section !== 'เงินเดือน').reduce((sum, p) => sum + Number(p.amount), 0),
        [plans],
    );

    const openAdd = (defSec?: string) => {
        setEditingRow(null);
        setFormData({
            section: defSec || '',
            item: '',
            amount: '',
            date: defSec ? groupedPlans[defSec]?.items[0]?.date || currentMonthValue : currentMonthValue,
        });
        setIsModalOpen(true);
    };

    const startEdit = (plan: any) => {
        setEditingRow(plan.rowIndex);
        setFormData({ section: plan.section, item: plan.item, amount: plan.amount.toString(), date: plan.date });
        setIsModalOpen(true);
    };

    return (
        <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans relative">
            <BudgetHeader
                selectedSection={selectedSection}
                displayTitle={selectedSection ? `หมวดหมู่: ${selectedSection}` : `แผนงานเดือน ${currentMonthLabel}`}
                onBack={() => setSelectedSection(null)}
                totalAmount={selectedSection ? groupedPlans[selectedSection].total : totalManagement}
            />

            <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
                {loading ? (
                    <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">กำลังโหลด...</div>
                ) : !selectedSection ? (
                    <BudgetGrid groupedPlans={groupedPlans} onSelect={setSelectedSection} onAdd={openAdd} />
                ) : (
                    <BudgetItemList
                        section={selectedSection}
                        items={groupedPlans[selectedSection].items}
                        total={groupedPlans[selectedSection].total}
                        onEdit={startEdit}
                        onAdd={openAdd}
                    />
                )}
            </div>

            {isModalOpen && (
                <BudgetFormModal
                    isOpen={isModalOpen}
                    editingRow={editingRow}
                    formData={formData}
                    setFormData={setFormData}
                    selectedSection={selectedSection}
                    onClose={() => setIsModalOpen(false)}
                    onRefresh={loadPlans}
                />
            )}
        </main>
    );
}
