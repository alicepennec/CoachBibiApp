"use client"

import { Play, Sun, Moon, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AudioCardProps {
    title: string
    description: string
    icon: "sun" | "moon" | "shield"
    duration: string
}

export function AudioCard({ title, description, icon, duration }: AudioCardProps) {
    const Icon = icon === "sun" ? Sun : icon === "moon" ? Moon : ShieldAlert
    const color = icon === "sun" ? "text-amber-500" : icon === "moon" ? "text-indigo-500" : "text-red-500"
    const bgColor = icon === "sun" ? "bg-amber-100" : icon === "moon" ? "bg-indigo-100" : "bg-red-100"

    const handlePlay = () => {
        toast.info("Lecture audio bientôt disponible", {
            description: "Les fichiers audio seront intégrés prochainement."
        })
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start space-x-4 pb-2">
                <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="line-clamp-2">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground font-medium">{duration}</span>
                    <Button size="sm" onClick={handlePlay}>
                        <Play className="w-4 h-4 mr-2" />
                        Écouter
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
