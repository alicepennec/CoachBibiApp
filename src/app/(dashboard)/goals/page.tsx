import { KanbanBoard } from "@/components/features/goals/kanban-board"

export default function GoalsPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col space-y-2 flex-shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Mes Objectifs</h1>
                <p className="text-muted-foreground">
                    Définissez, suivez et célébrez vos petites victoires.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <KanbanBoard />
            </div>
        </div>
    )
}
