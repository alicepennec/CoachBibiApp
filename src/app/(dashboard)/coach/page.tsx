"use client"

import { useEffect, useState } from "react"
import { Search, MoreHorizontal, Eye, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export default function CoachDashboardPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            // In a real app, we would check if the current user is a coach
            // For now, we just fetch all profiles
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })

            if (data) setUsers(data)
            setLoading(false)
        }

        fetchUsers()
    }, [])

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Espace Coach</h1>
                <p className="text-muted-foreground">
                    Gérez vos membres et suivez leurs progrès.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Membres</CardTitle>
                    <CardDescription>
                        Liste de tous les utilisateurs inscrits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center mb-4">
                        <Search className="w-4 h-4 mr-2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un membre..."
                            className="max-w-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Membre</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Inscription</TableHead>
                                <TableHead>Dernière activité</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Chargement...</TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">Aucun membre trouvé</TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar_url} />
                                                <AvatarFallback>{member.full_name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.full_name || "Utilisateur sans nom"}</div>
                                                <div className="text-xs text-muted-foreground">{member.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.subscription_status === 'active' ? 'default' : 'secondary'}>
                                                {member.subscription_status === 'active' ? 'Premium' : 'Gratuit'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(member.created_at), "d MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell>
                                            {member.updated_at ? format(new Date(member.updated_at), "d MMM HH:mm", { locale: fr }) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/coach/users/${member.id}`}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Voir le profil
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Ajouter une note
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
