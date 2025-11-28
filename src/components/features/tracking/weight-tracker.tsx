"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Plus, Trash2, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { WeightChart } from "./weight-chart"

const weightSchema = z.object({
    date: z.string(),
    weight: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, { message: "Poids invalide" }),
    notes: z.string().optional(),
})

export function WeightTracker() {
    const { user } = useAuth()
    const supabase = createClient()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [goalWeight, setGoalWeight] = useState<number | null>(null)

    const form = useForm<z.infer<typeof weightSchema>>({
        resolver: zodResolver(weightSchema) as unknown as Resolver<z.infer<typeof weightSchema>>,
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            weight: 0, // Will be handled as string input
            notes: "",
        },
    })

    const fetchData = async () => {
        if (!user) return

        // Fetch weight entries
        const { data: entries } = await supabase
            .from("weight_entries")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(30)

        if (entries) setHistory(entries)

        // Fetch profile for goal weight
        const { data: profile } = await supabase
            .from("profiles")
            .select("goal_weight")
            .eq("id", user.id)
            .single()

        if (profile) setGoalWeight(profile.goal_weight)

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [user])

    async function onSubmit(values: z.infer<typeof weightSchema>) {
        if (!user) return

        try {
            const { error } = await supabase
                .from("weight_entries")
                .insert({
                    user_id: user.id,
                    date: values.date,
                    weight_kg: values.weight,
                    notes: values.notes,
                })

            if (error) throw error

            // Update current weight in profile
            await supabase
                .from("profiles")
                .update({ current_weight: values.weight })
                .eq("id", user.id)

            toast.success("Pesée enregistrée !")
            setOpen(false)
            form.reset({
                date: format(new Date(), "yyyy-MM-dd"),
                weight: 0,
                notes: "",
            })
            fetchData()
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette pesée ?")) return

        const { error } = await supabase
            .from("weight_entries")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Erreur lors de la suppression")
        } else {
            toast.success("Pesée supprimée")
            fetchData()
        }
    }

    const currentWeight = history.length > 0 ? history[0].weight_kg : null
    const startWeight = history.length > 0 ? history[history.length - 1].weight_kg : null
    const progress = startWeight && currentWeight ? (currentWeight - startWeight).toFixed(1) : 0
    const progressNum = parseFloat(progress as string)

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Poids actuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentWeight ? `${currentWeight} kg` : "--"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Objectif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{goalWeight ? `${goalWeight} kg` : "--"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Progression</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold flex items-center ${progressNum < 0 ? 'text-green-600' : progressNum > 0 ? 'text-red-600' : ''}`}>
                            {progressNum > 0 ? <TrendingUp className="mr-2 h-4 w-4" /> : progressNum < 0 ? <TrendingDown className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />}
                            {progressNum > 0 ? "+" : ""}{progress} kg
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-1 md:col-span-4 space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Évolution du poids</CardTitle>
                                <CardDescription>Suivez votre progression au fil du temps.</CardDescription>
                            </div>
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button><Plus className="mr-2 h-4 w-4" /> Ajouter une pesée</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nouvelle pesée</DialogTitle>
                                    </DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                name="weight"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Poids (kg)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                placeholder="ex: 65.5"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e.target.value)} // Handle as string initially for input
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="notes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Notes (optionnel)</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Commentaire..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full">Enregistrer</Button>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <WeightChart data={history.map(h => ({ date: h.date, weight: h.weight_kg }))} />
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
                                        <TableHead>Poids</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center">Chargement...</TableCell>
                                        </TableRow>
                                    ) : history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">Aucune donnée</TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{format(new Date(item.date), "dd/MM", { locale: fr })}</TableCell>
                                                <TableCell className="font-medium">{item.weight_kg} kg</TableCell>
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
