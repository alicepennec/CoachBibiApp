"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/features/profile/profile-form"
import { SettingsForm } from "@/components/features/settings/settings-form"
import { SubscriptionCard } from "@/components/features/subscription/subscription-card"

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Profil & Paramètres</h1>
                <p className="text-muted-foreground">
                    Gérez vos informations personnelles et les préférences de l'application.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="settings">Paramètres</TabsTrigger>
                    {/* <TabsTrigger value="subscription">Abonnement</TabsTrigger> */}
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <ProfileForm />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <SettingsForm />
                </TabsContent>

                {/* <TabsContent value="subscription" className="space-y-4">
                    <SubscriptionCard />
                </TabsContent> */}
            </Tabs>
        </div>
    )
}
