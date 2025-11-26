"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface SleepChartProps {
    data: { date: string; hours: number }[]
}

export function SleepChart({ data }: SleepChartProps) {
    const formattedData = data.map(d => ({
        ...d,
        dateLabel: format(parseISO(d.date), "EEE", { locale: fr }),
    })).reverse() // Assuming data comes in descending order

    // Sort by date ascending
    const sortedData = [...formattedData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (sortedData.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg bg-slate-50">
                Pas assez de données pour afficher le graphique
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="dateLabel"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 12]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: number) => [`${value} h`, "Sommeil"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#8B5CF6" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
