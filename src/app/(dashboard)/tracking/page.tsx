"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoodTracker } from "@/components/features/tracking/mood-tracker"
import { WeightTracker } from "@/components/features/tracking/weight-tracker"
import { MeasurementsTracker } from "@/components/features/tracking/measurements-tracker"
import { SleepTracker } from "@/components/features/tracking/sleep-tracker"

export default function TrackingPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Suivi des progrès</h1>
                <p className="text-muted-foreground">
                    Visualisez votre parcours vers une meilleure version de vous-même.
                </p>
            </div>

            <Tabs defaultValue="mood" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="mood">Humeur</TabsTrigger>
                    <TabsTrigger value="weight">Poids</TabsTrigger>
                    <TabsTrigger value="measurements">Mensurations</TabsTrigger>
                    <TabsTrigger value="sleep">Sommeil</TabsTrigger>
                </TabsList>

                <TabsContent value="mood" className="space-y-4">
                    <MoodTracker />
                </TabsContent>

                <TabsContent value="weight" className="space-y-4">
                    <WeightTracker />
                </TabsContent>

                <TabsContent value="measurements" className="space-y-4">
                    <MeasurementsTracker />
                </TabsContent>

                <TabsContent value="sleep" className="space-y-4">
                    <SleepTracker />
                </TabsContent>
            </Tabs>
        </div>
    )
}
