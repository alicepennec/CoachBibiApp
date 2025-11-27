"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const goalSchema = z.object({
    title: z.string().min(2, "Le titre est trop court"),
    description: z.string().optional(),
    category: z.string().min(1, "Veuillez choisir une catégorie"),
    status: z.enum(["a-commencer", "en-cours", "consolidation", "acquis"]),
})

interface GoalFormProps {
    goal?: any
    onSaved: () => void
    onCancel: () => void
}

export function GoalForm({ goal, onSaved, onCancel }: GoalFormProps) {
    const { user } = useAuth()
    const supabase = createClient()
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<z.infer<typeof goalSchema>>({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            title: goal?.title || "",
            description: goal?.description || "",
            category: goal?.category || "bien-etre",
            status: goal?.status || "a-commencer",
        },
    })

    async function onSubmit(values: z.infer<typeof goalSchema>) {
        if (!user) return
        setSubmitting(true)

        try {
            if (goal) {
                // Update
                const { error } = await supabase
                    .from("goals")
                    .update({
                        title: values.title,
                        description: values.description,
                        category: values.category,
                        status: values.status,
                    })
                    .eq("id", goal.id)

                if (error) throw error
                toast.success("Objectif mis à jour")
            } else {
                // Create
                // Get max order position
                const { data: maxOrder } = await supabase
                    .from("goals")
                    .select("order_position")
                    .eq("user_id", user.id)
                    .order("order_position", { ascending: false })
                    .limit(1)
                    .single()

                const nextOrder = maxOrder ? maxOrder.order_position + 1 : 0

                const { error } = await supabase
                    .from("goals")
                    .insert({
                        user_id: user.id,
                        title: values.title,
                        description: values.description,
                        category: values.category,
                        status: values.status,
                        order_position: nextOrder,
                    })

                if (error) throw error
                toast.success("Objectif créé")
            }
            onSaved()
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Titre</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Boire 2L d'eau" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catégorie</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une catégorie" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="nutrition">Nutrition</SelectItem>
                                    <SelectItem value="sport">Sport</SelectItem>
                                    <SelectItem value="bien-etre">Bien-être</SelectItem>
                                    <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un statut" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="a-commencer">À commencer</SelectItem>
                                    <SelectItem value="en-cours">En cours</SelectItem>
                                    <SelectItem value="consolidation">Consolidation</SelectItem>
                                    <SelectItem value="acquis">Acquis</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (optionnel)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Détails..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </div>
            </form>
        </Form>
    )
}
