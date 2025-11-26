"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export function DailyChecklist() {
    const { user } = useAuth()
    const supabase = createClient()
    const [checklist, setChecklist] = useState({
        water_check: false,
        hunger_check: false,
        breathing_check: false,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchChecklist = async () => {
            const today = format(new Date(), "yyyy-MM-dd")
            const { data, error } = await supabase
                .from("daily_checklist")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", today)
                .single()

            if (data) {
                setChecklist({
                    water_check: data.water_check,
                    hunger_check: data.hunger_check,
                    breathing_check: data.breathing_check,
                })
            }
            setLoading(false)
        }

        fetchChecklist()
    }, [user])

    const handleCheck = async (key: keyof typeof checklist, checked: boolean) => {
        if (!user) return

        // Optimistic update
        setChecklist((prev) => ({ ...prev, [key]: checked }))

        const today = format(new Date(), "yyyy-MM-dd")

        // Check if entry exists
        const { data: existingData } = await supabase
            .from("daily_checklist")
            .select("id")
            .eq("user_id", user.id)
            .eq("date", today)
            .single()

        let error
        if (existingData) {
            const { error: updateError } = await supabase
                .from("daily_checklist")
                .update({ [key]: checked })
                .eq("id", existingData.id)
            error = updateError
        } else {
            const { error: insertError } = await supabase
                .from("daily_checklist")
                .insert({
                    user_id: user.id,
                    date: today,
                    [key]: checked,
                })
            error = insertError
        }

        if (error) {
            toast.error("Erreur lors de la mise à jour")
            // Revert optimistic update
            setChecklist((prev) => ({ ...prev, [key]: !checked }))
        }
    }

    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center text-red-500">
                        <Heart className="w-5 h-5 mr-2" />
                        Liste de contrôle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center text-red-500">
                    <Heart className="w-5 h-5 mr-2" />
                    Liste de contrôle quotidienne
                </CardTitle>
                <CardDescription>
                    Restez sur la bonne voie avec vos objectifs du jour.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="water"
                        checked={checklist.water_check}
                        onCheckedChange={(c) => handleCheck("water_check", c as boolean)}
                    />
                    <Label htmlFor="water" className="text-base font-normal cursor-pointer">
                        J'ai bu au moins 5 verres d'eau ?
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="hunger"
                        checked={checklist.hunger_check}
                        onCheckedChange={(c) => handleCheck("hunger_check", c as boolean)}
                    />
                    <Label htmlFor="hunger" className="text-base font-normal cursor-pointer">
                        Ai-je ressenti la vraie faim ?
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="breathing"
                        checked={checklist.breathing_check}
                        onCheckedChange={(c) => handleCheck("breathing_check", c as boolean)}
                    />
                    <Label htmlFor="breathing" className="text-base font-normal cursor-pointer">
                        Ai-je pris une pause de respiration aujourd'hui ?
                    </Label>
                </div>
            </CardContent>
        </Card>
    )
}
