'use client';

import { useMemo } from 'react';

import { Card } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
} from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isOthers = data.name === 'ค่าใช้จ่ายอื่นๆ';

        return (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-[1.5rem] shadow-2xl border border-border/10">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">
                    {data.name}
                </p>
                <p className="text-lg font-black text-slate-900 mb-1">฿{payload[0].value.toLocaleString()}</p>

                {isOthers && data.details && (
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 space-y-1.5">
                        <div className="flex justify-between gap-8 text-[11px] font-bold">
                            <span className="text-muted-foreground">📅 ใช้จ่ายรายวัน:</span>
                            <span className="text-slate-600">฿{data.details.daily.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-8 text-[11px] font-bold">
                            <span className="text-muted-foreground">⛽ น้ำมันรถ:</span>
                            <span className="text-emerald-600">฿{data.details.fuel.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-8 text-[11px] font-bold">
                            <span className="text-muted-foreground">🛍️ ฟุ่มเฟือย:</span>
                            <span className="text-rose-500">฿{data.details.lux.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-8 text-[11px] font-bold">
                            <span className="text-muted-foreground">📋 รายการตามแผน:</span>
                            <span className="text-blue-600">฿{data.details.planned.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const COLORS = ['#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#94a3b8'];

export function ChartCard({ chartData, isComparing, income, expense }: any) {
    const pieData = useMemo(() => {
        if (isComparing) return [];

        const data = chartData.map((d: any) => ({
            name: d.name,
            value: d.current,
            details: d.details,
        }));

        const balance = income - expense;
        if (balance > 0) {
            data.push({ name: 'เงินคงเหลือ', value: balance, isBalance: true });
        }

        return data;
    }, [chartData, isComparing, income, expense]);

    return (
        <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card p-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {isComparing ? 'เปรียบเทียบรายจ่าย' : 'สัดส่วนการใช้จ่ายต่อรายได้'}
                </h3>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    {isComparing ? (
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#888' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#888' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 10 }} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }}
                            />
                            <Bar
                                dataKey="prev"
                                name="เดือนก่อนหน้า"
                                fill="#cbd5e1"
                                radius={[10, 10, 0, 0]}
                                barSize={15}
                            />
                            <Bar
                                dataKey="current"
                                name="เดือนปัจจุบัน"
                                fill="#3b82f6"
                                radius={[10, 10, 0, 0]}
                                barSize={15}
                            />
                        </BarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry: any, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isBalance ? '#e2e8f0' : COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                formatter={(value) => (
                                    <span className="text-[10px] font-bold text-slate-600 ml-1 uppercase">{value}</span>
                                )}
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
