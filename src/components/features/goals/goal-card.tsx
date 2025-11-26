"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Pencil, Trash2, Apple, Dumbbell, Heart, Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface GoalCardProps {
    goal: any
    onEdit: (goal: any) => void
    onDelete: (id: string) => void
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: goal.id, data: { ...goal } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const getIcon = (category: string) => {
        switch (category) {
            case "nutrition": return <Apple className="w-4 h-4 mr-2 text-green-500" />
            case "sport": return <Dumbbell className="w-4 h-4 mr-2 text-blue-500" />
            case "bien-etre": return <Heart className="w-4 h-4 mr-2 text-pink-500" />
            default: return <Star className="w-4 h-4 mr-2 text-yellow-500" />
        }
    }

    const getBadgeColor = (category: string) => {
        switch (category) {
            case "nutrition": return "bg-green-100 text-green-800 hover:bg-green-100"
            case "sport": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case "bien-etre": return "bg-pink-100 text-pink-800 hover:bg-pink-100"
            default: return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        }
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center font-medium">
                            {getIcon(goal.category)}
                            <span className="line-clamp-2 text-sm">{goal.title}</span>
                        </div>
                    </div>
                    {goal.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {goal.description}
                        </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0.5 h-5 ${getBadgeColor(goal.category)}`}>
                            {goal.category}
                        </Badge>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                    e.stopPropagation() // Prevent drag start
                                    onEdit(goal)
                                }}
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(goal.id)
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
