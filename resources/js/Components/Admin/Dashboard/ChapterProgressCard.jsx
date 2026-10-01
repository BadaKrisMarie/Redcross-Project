import React, { useState } from 'react';
import { BookOpen, MoreHorizontal, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function ChapterProgressCard({
    volunteerStats = { active: 0, incompleteDocs: 0, inactive: 0 },
    pendingCount = 0,
    totalVolunteers = 0,
    onPendingClick,
}) {
    const [period, setPeriod] = useState('This Month');

    return (
        <div className="bg-white rounded-[32px] p-7 shadow-sm border-0 flex flex-col justify-between space-y-6 transition-all hover:shadow-md h-full">
            {/* Header with Title and Period Filter matching EdTech+ layout */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                        Learner Progress
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        Weekly study session
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
                {/* 1. Finished Lessons / Operations */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>Finished Lessons</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-bold text-gray-900">
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            67/100%
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                            Medium Score
                        </span>
                    </div>

                    {/* Styled Gradient Progress Bar with Striped Pattern matching EdTech+ mockup */}
                    <div className="w-full bg-[#F1F5F9] rounded-2xl h-7 overflow-hidden flex items-center p-1">
                        <div
                            className="h-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 shadow-xs transition-all duration-500"
                            style={{ width: '67%' }}
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

                {/* 2. Ongoing Lessons / Review */}
                <div
                    onClick={onPendingClick}
                    className="space-y-3 cursor-pointer group"
                >
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        <span>Ongoing Lessons</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-bold text-gray-900">
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            35/100%
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                            Low Score
                        </span>
                    </div>

                    {/* Striped unfilled bar with partial fill */}
                    <div className="w-full bg-[#F1F5F9] rounded-2xl h-7 overflow-hidden flex items-center p-1">
                        <div
                            className="h-full rounded-xl bg-gradient-to-r from-purple-300 to-indigo-400 shadow-xs transition-all duration-500"
                            style={{ width: '35%' }}
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
            </div>
        </div>
    );
}
