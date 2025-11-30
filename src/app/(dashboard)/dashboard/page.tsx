import { createClient } from "@/lib/supabase/server"
import { QuoteCard } from "@/components/features/dashboard/quote-card"
import { DailyChecklist } from "@/components/features/dashboard/daily-checklist"
import { WeeklyMoodChart } from "@/components/features/dashboard/weekly-mood-chart"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const userName = user.user_metadata.name || "Utilisatrice"

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Salut {userName} !</h1>
                <p className="text-muted-foreground">Prête à conquérir ta journée ?</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 md:col-span-2">
                    <QuoteCard />
                </div>
                <div className="col-span-1">
                    <DailyChecklist />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <div className="col-span-1 lg:col-span-3">
                    <WeeklyMoodChart />
                </div>
            </div>
        </div>
    )
}
