"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Edit, Loader2, Trash, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

type Reservation = {
  _id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  room: {
    _id: string;
    name: string;
  };
};

export default function ReservationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await api.get("/api/v1/reservation/");
        console.log(data, "Reservation");
        if (data.success) {
          setReservations(data.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Failed to fetch reservations",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching reservations",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user, toast]);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const data = await api.delete(`/api/v1/reservation/${id}`);

      if (data.success) {
        setReservations((prev) => prev.filter((res) => res._id !== id));
        toast({
          title: "Reservation cancelled",
          description: "Your reservation has been cancelled successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to cancel reservation",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while cancelling reservation",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">My Reservations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming room reservations
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border">
            <Calendar className="h-16 w-16 text-blue-200 mb-4" />
            <h2 className="text-2xl font-medium">No reservations found</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              You haven&apos;t made any reservations yet
            </p>
            <Button asChild>
              <Link href="/spaces">Browse Spaces</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => (
              <Card
                key={reservation._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle>{reservation.room.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div>
                      <div>
                        <span className="font-medium">Start:</span>{" "}
                        {formatDateTime(reservation.startTime)}
                      </div>
                      <div>
                        <span className="font-medium">End:</span>{" "}
                        {formatDateTime(reservation.endTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>
                      <span className="font-medium">Capacity:</span>{" "}
                      {reservation.capacity} people
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 bg-gray-50 border-t p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/reservations/${reservation._id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/reservations/${reservation._id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Show QR Code
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this reservation? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(reservation._id)}
                          disabled={deletingId === reservation._id}
                        >
                          {deletingId === reservation._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Cancel Reservation"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
