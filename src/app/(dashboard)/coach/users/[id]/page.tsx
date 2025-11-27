"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Mail, Calendar, Ruler, Weight, Moon, Save } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { WeightChart } from "@/components/features/tracking/weight-chart"
import { SleepChart } from "@/components/features/tracking/sleep-chart"

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const [userProfile, setUserProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [coachNotes, setCoachNotes] = useState("")
    const [savingNotes, setSavingNotes] = useState(false)
    const [weightData, setWeightData] = useState<any[]>([])
    const [sleepData, setSleepData] = useState<any[]>([])
    const [moodData, setMoodData] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            // Fetch profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", params.id)
                .single()

            if (profile) {
                setUserProfile(profile)

                // Fetch coach notes
                const { data: notes } = await supabase
                    .from("coach_notes")
                    .select("content")
                    .eq("user_id", params.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single()

                if (notes) setCoachNotes(notes.content)
            }

            // Fetch tracking data
            const { data: weights } = await supabase
                .from("weight_entries")
                .select("date, weight_kg")
                .eq("user_id", params.id)
                .order("date", { ascending: true })

            if (weights) setWeightData(weights.map(w => ({ date: w.date, weight: w.weight_kg })))

            const { data: sleep } = await supabase
                .from("sleep_logs")
                .select("date, hours_slept")
                .eq("user_id", params.id)
                .order("date", { ascending: true })

            if (sleep) setSleepData(sleep.map(s => ({ date: s.date, hours: s.hours_slept })))

            setLoading(false)
        }

        fetchData()
    }, [params.id])

    const handleSaveNotes = async () => {
        setSavingNotes(true)
        try {
            // Check if note exists for today/general or just insert new one
            // For simplicity, we'll just insert a new note log or update the latest if we had a specific logic
            // But here let's just insert a new one to keep history
            const { error } = await supabase
                .from("coach_notes")
                .insert({
                    user_id: params.id,
                    coach_id: (await supabase.auth.getUser()).data.user?.id,
                    content: coachNotes,
                    is_private: true
                })

            if (error) throw error
            toast.success("Note enregistrée")
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setSavingNotes(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Chargement du profil...</div>
    }

    if (!userProfile) {
        return <div className="p-8 text-center">Utilisateur introuvable</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/coach">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Retour à la liste</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="flex flex-col items-center text-center pb-2">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={userProfile.avatar_url} />
                            <AvatarFallback className="text-2xl">{userProfile.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <CardTitle>{userProfile.full_name}</CardTitle>
                        <CardDescription>{userProfile.email}</CardDescription>
                        <Badge className="mt-2" variant={userProfile.subscription_status === 'active' ? 'default' : 'secondary'}>
                            {userProfile.subscription_status === 'active' ? 'Premium' : 'Gratuit'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                                <span className="text-muted-foreground">Âge</span>
                                <span className="font-bold">{userProfile.age || "-"} ans</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                                <span className="text-muted-foreground">Taille</span>
                                <span className="font-bold">{userProfile.height_cm || "-"} cm</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                                <span className="text-muted-foreground">Poids actuel</span>
                                <span className="font-bold">{userProfile.current_weight || "-"} kg</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                                <span className="text-muted-foreground">Objectif</span>
                                <span className="font-bold">{userProfile.goal_weight || "-"} kg</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <h3 className="font-semibold text-sm">Notes du Coach</h3>
                            <Textarea
                                placeholder="Ajouter une note sur ce membre..."
                                value={coachNotes}
                                onChange={(e) => setCoachNotes(e.target.value)}
                                className="min-h-[150px]"
                            />
                            <Button className="w-full" onClick={handleSaveNotes} disabled={savingNotes}>
                                <Save className="mr-2 h-4 w-4" />
                                Enregistrer la note
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats & Progress */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="weight">
                        <TabsList>
                            <TabsTrigger value="weight">Poids</TabsTrigger>
                            <TabsTrigger value="sleep">Sommeil</TabsTrigger>
                            <TabsTrigger value="activity">Activité</TabsTrigger>
                        </TabsList>

                        <TabsContent value="weight">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Évolution du poids</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <WeightChart data={weightData} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sleep">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Qualité du sommeil</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <SleepChart data={sleepData} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Journal d'activité</CardTitle>
                                    <CardDescription>Dernières actions sur la plateforme</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center text-muted-foreground py-8">
                                        Fonctionnalité à venir
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
