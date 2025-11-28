"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Trash2, Moon, Star } from "lucide-react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { SleepChart } from "./sleep-chart"

const sleepSchema = z.object({
    date: z.string(),
    hours_slept: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0 && val <= 24, { message: "Heures invalides" }),
    quality_rating: z.number().min(1).max(5),
    notes: z.string().optional(),
})

export function SleepTracker() {
    const { user } = useAuth()
    const supabase = createClient()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const form = useForm<z.infer<typeof sleepSchema>>({
        resolver: zodResolver(sleepSchema) as unknown as Resolver<z.infer<typeof sleepSchema>>,
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            hours_slept: 7,
            quality_rating: 3,
            notes: "",
        },
    })

    const fetchData = async () => {
        if (!user) return

        const { data } = await supabase
            .from("sleep_logs")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(30)

        if (data) setHistory(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [user])

    async function onSubmit(values: z.infer<typeof sleepSchema>) {
        if (!user) return

        try {
            const { error } = await supabase
                .from("sleep_logs")
                .insert({
                    user_id: user.id,
                    date: values.date,
                    hours_slept: values.hours_slept,
                    quality_rating: values.quality_rating,
                    notes: values.notes,
                })

            if (error) throw error

            toast.success("Sommeil enregistré !")
            form.reset({
                date: format(new Date(), "yyyy-MM-dd"),
                hours_slept: 7,
                quality_rating: 3,
                notes: "",
            })
            fetchData()
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette entrée ?")) return

        const { error } = await supabase
            .from("sleep_logs")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Erreur lors de la suppression")
        } else {
            toast.success("Entrée supprimée")
            fetchData()
        }
    }

    // Stats calculation
    const averageHours = history.length > 0
        ? (history.reduce((acc, curr) => acc + curr.hours_slept, 0) / history.length).toFixed(1)
        : "--"

    const averageQuality = history.length > 0
        ? (history.reduce((acc, curr) => acc + curr.quality_rating, 0) / history.length).toFixed(1)
        : "--"

    const bestNight = history.length > 0
        ? history.reduce((prev, current) => (prev.hours_slept > current.hours_slept) ? prev : current)
        : null

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne d'heures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageHours} h</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Qualité moyenne</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center">
                            {averageQuality} <Star className="ml-2 h-4 w-4 text-yellow-400 fill-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Meilleure nuit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {bestNight ? `${bestNight.hours_slept} h` : "--"}
                        </div>
                        {bestNight && <p className="text-xs text-muted-foreground">{format(new Date(bestNight.date), "dd MMM", { locale: fr })}</p>}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-1 md:col-span-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Moon className="mr-2 h-5 w-5" />
                                Suivi du sommeil
                            </CardTitle>
                            <CardDescription>Un bon sommeil est essentiel pour votre bien-être.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="hours_slept"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Heures de sommeil</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.5"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="quality_rating"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Qualité du sommeil</FormLabel>
                                                <div className="flex space-x-2 mt-2">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <button
                                                            key={rating}
                                                            type="button"
                                                            onClick={() => field.onChange(rating)}
                                                            className={`p-1 rounded-full transition-colors ${field.value >= rating ? "text-yellow-400" : "text-gray-300"
                                                                }`}
                                                        >
                                                            <Star className={`h-6 w-6 ${field.value >= rating ? "fill-yellow-400" : ""}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Commentaire (optionnel)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Notes sur votre nuit..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full">Enregistrer</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution du sommeil</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SleepChart data={history.map(h => ({ date: h.date, hours: h.hours_slept }))} />
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1 md:col-span-3">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Historique</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Heures</TableHead>
                                        <TableHead>Qualité</TableHead>
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
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">Aucune donnée</TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{format(new Date(item.date), "dd/MM", { locale: fr })}</TableCell>
                                                <TableCell>{item.hours_slept}h</TableCell>
                                                <TableCell>
                                                    <div className="flex">
                                                        {Array.from({ length: item.quality_rating }).map((_, i) => (
                                                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
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
        </div>
    )
}
