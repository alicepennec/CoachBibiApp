"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GoalCard } from "./goal-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GoalColumnProps {
    column: { id: string; title: string; icon: string; color: string }
    goals: any[]
    onEdit: (goal: any) => void
    onDelete: (id: string) => void
}

export function GoalColumn({ column, goals, onEdit, onDelete }: GoalColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    })

    return (
        <Card className={`h-full flex flex-col ${column.color} border-none shadow-none`}>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span className="flex items-center">
                        <span className="mr-2 text-lg">{column.icon}</span>
                        {column.title}
                    </span>
                    <span className="bg-white/50 text-slate-600 text-xs px-2 py-1 rounded-full">
                        {goals.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-y-auto min-h-[150px]">
                <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                    <div ref={setNodeRef} className="space-y-2 min-h-[100px]">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </CardContent>
        </Card>
    )
}
