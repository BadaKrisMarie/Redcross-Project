import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceArea,
} from 'recharts';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function AnalyticsChartCard({
    activityStats = [],
    selectedYear,
    setSelectedYear,
    yearOptions = [],
}) {
    const [timeframe, setTimeframe] = useState('Weekly');

    const weeklyData = [
        { label: 'Sun', value: 20, attended: 20, missed: 2 },
        { label: 'Mon', value: 35, attended: 35, missed: 5 },
        { label: 'Tue', value: 42, attended: 42, missed: 6 },
        { label: 'Wed', value: 85, attended: 85, missed: 3 }, // Peak
        { label: 'Thu', value: 48, attended: 48, missed: 4 },
        { label: 'Fri', value: 38, attended: 38, missed: 3 },
        { label: 'Sat', value: 28, attended: 28, missed: 2 },
    ];

    const chartData = useMemo(() => {
        if (timeframe === 'Weekly') return weeklyData;

        if (activityStats && activityStats.length > 0) {
            return activityStats.map((item) => ({
                label: item.month,
                value: item.attended,
                attended: item.attended,
                missed: item.missed,
            }));
        }

        return weeklyData;
    }, [activityStats, timeframe]);

    // Peak dot
    const peakItem = useMemo(() => {
        if (!chartData || chartData.length === 0) return null;
        return chartData.reduce(
            (max, item) => (item.value > (max?.value || 0) ? item : max),
            chartData[0]
        );
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        const data = payload[0].payload;

        return (
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border-0 min-w-[130px] space-y-1 text-xs">
                <div className="font-bold text-gray-900 border-b border-gray-50 pb-1 flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{timeframe}</span>
                </div>
                <div className="space-y-0.5 text-xs pt-1">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Activity:</span>
                        <span className="font-bold text-red-600">{data.attended ?? data.value}%</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[32px] p-7 shadow-sm border-0 space-y-5 transition-all hover:shadow-md">
            {/* Header: Title & Actions matching EdTech+ layout */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        Performance Graph
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        Monitor your results and see your progress grow
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timeframe dropdown pill */}
                    <div className="relative inline-flex items-center">
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            aria-label="Select timeframe"
                            className="text-xs font-semibold bg-gray-50/80 hover:bg-gray-100 border-0 rounded-full px-4 py-2 text-gray-700 outline-none transition cursor-pointer appearance-none pr-8"
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" />
                    </div>

                    {/* Open Arrow Button */}
                    <Link
                        href={route('admin.attendance.index')}
                        className="w-10 h-10 rounded-full bg-gray-50/80 hover:bg-red-50 hover:text-red-600 text-gray-500 border-0 flex items-center justify-center transition-all shrink-0 group"
                        title="View attendance details"
                        aria-label="View attendance details"
                    >
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Spline Area Chart */}
            <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 15, right: 15, left: -24, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="redPerfGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.18} />
                                <stop offset="60%" stopColor="#F87171" stopOpacity={0.04} />
                                <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#F8FAFC"
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                            dy={6}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 11 }}
                            ticks={[0, 30, 60, 100]}
                            domain={[0, 100]}
                            unit="%"
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />

                        {/* Shaded vertical reference area behind peak Wed */}
                        {timeframe === 'Weekly' && (
                            <ReferenceArea
                                x1="Wed"
                                x2="Wed"
                                fill="#F1F5F9"
                                fillOpacity={0.6}
                            />
                        )}

                        {peakItem && (
                            <ReferenceDot
                                x={peakItem.label}
                                y={peakItem.value}
                                r={6}
                                fill="#0284C7"
                                stroke="#FFFFFF"
                                strokeWidth={2.5}
                            />
                        )}

                        <Area
                            type="monotone"
                            dataKey="value"
                            name="Performance"
                            stroke="#18181B"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#redPerfGradient)"
                            activeDot={{ r: 6, fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
