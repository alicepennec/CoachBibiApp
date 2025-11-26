"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WeightChartProps {
    data: { date: string; weight: number }[]
}

export function WeightChart({ data }: WeightChartProps) {
    const formattedData = data.map(d => ({
        ...d,
        dateLabel: format(parseISO(d.date), "d MMM", { locale: fr }),
    })).reverse() // Recharts expects chronological order usually, but let's check input

    // Ensure data is sorted by date ascending for the chart
    const sortedData = [...formattedData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sortedData.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg bg-slate-50">
                Pas assez de données pour afficher le graphique
            </div>
        )
    }

    const minWeight = Math.min(...sortedData.map(d => d.weight)) - 2
    const maxWeight = Math.max(...sortedData.map(d => d.weight)) + 2

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="dateLabel"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        domain={[minWeight, maxWeight]}
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        unit="kg"
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: number) => [`${value} kg`, "Poids"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorWeight)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
