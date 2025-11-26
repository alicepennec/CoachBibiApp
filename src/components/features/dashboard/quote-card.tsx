"use client"

import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const QUOTES = [
    "Ta douceur est plus puissante que n'importe quelle restriction.",
    "Quand tu écoutes ton corps, tu retrouves ton pouvoir.",
    "L'envie de manger est parfois juste un appel à exister autrement.",
    "Ce n'est pas ce que tu fais une fois qui compte, mais ce que tu répètes avec bienveillance.",
    "Manger en paix est plus nourrissant que manger parfait.",
    "Tu n'es pas ton envie. Tu es la conscience qui peut choisir.",
    "Chaque respiration est une chance de revenir à toi.",
    "C'est dans le silence que ton vrai besoin peut s'exprimer.",
    "Aujourd'hui, je prends soin de moi comme d'une amie précieuse.",
    "Je mérite une relation apaisée avec mon corps.",
    "Mon rythme est unique, et il est juste.",
    "Même lentement, j'avance dans la bonne direction.",
    "Je suis libre de choisir une autre réponse à mes envies.",
    "Mon corps ne me trahit pas, il me parle.",
    "Je suis en train d'écrire une nouvelle histoire avec la nourriture.",
    "Je peux être douce ET déterminée."
]

export function QuoteCard() {
    const [quote, setQuote] = useState("")

    useEffect(() => {
        // Select a random quote on mount (client-side only to avoid hydration mismatch)
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
        setQuote(randomQuote)
    }, [])

    return (
        <Card className="h-full border-l-4 border-l-primary bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-amber-500">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Inspiration du jour
                </CardTitle>
            </CardHeader>
            <CardContent>
                <blockquote className="text-lg italic font-medium text-slate-700 leading-relaxed">
                    "{quote}"
                </blockquote>
            </CardContent>
        </Card>
    )
}
