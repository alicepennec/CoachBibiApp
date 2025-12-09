"use client"

import { useState } from "react"
import { useForm, useFieldArray, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const recipeSchema = z.object({
    title: z.string().min(3, "Titre trop court"),
    description: z.string().min(10, "Description trop courte"),
    category: z.string(),
    prep_time_minutes: z.coerce.number().min(0, "Doit être positif"),
    cook_time_minutes: z.coerce.number().min(0, "Doit être positif"),
    servings: z.coerce.number().min(1, "Au moins 1 portion"),
    calories: z.coerce.number().min(0, "Doit être positif"),
    protein_g: z.coerce.number().min(0, "Doit être positif"),
    carbs_g: z.coerce.number().min(0, "Doit être positif"),
    fat_g: z.coerce.number().min(0, "Doit être positif"),
    image_url: z.string().url().optional().or(z.literal("")),
    is_vegetarian: z.boolean().default(false),
    is_vegan: z.boolean().default(false),
    is_gluten_free: z.boolean().default(false),
    is_quick: z.boolean().default(false),
    ingredients: z.array(z.object({
        name: z.string().min(1),
        quantity: z.string().min(1),
        unit: z.string().optional()
    })),
    steps: z.array(z.object({
        description: z.string().min(1)
    }))
})

import { Database } from "@/types/database.types"

interface RecipeFormProps {
    recipe?: Database['api']['Tables']['recipes']['Row']
    onSaved: () => void
    onCancel: () => void
}

export function RecipeForm({ recipe, onSaved, onCancel }: RecipeFormProps) {
    const { user } = useAuth()
    const supabase = createClient()
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<z.infer<typeof recipeSchema>>({
        resolver: zodResolver(recipeSchema) as Resolver<z.infer<typeof recipeSchema>>,
        defaultValues: {
            title: recipe?.title || "",
            description: recipe?.description || "",
            category: recipe?.category || "dejeuner",
            prep_time_minutes: recipe?.prep_time_minutes ?? 15,
            cook_time_minutes: recipe?.cook_time_minutes ?? 15,
            servings: recipe?.servings ?? 2,
            calories: recipe?.calories ?? 400,
            protein_g: recipe?.protein_g ?? 20,
            carbs_g: recipe?.carbs_g ?? 30,
            fat_g: recipe?.fat_g ?? 15,
            image_url: recipe?.image_url || "",
            is_vegetarian: recipe?.is_vegetarian || false,
            is_vegan: recipe?.is_vegan || false,
            is_gluten_free: recipe?.is_gluten_free || false,
            is_quick: recipe?.is_quick || false,
            ingredients: (recipe?.ingredients as Array<{ name: string, quantity: string, unit?: string }>) || [{ name: "", quantity: "", unit: "" }],
            steps: (recipe?.steps as Array<string>)?.map((s: string) => ({ description: s })) || [{ description: "" }]
        }
    })

    const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control: form.control,
        name: "ingredients"
    })

    const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
        control: form.control,
        name: "steps"
    })

    async function onSubmit(values: z.infer<typeof recipeSchema>) {
        if (!user) return
        setSubmitting(true)

        try {
            const recipeData = {
                title: values.title,
                description: values.description,
                category: values.category,
                prep_time_minutes: values.prep_time_minutes,
                cook_time_minutes: values.cook_time_minutes,
                servings: values.servings,
                calories: values.calories,
                protein_g: values.protein_g,
                carbs_g: values.carbs_g,
                fat_g: values.fat_g,
                image_url: values.image_url,
                is_vegetarian: values.is_vegetarian,
                is_vegan: values.is_vegan,
                is_gluten_free: values.is_gluten_free,
                is_quick: values.is_quick,
                ingredients: values.ingredients,
                steps: values.steps.map(s => s.description), // Flatten steps
                created_by_coach_id: user.id,
                is_active: true
            }

            if (recipe) {
                const { error } = await supabase
                    .from("recipes")
                    .update(recipeData)
                    .eq("id", recipe.id)
                if (error) throw error
                toast.success("Recette mise à jour")
            } else {
                const { error } = await supabase
                    .from("recipes")
                    .insert(recipeData)
                if (error) throw error
                toast.success("Recette créée")
            }
            onSaved()
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Titre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Titre de la recette" {...field} />
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
                                            <SelectValue placeholder="Choisir" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="petit-dejeuner">Petit-déjeuner</SelectItem>
                                        <SelectItem value="dejeuner">Déjeuner</SelectItem>
                                        <SelectItem value="gouter">Goûter</SelectItem>
                                        <SelectItem value="diner">Dîner</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Image</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Description courte..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="prep_time_minutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prép (min)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cook_time_minutes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cuisson (min)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="servings"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Portions</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="calories"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kcal</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="protein_g"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Protéines (g)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="carbs_g"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Glucides (g)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fat_g"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lipides (g)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-wrap gap-4">
                    <FormField
                        control={form.control}
                        name="is_vegetarian"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Végétarien</FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_vegan"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Vegan</FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_gluten_free"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Sans gluten</FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_quick"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel>Rapide</FormLabel>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Ingrédients</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ name: "", quantity: "", unit: "" })}>
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    {ingredientFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem className="w-24">
                                        <FormControl>
                                            <Input placeholder="Qté" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`ingredients.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Nom de l'ingrédient" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Étapes</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendStep({ description: "" })}>
                            <Plus className="h-4 w-4 mr-2" /> Ajouter
                        </Button>
                    </div>
                    {stepFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold flex-shrink-0">
                                {index + 1}
                            </div>
                            <FormField
                                control={form.control}
                                name={`steps.${index}.description`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Textarea placeholder={`Étape ${index + 1}`} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-white border-t p-4 -mx-4 -mb-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                    </Button>
                </div>
            </form>
        </Form>
    )
}
