"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building, Calendar, Clock, Loader2, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

type Reservation = {
  _id: string
  startTime: string
  endTime: string
  capacity: number
  room: {
    _id: string
    name: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const data = await api.get("/api/v1/reservations?limit=3")

        if (data.success) {
          setReservations(data.data)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Failed to fetch reservations",
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching reservations",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchReservations()
    }
  }, [user, toast])

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  if (authLoading || loading) {
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
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <p className="text-muted-foreground mt-2">Manage your co-working space reservations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Find a Space</CardTitle>
              <CardDescription>Browse available co-working spaces</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center bg-blue-50 rounded-md">
                <Building className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <Button asChild className="w-full">
                <Link href="/spaces">Browse Spaces</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>My Reservations</CardTitle>
              <CardDescription>View and manage your reservations</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center bg-blue-50 rounded-md">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <Button asChild className="w-full">
                <Link href="/reservations">View All</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and update your profile</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center bg-blue-50 rounded-md">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <Button asChild className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Upcoming Reservations</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/reservations">View All</Link>
            </Button>
          </div>

          {reservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-blue-200 mb-4" />
                <h3 className="text-xl font-medium">No upcoming reservations</h3>
                <p className="text-muted-foreground mt-1 mb-4">You haven&apos;t made any reservations yet</p>
                <Button asChild>
                  <Link href="/spaces">
                    <Plus className="h-4 w-4 mr-2" />
                    Make a Reservation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservations.map((reservation) => (
                <Card key={reservation._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{reservation.room.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            {formatDateTime(reservation.startTime)} - {formatDateTime(reservation.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{reservation.capacity} people</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reservations/${reservation._id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

