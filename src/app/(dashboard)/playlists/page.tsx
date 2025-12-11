"use client"

import { AudioCard } from "@/components/features/meditation/audio-card"
import { BreathingExercise } from "@/components/features/meditation/breathing-exercise"

export default function PlaylistsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Méditations Guidées</h1>
                <p className="text-muted-foreground">
                    Ressources audio pour votre paix intérieure et votre concentration.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">☀️</span> Audios de Visualisation
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                    <AudioCard
                        title="Visualisation du matin"
                        description="Visualisation de la journée au niveau comportement alimentaire avec incarnation du soi du futur."
                        icon="sun"
                        duration="5-10 min"
                        audioUrl="/meditation/visualisation-matin.mp3"
                    />
                    <AudioCard
                        title="Visualisation du soir"
                        description="Visualisation des détails de bien-être dans son corps léger."
                        icon="moon"
                        duration="5-10 min"
                        audioUrl="/meditation/visualisation-soir.mp3"
                    />
                    <AudioCard
                        title="Visualisation d'urgence"
                        description="Je traverse mes envies sans les juger."
                        icon="shield"
                        duration="3-5 min"
                        audioUrl="/meditation/visualisation-urgence.mp3"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">💗</span> Cohérence Cardiaque
                </h2>
                <BreathingExercise />
            </div>
        </div>
    )
}
