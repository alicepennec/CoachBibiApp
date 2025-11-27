"use client"

import { useState } from "react"
import { Plus, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const SUGGESTED_GOALS = [
    { title: "Boire un verre d'eau au réveil", category: "nutrition", description: "Pour réhydrater le corps après la nuit." },
    { title: "Manger assis et sans écran", category: "nutrition", description: "Prendre le temps de savourer son repas." },
    { title: "Faire 10 min de marche", category: "sport", description: "Une petite marche digestive ou pour s'aérer." },
    { title: "Cohérence cardiaque 3x/jour", category: "bien-etre", description: "5 minutes de respiration pour s'apaiser." },
    { title: "Noter 3 gratitudes le soir", category: "bien-etre", description: "Cultiver la pensée positive avant de dormir." },
    { title: "Poser sa fourchette entre chaque bouchée", category: "nutrition", description: "Ralentir le rythme du repas." },
]

interface PredefinedGoalsProps {
    onAdd: () => void
}

export function PredefinedGoals({ onAdd }: PredefinedGoalsProps) {
    const { user } = useAuth()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleAddGoal = async (goal: any) => {
        if (!user) return
        setLoading(true)

        try {
            // Get max order
            const { data: maxOrder } = await supabase
                .from("goals")
                .select("order_position")
                .eq("user_id", user.id)
                .order("order_position", { ascending: false })
                .limit(1)
                .single()

            const nextOrder = maxOrder ? maxOrder.order_position + 1 : 0

            const { error } = await supabase
                .from("goals")
                .insert({
                    user_id: user.id,
                    title: goal.title,
                    description: goal.description,
                    category: goal.category,
                    status: "a-commencer",
                    order_position: nextOrder,
                })

            if (error) throw error
            toast.success("Objectif ajouté !")
            onAdd()
        } catch (error) {
            toast.error("Erreur lors de l'ajout")
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading}>
                    <Target className="mr-2 h-4 w-4" />
                    Suggestions d'objectifs
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
                <DropdownMenuLabel>Idées pour commencer</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SUGGESTED_GOALS.map((goal, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => handleAddGoal(goal)}
                        className="cursor-pointer flex flex-col items-start py-2"
                    >
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-xs text-muted-foreground">{goal.description}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
