"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import {
    LayoutDashboard,
    LineChart,
    Utensils,
    Flower2,
    Trophy,
    User,
    Settings,
    ShieldCheck,
    Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
]

export function Sidebar() {
    const pathname = usePathname()
    const { user } = useAuth()
    const [role, setRole] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getRole() {
            if (!user?.id) return
            const { data } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()

            if (data) {
                setRole(data.role)
            }
        }
        getRole()
    }, [user])

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-50 border-r">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-16 h-16 mr-3">
                        <Image
                            fill
                            alt="Logo Coach Bibi"
                            src="/logo.png"
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-xl font-bold text-primary">
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
            <div className="px-3 py-2">
                <nav className="space-y-1">
                    <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            Profil
                        </Button>
                    </Link>
                    {/* <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Paramètres
                        </Button>
                    </Link> */}
                    {role === 'coach' && (
                        <Link href="/coach">
                            <Button variant="ghost" className="w-full justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                <Lock className="mr-2 h-4 w-4" />
                                Espace Coach
                            </Button>
                        </Link>
                    )}
                </nav>
            </div>
        </div>
    )
}
