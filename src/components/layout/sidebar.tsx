"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    LineChart,
    Utensils,
    Flower2,
    Trophy,
    User,
    Settings,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
    {
        label: "Tableau de bord",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Suivi des progrès",
        icon: LineChart,
        href: "/tracking",
        color: "text-violet-500",
    },
    {
        label: "Recettes",
        icon: Utensils,
        href: "/recipes",
        color: "text-pink-700",
    },
    {
        label: "Méditations",
        icon: Flower2,
        href: "/playlists",
        color: "text-emerald-500",
    },
    {
        label: "Vos Victoires",
        icon: Trophy,
        href: "/goals",
        color: "text-orange-700",
    },
    {
        label: "Profil",
        icon: User,
        href: "/profile",
        color: "text-gray-500",
    },
    {
        label: "Paramètres",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-50 border-r">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4 bg-primary rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">
                        Coach Bibi
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                                pathname === route.href ? "text-primary bg-primary/10" : "text-zinc-600"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
