"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { Trash2, Ruler } from "lucide-react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const measurementsSchema = z.object({
    date: z.string(),
    chest_cm: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, { message: "Valeur invalide" }),
    waist_cm: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, { message: "Valeur invalide" }),
    belly_cm: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, { message: "Valeur invalide" }),
    hips_cm: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, { message: "Valeur invalide" }),
})

export function MeasurementsTracker() {
    const { user } = useAuth()
    const supabase = createClient()
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [firstMeasurement, setFirstMeasurement] = useState<any>(null)

    const form = useForm<z.infer<typeof measurementsSchema>>({
        resolver: zodResolver(measurementsSchema) as unknown as Resolver<z.infer<typeof measurementsSchema>>,
        defaultValues: {
            date: format(new Date(), "yyyy-MM-dd"),
            chest_cm: 0,
            waist_cm: 0,
            belly_cm: 0,
            hips_cm: 0,
        },
    })

    const fetchData = async () => {
        if (!user?.id) return

        const { data } = await supabase
            .from("measurements")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(20)

        if (data) {
            setHistory(data)
            // Fetch the very first measurement for comparison
            const { data: first } = await supabase
                .from("measurements")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: true })
                .limit(1)
                .single()

            if (first) setFirstMeasurement(first)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [user])

    async function onSubmit(values: z.infer<typeof measurementsSchema>) {
        if (!user?.id) return

        try {
            const { error } = await supabase
                .from("measurements")
                .insert({
                    user_id: user.id,
                    date: values.date,
                    chest_cm: values.chest_cm,
                    waist_cm: values.waist_cm,
                    belly_cm: values.belly_cm,
                    hips_cm: values.hips_cm,
                })

            if (error) throw error

            toast.success("Mensurations enregistrées !")
            form.reset({
                date: format(new Date(), "yyyy-MM-dd"),
                chest_cm: 0,
                waist_cm: 0,
                belly_cm: 0,
                hips_cm: 0,
            })
            fetchData()
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer cette entrée ?")) return

        const { error } = await supabase
            .from("measurements")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Erreur lors de la suppression")
        } else {
            toast.success("Entrée supprimée")
            fetchData()
        }
    }

    const calculateTotalLost = (current: any) => {
        if (!firstMeasurement) return 0
        const currentTotal = current.chest_cm + current.waist_cm + current.belly_cm + current.hips_cm
        const firstTotal = firstMeasurement.chest_cm + firstMeasurement.waist_cm + firstMeasurement.belly_cm + firstMeasurement.hips_cm
        return currentTotal - firstTotal
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Ruler className="mr-2 h-5 w-5" />
                        Ajouter de nouvelles mensurations
                    </CardTitle>
                    <CardDescription>Mesurez votre progression au-delà du poids.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                    name="chest_cm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Poitrine (cm)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 95" {...field} onChange={(e) => field.onChange(e.target.value)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="waist_cm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taille (cm)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 70" {...field} onChange={(e) => field.onChange(e.target.value)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="belly_cm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ventre (cm)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 80" {...field} onChange={(e) => field.onChange(e.target.value)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hips_cm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hanches (cm)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Ex: 100" {...field} onChange={(e) => field.onChange(e.target.value)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full">Enregistrer les mensurations</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historique de vos mensurations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Poitrine</TableHead>
                                <TableHead>Taille</TableHead>
                                <TableHead>Ventre</TableHead>
                                <TableHead>Hanches</TableHead>
                                <TableHead>Total perdu</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Chargement...</TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">Aucune donnée</TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => {
                                    const diff = calculateTotalLost(item)
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>{format(new Date(item.date), "dd/MM", { locale: fr })}</TableCell>
                                            <TableCell>{item.chest_cm} cm</TableCell>
                                            <TableCell>{item.waist_cm} cm</TableCell>
                                            <TableCell>{item.belly_cm} cm</TableCell>
                                            <TableCell>{item.hips_cm} cm</TableCell>
                                            <TableCell className={diff < 0 ? "text-green-600 font-bold" : diff > 0 ? "text-red-600 font-bold" : ""}>
                                                {diff > 0 ? "+" : ""}{diff} cm
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
