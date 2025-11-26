"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Square, Volume2, VolumeX, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function BreathingExercise() {
    const { user } = useAuth()
    const supabase = createClient()

    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [duration, setDuration] = useState(5) // minutes
    const [timeLeft, setTimeLeft] = useState(5 * 60)
    const [phase, setPhase] = useState<"inhale" | "exhale">("inhale")
    const [soundEnabled, setSoundEnabled] = useState(false)
    const [showBenevolentThought, setShowBenevolentThought] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [cycleCount, setCycleCount] = useState(0)
    const [stats, setStats] = useState({ count: 0, dates: [] as string[] })

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const phaseTimerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number | null>(null)

    useEffect(() => {
        if (user) {
            fetchStats()
        }
    }, [user])

    const fetchStats = async () => {
        if (!user) return
        const startOfMonth = new Date()
        startOfMonth.setDate(1)

        const { data } = await supabase
            .from("coherence_sessions")
            .select("date")
            .eq("user_id", user.id)
            .gte("date", startOfMonth.toISOString())

        if (data) {
            setStats({
                count: data.length,
                dates: data.map(d => format(new Date(d.date), "yyyy-MM-dd"))
            })
        }
    }

    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finishSession()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            // Breathing cycle logic (5s inhale, 5s exhale)
            const cycleDuration = 5000 // 5 seconds

            const runCycle = () => {
                setPhase((prev) => {
                    const next = prev === "inhale" ? "exhale" : "inhale"
                    if (next === "inhale") setCycleCount(c => c + 1)
                    return next
                })
            }

            phaseTimerRef.current = setInterval(runCycle, cycleDuration)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
            if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (phaseTimerRef.current) clearInterval(phaseTimerRef.current)
        }
    }, [isActive, isPaused])

    const startSession = () => {
        setIsActive(true)
        setIsPaused(false)
        setCompleted(false)
        setShowBenevolentThought(false)
        setTimeLeft(duration * 60)
        setPhase("inhale")
        setCycleCount(1)
        startTimeRef.current = Date.now()
    }

    const pauseSession = () => {
        setIsPaused(true)
    }

    const resumeSession = () => {
        setIsPaused(false)
    }

    const stopSession = () => {
        setIsActive(false)
        setIsPaused(false)
        setTimeLeft(duration * 60)
        setPhase("inhale")
        setCycleCount(0)
    }

    const finishSession = async () => {
        setIsActive(false)
        setCompleted(true)
        setShowBenevolentThought(true)

        if (user) {
            await supabase.from("coherence_sessions").insert({
                user_id: user.id,
                date: new Date().toISOString(),
                duration_minutes: duration,
                completed: true
            })
            fetchStats()
            toast.success("Séance enregistrée !")
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-500" />
                    Cohérence Cardiaque
                </CardTitle>
                <CardDescription>
                    Un exercice de respiration pour calmer votre système nerveux.
                    Inspirez 5s, Expirez 5s.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {!isActive && !completed ? (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>Durée de la séance</Label>
                            <RadioGroup
                                defaultValue={duration.toString()}
                                onValueChange={(v) => setDuration(parseInt(v))}
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="3" id="r3" />
                                    <Label htmlFor="r3">3 min</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="5" id="r5" />
                                    <Label htmlFor="r5">5 min</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="10" id="r10" />
                                    <Label htmlFor="r10">10 min</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="sound"
                                checked={soundEnabled}
                                onCheckedChange={setSoundEnabled}
                            />
                            <Label htmlFor="sound" className="flex items-center cursor-pointer">
                                {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                                Son activé (Gong)
                            </Label>
                        </div>

                        <Button size="lg" className="w-full" onClick={startSession}>
                            <Play className="w-4 h-4 mr-2" /> Démarrer l'exercice
                        </Button>

                        <div className="text-center text-sm text-muted-foreground pt-4">
                            Vous avez effectué <span className="font-bold text-primary">{stats.count}</span> séances ce mois-ci.
                        </div>
                    </div>
                ) : completed ? (
                    <div className="text-center space-y-6 py-8">
                        <h3 className="text-2xl font-bold text-green-600">🎉 Bravo !</h3>
                        <p className="text-muted-foreground">Vous avez terminé votre séance.</p>

                        {showBenevolentThought && (
                            <div className="p-6 bg-pink-50 rounded-xl border border-pink-100">
                                <p className="text-xl font-medium text-pink-800 italic">
                                    "Je suis assez, même quand je ne fais rien."
                                </p>
                            </div>
                        )}

                        <Button onClick={() => setCompleted(false)}>Recommencer</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-8">
                        <div className="text-4xl font-mono font-bold text-slate-700">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="relative flex items-center justify-center w-64 h-64">
                            {/* Breathing Circle Animation */}
                            <div
                                className={`absolute rounded-full bg-teal-100 transition-all duration-[5000ms] ease-in-out ${phase === "inhale" ? "w-64 h-64 opacity-100" : "w-24 h-24 opacity-60"
                                    }`}
                            />
                            <div className="z-10 text-2xl font-bold text-teal-800 uppercase tracking-widest">
                                {phase === "inhale" ? "Inspirez" : "Expirez"}
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Cycle {cycleCount} / {duration * 6}
                        </div>

                        <div className="flex space-x-4">
                            {isPaused ? (
                                <Button onClick={resumeSession} variant="outline" size="lg">
                                    <Play className="w-4 h-4 mr-2" /> Reprendre
                                </Button>
                            ) : (
                                <Button onClick={pauseSession} variant="outline" size="lg">
                                    <Pause className="w-4 h-4 mr-2" /> Pause
                                </Button>
                            )}
                            <Button onClick={stopSession} variant="destructive" size="lg">
                                <Square className="w-4 h-4 mr-2" /> Arrêter
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
