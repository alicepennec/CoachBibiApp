"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, Utensils } from "lucide-react"

const tabs = [
    {
        label: "Membres",
        href: "/coach",
        icon: Users,
        exact: true
    },
    {
        label: "Recettes",
        href: "/coach/recipes",
        icon: Utensils,
        exact: false
    },
]

export default function CoachLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="space-y-6">
            <div className="border-b">
                <div className="flex h-12 items-center px-4 gap-6">
                    {tabs.map((tab) => {
                        const isActive = tab.exact
                            ? pathname === tab.href
                            : pathname.startsWith(tab.href)

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "flex items-center text-sm font-medium transition-colors hover:text-primary relative h-12",
                                    isActive
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <tab.icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </Link>
                        )
                    })}
                </div>
            </div>
            <div className="px-4">
                {children}
            </div>
        </div>
    )
}
