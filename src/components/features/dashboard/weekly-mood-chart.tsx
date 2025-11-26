"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { BarChart as BarChartIcon } from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { fr } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export function WeeklyMoodChart() {
    const { user } = useAuth()
    const supabase = createClient()
    const [data, setData] = useState<{ day: string; mood: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchMoods = async () => {
            const today = new Date()
            const sevenDaysAgo = subDays(today, 6)

            const { data: moodLogs } = await supabase
                .from("mood_logs")
                .select("date, mood_rating")
                .eq("user_id", user.id)
                .gte("date", format(sevenDaysAgo, "yyyy-MM-dd"))
                .lte("date", format(today, "yyyy-MM-dd"))
                .order("date", { ascending: true })

            // Prepare data for the last 7 days, filling in missing days with 0 or null
            const chartData = []
            for (let i = 6; i >= 0; i--) {
                const date = subDays(today, i)
                const dateStr = format(date, "yyyy-MM-dd")
                const dayLabel = format(date, "EEE", { locale: fr })

                const log = moodLogs?.find((l) => l.date === dateStr)

                chartData.push({
                    day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), // Capitalize
                    mood: log ? log.mood_rating : 0,
                    fullDate: dateStr
                })
            }

            setData(chartData)
            setLoading(false)
        }

        fetchMoods()
    }, [user])

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-500">
                        <BarChartIcon className="w-5 h-5 mr-2" />
                        Humeur de la semaine
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <div className="animate-pulse w-full h-full bg-slate-100 rounded"></div>
                </CardContent>
            </Card>
        )
    }

    const hasData = data.some(d => d.mood > 0)

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center text-blue-500">
                    <BarChartIcon className="w-5 h-5 mr-2" />
                    Humeur de la semaine
                </CardTitle>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="day"
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
                                    domain={[0, 5]}
                                    ticks={[1, 2, 3, 4, 5]}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Humeur
                                                            </span>
                                                            <span className="font-bold text-muted-foreground">
                                                                {payload[0].value}/5
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    dataKey="mood"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                        <p>Pas encore de données.</p>
                        <p className="text-sm">Commencez à noter votre humeur dans la section Suivi.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
