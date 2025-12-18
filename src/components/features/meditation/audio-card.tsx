"use client"

import { useState, useRef } from "react"
import { Play, Pause, Sun, Moon, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AudioCardProps {
    title: string
    description: string
    icon: "sun" | "moon" | "shield"
    duration: string
    audioUrl?: string
}

export function AudioCard({ title, description, icon, duration, audioUrl }: AudioCardProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const Icon = icon === "sun" ? Sun : icon === "moon" ? Moon : ShieldAlert
    const color = icon === "sun" ? "text-amber-500" : icon === "moon" ? "text-indigo-500" : "text-red-500"
    const bgColor = icon === "sun" ? "bg-amber-100" : icon === "moon" ? "bg-indigo-100" : "bg-red-100"

    const handlePlay = async () => {
        if (!audioUrl) {
            toast.info("Lecture audio bientôt disponible", {
                description: "Les fichiers audio seront intégrés prochainement."
            })
            return
        }

        try {
            if (isPlaying) {
                audioRef.current?.pause()
                setIsPlaying(false)
            } else {
                await audioRef.current?.play()
                setIsPlaying(true)
            }
        } catch (error) {
            console.error("Audio playback error:", error)
            toast.error("Erreur de lecture", {
                description: "Impossible de lire le fichier audio. Vérifiez votre connexion ou le format du fichier."
            })
            setIsPlaying(false)
        }
    }

    const handleError = () => {
        setIsPlaying(false)
        toast.error("Fichier audio inaccessible", {
            description: "Le fichier audio demandé est introuvable ou corrompu."
        })
    }

    const handleEnded = () => {
        setIsPlaying(false)
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
                    <Button size="sm" onClick={handlePlay} variant={isPlaying ? "secondary" : "default"}>
                        {isPlaying ? (
                            <Pause className="w-4 h-4 mr-2" />
                        ) : (
                            <Play className="w-4 h-4 mr-2" />
                        )}
                        {isPlaying ? "Pause" : "Écouter"}
                    </Button>
                    {audioUrl && (
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={handleEnded}
                            onError={handleError}
                            className="hidden"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
