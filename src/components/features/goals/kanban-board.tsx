"use client"

import { useState, useEffect } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { GoalColumn } from "./goal-column"
import { GoalCard } from "./goal-card"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { GoalForm } from "./goal-form"
import { PredefinedGoals } from "./predefined-goals"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Status = "a-commencer" | "en-cours" | "consolidation" | "acquis"

const COLUMNS: { id: Status; title: string; icon: string; color: string }[] = [
    { id: "a-commencer", title: "À commencer", icon: "🎯", color: "bg-slate-100" },
    { id: "en-cours", title: "En cours", icon: "🔄", color: "bg-blue-50" },
    { id: "consolidation", title: "Consolidation", icon: "💪", color: "bg-orange-50" },
    { id: "acquis", title: "Acquis", icon: "✅", color: "bg-green-50" },
]

export function KanbanBoard() {
    const { user } = useAuth()
    const supabase = createClient()
    const [goals, setGoals] = useState<any[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState<any | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const fetchGoals = async () => {
        if (!user) return
        const { data } = await supabase
            .from("goals")
            .select("*")
            .eq("user_id", user.id)
            .order("order_position", { ascending: true })

        if (data) setGoals(data)
    }

    useEffect(() => {
        fetchGoals()
    }, [user])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        const isActiveTask = active.data.current?.type !== "Column"
        const isOverTask = over.data.current?.type !== "Column"

        if (!isActiveTask) return

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setGoals((goals) => {
                const activeIndex = goals.findIndex((t) => t.id === activeId)
                const overIndex = goals.findIndex((t) => t.id === overId)

                if (goals[activeIndex].status !== goals[overIndex].status) {
                    goals[activeIndex].status = goals[overIndex].status
                    return arrayMove(goals, activeIndex, overIndex - 1)
                }

                return arrayMove(goals, activeIndex, overIndex)
            })
        }

        const isOverColumn = over.data.current?.type === "Column"

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setGoals((goals) => {
                const activeIndex = goals.findIndex((t) => t.id === activeId)
                goals[activeIndex].status = overId as Status
                return arrayMove(goals, activeIndex, activeIndex)
            })
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null)
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeGoal = goals.find((g) => g.id === activeId)
        if (!activeGoal) return

        let newStatus = activeGoal.status

        if (over.data.current?.type === "Column") {
            newStatus = overId as Status
        } else if (over.data.current?.type !== "Column") {
            const overGoal = goals.find((g) => g.id === overId)
            if (overGoal) newStatus = overGoal.status
        }

        if (activeGoal.status !== newStatus) {
            // Status changed
            if (newStatus === "acquis") {
                toast.success("Bravo ! Un nouvel objectif acquis ! 🎉")
                // Confetti could go here
            } else {
                toast.success(`Objectif déplacé vers ${COLUMNS.find(c => c.id === newStatus)?.title}`)
            }

            await supabase
                .from("goals")
                .update({ status: newStatus })
                .eq("id", activeId)

            // Update local state to ensure consistency
            setGoals(prev => prev.map(g => g.id === activeId ? { ...g, status: newStatus } : g))
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet objectif ?")) return

        const { error } = await supabase.from("goals").delete().eq("id", id)
        if (error) {
            toast.error("Erreur lors de la suppression")
        } else {
            toast.success("Objectif supprimé")
            setGoals(prev => prev.filter(g => g.id !== id))
        }
    }

    const handleEdit = (goal: any) => {
        setEditingGoal(goal)
        setIsDialogOpen(true)
    }

    const handleGoalSaved = () => {
        setIsDialogOpen(false)
        setEditingGoal(null)
        fetchGoals()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <PredefinedGoals onAdd={fetchGoals} />

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingGoal(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Créer un objectif
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingGoal ? "Modifier l'objectif" : "Créer un nouvel objectif"}</DialogTitle>
                        </DialogHeader>
                        <GoalForm
                            goal={editingGoal}
                            onSaved={handleGoalSaved}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full min-h-[500px]">
                    {COLUMNS.map((col) => (
                        <GoalColumn
                            key={col.id}
                            column={col}
                            goals={goals.filter((g) => g.status === col.id)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <GoalCard
                            goal={goals.find((g) => g.id === activeId)}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
