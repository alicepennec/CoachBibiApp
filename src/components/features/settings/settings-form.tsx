"use client"

import { useState } from "react"
import { Bell, Moon, Sun, Download, Shield } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"

export function SettingsForm() {
    const { setTheme, theme } = useTheme()
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false,
    })

    const handleExportData = () => {
        toast.success("Export de vos données en cours...", {
            description: "Vous recevrez un email avec le lien de téléchargement."
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Bell className="mr-2 h-5 w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription>
                        Gérez comment vous souhaitez être contacté.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Notifications par email</Label>
                            <p className="text-sm text-muted-foreground">
                                Recevoir des rappels et des résumés hebdomadaires.
                            </p>
                        </div>
                        <Switch
                            checked={notifications.email}
                            onCheckedChange={(c) => setNotifications(prev => ({ ...prev, email: c }))}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Notifications push</Label>
                            <p className="text-sm text-muted-foreground">
                                Recevoir des rappels quotidiens sur votre appareil.
                            </p>
                        </div>
                        <Switch
                            checked={notifications.push}
                            onCheckedChange={(c) => setNotifications(prev => ({ ...prev, push: c }))}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Sun className="mr-2 h-5 w-5" />
                        Apparence
                    </CardTitle>
                    <CardDescription>
                        Personnalisez l&apos;apparence de l&apos;application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Thème sombre</Label>
                            <p className="text-sm text-muted-foreground">
                                Basculer entre le mode clair et sombre.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Sun className="h-4 w-4 text-muted-foreground" />
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
                            />
                            <Moon className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Confidentialité et Données
                    </CardTitle>
                    <CardDescription>
                        Gérez vos données personnelles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Exporter mes données</Label>
                            <p className="text-sm text-muted-foreground">
                                Télécharger une copie de toutes vos données.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleExportData}>
                            <Download className="mr-2 h-4 w-4" />
                            Exporter
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
