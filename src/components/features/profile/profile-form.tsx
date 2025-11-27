"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, User, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const profileSchema = z.object({
    full_name: z.string().min(2, "Le nom est trop court"),
    age: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0 && val < 120, { message: "Âge invalide" }).optional(),
    height_cm: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0 && val < 300, { message: "Taille invalide" }).optional(),
    goal_weight: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val > 0, { message: "Poids invalide" }).optional(),
    dietary_preferences: z.string().optional(),
})

export function ProfileForm() {
    const { user } = useAuth()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: "",
            age: undefined,
            height_cm: undefined,
            goal_weight: undefined,
            dietary_preferences: "none",
        },
    })

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

            if (data) {
                form.reset({
                    full_name: data.full_name || "",
                    age: data.age?.toString(),
                    height_cm: data.height_cm?.toString(),
                    goal_weight: data.goal_weight?.toString(),
                    dietary_preferences: data.dietary_preferences || "none",
                })
            }
            setLoading(false)
        }

        fetchProfile()
    }, [user])

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        if (!user) return
        setSaving(true)

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: values.full_name,
                    age: values.age,
                    height_cm: values.height_cm,
                    goal_weight: values.goal_weight,
                    dietary_preferences: values.dietary_preferences,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id)

            if (error) throw error
            toast.success("Profil mis à jour avec succès")
        } catch (error) {
            toast.error("Erreur lors de la mise à jour")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Profil</CardTitle>
                    <CardDescription>Chargement...</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Informations personnelles
                </CardTitle>
                <CardDescription>
                    Mettez à jour vos informations pour personnaliser votre expérience.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom complet</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Votre nom" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Âge</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ans" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="height_cm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Taille (cm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="cm" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="goal_weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Poids objectif (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="kg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="dietary_preferences"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Préférences alimentaires</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Aucune restriction</SelectItem>
                                            <SelectItem value="vegetarian">Végétarien</SelectItem>
                                            <SelectItem value="vegan">Vegan</SelectItem>
                                            <SelectItem value="gluten-free">Sans gluten</SelectItem>
                                            <SelectItem value="lactose-free">Sans lactose</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Cela nous aidera à vous suggérer des recettes adaptées.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les modifications
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
