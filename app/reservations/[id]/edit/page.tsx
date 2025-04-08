"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
    capacity: number;
  };
};

const formSchema = z.object({
  startTime: z.string().min(1, {
    message: "Start time is required.",
  }),
  endTime: z.string().min(1, {
    message: "End time is required.",
  }),
});

export default function EditReservationPage() {
  const params = useParams();
  const reservationId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/v1/reservation/${reservationId}`);

        // const text = await res.text(); // safer: see the raw response
        // console.log("Raw response text:", text);

        // const data = JSON.parse(text);
        // console.log(data, "Reservation 1");
        const data = res;

        if (data.success) {
          setReservation(data.data);

          // Format date for datetime-local input
          const startTime = new Date(data.data.startTime)
            .toISOString()
            .slice(0, 16);
          const endTime = new Date(data.data.endTime)
            .toISOString()
            .slice(0, 16);

          form.setValue("startTime", startTime);
          form.setValue("endTime", endTime);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Failed to fetch reservation details",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching reservation details",
        });
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId, toast, form]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!reservation) return;

    try {
      setSubmitting(true);
      const res = await fetch(
        `${API_URL}/api/v1/reservation/${reservationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();
      console.log(data, "data");
      if (data.success) {
        toast({
          title: "Reservation updated",
          description: "Your reservation has been updated successfully",
        });
        router.push("/reservation");
      } else {
        // Generic error fallback
        toast({
          variant: "destructive",
          title: "Update failed",
          description: data.message || "Failed to update reservation",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "An error occurred while updating reservation",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!reservation) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-10">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Reservation not found</h2>
          <p className="text-muted-foreground mt-1">
            The reservation you are looking for does not exist
          </p>
          <Button asChild className="mt-4">
            <Link href="/reservations">Back to Reservations</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md">
        <Link
          href="/reservations"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to Reservations
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Reservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="font-medium">{reservation.room.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="font-medium">{reservation.capacity} people</p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating
                    </>
                  ) : (
                    "Update Reservation"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
