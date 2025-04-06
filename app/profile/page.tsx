"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Loader2, LogOut, User } from "lucide-react"

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-blue-100">
              <User className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1 border-b pb-4">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium text-lg">{user.name}</p>
          </div>
          <div className="space-y-1 border-b pb-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-lg">{user.email}</p>
          </div>
          <div className="space-y-1 border-b pb-4">
            <p className="text-sm text-muted-foreground">Phone Number</p>
            <p className="font-medium text-lg">{user.phoneNumber}</p>
          </div>
          <div className="space-y-1 pb-4">
            <p className="text-sm text-muted-foreground">Role</p>
            <Badge variant={user.role === "admin" ? "default" : "outline"} className="text-sm">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
          <Button variant="destructive" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

