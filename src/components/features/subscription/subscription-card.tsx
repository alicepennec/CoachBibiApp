"use client"

import { Check, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SubscriptionCard() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ACTUEL
                </div>
                <CardHeader>
                    <CardTitle className="text-2xl">Premium</CardTitle>
                    <CardDescription>Accès complet à toutes les fonctionnalités</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">
                        9.99€ <span className="text-sm font-normal text-muted-foreground">/ mois</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Recettes illimitées
                        </li>
                        <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Suivi avancé (Poids, Mensurations, Sommeil)
                        </li>
                        <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Méditations guidées
                        </li>
                        <li className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Tableau d'objectifs illimité
                        </li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" variant="outline">Gérer l'abonnement</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Moyen de paiement
                    </CardTitle>
                    <CardDescription>Gérez vos informations de facturation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-10 h-6 bg-slate-200 rounded"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                            <p className="text-xs text-muted-foreground">Expire le 12/25</p>
                        </div>
                        <Badge variant="secondary">Par défaut</Badge>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="w-full">Mettre à jour</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
