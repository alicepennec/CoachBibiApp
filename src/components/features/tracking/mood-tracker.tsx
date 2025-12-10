"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Loader2, Trash2, Pencil } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { WeeklyMoodChart } from "@/components/features/dashboard/weekly-mood-chart"

const moodSchema = z.object({
    mood_rating: z.number().min(1).max(5),
    mood_word: z.string().min(1, "Veuillez choisir un mot"),
})

const MOOD_WORDS = [
    "sereine", "joyeuse", "fatiguée", "stressée",
    "motivée", "anxieuse", "paisible", "énergique"
]

export function MoodTracker() {
    const { user } = useAuth()
    const supabase = createClient()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<z.infer<typeof moodSchema>>({
        resolver: zodResolver(moodSchema),
        defaultValues: {
            mood_rating: 3,
            mood_word: "",
        },
    })

    const fetchHistory = async () => {
        if (!user?.id) return
        const { data } = await supabase
            .from("mood_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(30)

        if (data) setHistory(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchHistory()
    }, [user])

    async function onSubmit(values: z.infer<typeof moodSchema>) {
        if (!user?.id) return
        setSubmitting(true)

        const today = format(new Date(), "yyyy-MM-dd")

        try {
            const { error } = await supabase
                .from("mood_logs")
                .insert({
                    user_id: user.id,
                    date: today,
                    mood_rating: values.mood_rating,
                    mood_word: values.mood_word,
                })

            if (error) throw error

            toast.success("Humeur enregistrée avec succès !")
            form.reset()
            fetchHistory()
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Êtes-vous sûre de vouloir supprimer cette entrée ?")) return

        const { error } = await supabase
            .from("mood_logs")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Erreur lors de la suppression")
        } else {
            toast.success("Entrée supprimée")
            fetchHistory()
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Suivi de l'humeur</CardTitle>
                        <CardDescription>Notez votre humeur du jour et visualisez la tendance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="mood_rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comment vous sentez-vous aujourd'hui ? ({field.value}/5)</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={1}
                                                    max={5}
                                                    step={1}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mood_word"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Choisissez un mot pour décrire votre état :</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionnez un mot" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {MOOD_WORDS.map((word) => (
                                                        <SelectItem key={word} value={word}>
                                                            {word.charAt(0).toUpperCase() + word.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Enregistrer mon humeur du jour
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="h-[300px]">
                    <WeeklyMoodChart />
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Historique</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Humeur</TableHead>
                                    <TableHead>Mot</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">Chargement...</TableCell>
                                    </TableRow>
                                ) : history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Aucune donnée
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{format(new Date(item.date), "dd/MM", { locale: fr })}</TableCell>
                                            <TableCell>{item.mood_rating}/5</TableCell>
                                            <TableCell className="capitalize">{item.mood_word}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
