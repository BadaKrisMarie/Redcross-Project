import React, { useState } from 'react';
import { Award, Clock, ChevronDown, CheckCircle2, Radio } from 'lucide-react';

export default function VolunteerProgressCard({
    totalHours = 0,
    totalDays = 0,
    monthDays = 0,
    availability = true,
    savingAvailability = false,
    onToggleAvailability,
}) {
    const [period, setPeriod] = useState('This Month');

    const hoursGoal = 100;
    const hoursNum = Number(totalHours) || 0;
    const hoursPercent = Math.min(100, Math.round((hoursNum / hoursGoal) * 100));

    const shiftsGoal = 20;
    const shiftsNum = Number(monthDays) || Number(totalDays) || 7;
    const shiftsPercent = Math.min(100, Math.round((shiftsNum / shiftsGoal) * 100));

    return (
        <div className="bg-white rounded-[32px] p-7 shadow-sm border-0 flex flex-col justify-between space-y-6 transition-all hover:shadow-md h-full">
            {/* Header matching EdTech+ layout */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        Learner Progress
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        Weekly service session &amp; hours
                    </p>
                </div>

                <div className="relative inline-flex items-center">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-50/80 hover:bg-gray-100 text-xs font-semibold text-gray-700 border-0 transition-colors"
                    >
                        <span>{period}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Progress Blocks matching EdTech+ layout */}
            <div className="space-y-5">
                {/* 1. Finished Hours / Lessons */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Finished Hours</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                            {hoursNum} / {hoursGoal} hrs
                        </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-bold text-gray-900">
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            {hoursPercent}/100%
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Medium Score
                        </span>
                    </div>

                    {/* Gradient Progress Bar with Striped Pattern */}
                    <div className="w-full bg-[#F1F5F9] rounded-2xl h-7 overflow-hidden flex items-center p-1">
                        <div
                            className="h-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 shadow-xs transition-all duration-500"
                            style={{ width: `${Math.max(15, hoursPercent)}%` }}
                        />
                        <div
                            className="h-full flex-1 rounded-r-xl opacity-40 ml-1"
                            style={{
                                backgroundImage:
                                    'repeating-linear-gradient(45deg, #CBD5E1, #CBD5E1 3px, transparent 3px, transparent 8px)',
                            }}
                        />
                    </div>
                </div>

                {/* 2. Ongoing Shifts */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span>Ongoing Shifts</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                            {shiftsNum} completed
                        </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-bold text-gray-900">
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            {shiftsPercent}/100%
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Low Score
                        </span>
                    </div>

                    {/* Striped unfilled bar with partial fill */}
                    <div className="w-full bg-[#F1F5F9] rounded-2xl h-7 overflow-hidden flex items-center p-1">
                        <div
                            className="h-full rounded-xl bg-gradient-to-r from-purple-300 to-indigo-400 shadow-xs transition-all duration-500"
                            style={{ width: `${Math.max(12, shiftsPercent)}%` }}
                        />
                        <div
                            className="h-full flex-1 rounded-r-xl opacity-40 ml-1"
                            style={{
                                backgroundImage:
                                    'repeating-linear-gradient(45deg, #CBD5E1, #CBD5E1 3px, transparent 3px, transparent 8px)',
                            }}
                        />
                    </div>
                </div>

                {/* 3. Availability Quick Toggle */}
                {onToggleAvailability && (
                    <div className="pt-2 flex items-center justify-between bg-gray-50/70 p-3 rounded-2xl">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${availability ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            <span className="text-xs font-bold text-gray-800">Deployment Status</span>
                        </div>
                        <button
                            type="button"
                            onClick={onToggleAvailability}
                            disabled={savingAvailability}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                availability
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {availability ? 'Available' : 'Unavailable'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
