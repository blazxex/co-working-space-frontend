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

type Room = {
  _id: string;
  name: string;
  capacity: number;
  space: {
    _id: string;
    name: string;
    openTime: string;
    closeTime: string;
  };
};

const formSchema = z.object({
  startTime: z.string().min(1, {
    message: "Start time is required.",
  }),
  endTime: z.string().min(1, {
    message: "End time is required.",
  }),
  capacity: z.coerce.number().min(1, {
    message: "Capacity must be at least 1.",
  }),
});

export default function ReserveRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      capacity: 1,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/v1/rooms/${roomId}`);
        console.log(res);
        const data = await res.json();

        if (data.success) {
          setRoom(data.data);
          form.setValue("capacity", 1);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Failed to fetch room details",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching room details",
        });
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, toast, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!room) return;

    const reserveData = {
      roomId: roomId,
      ...values,
    };
    console.log(reserveData);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      setSubmitting(true);
      console.log("Submitting reservation data:", reserveData);
      const res = await fetch(
        `${API_URL}/api/v1/rooms/${roomId}/reservation/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reserveData),
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log(data);

      if (data.success) {
        toast({
          title: "Reservation successful",
          description: "Your room has been reserved",
        });
        router.push("/reservations");
      } else {
        toast({
          variant: "destructive",
          title: "Reservation failed",
          description: data.message || "Failed to reserve room",
        });
      }
    } catch (error: any) {
      console.log(error.message);
      toast({
        variant: "destructive",
        title: "Reservation failed",
        description: "An error occurred during reservation",
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

  if (!room) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-10">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Room not found</h2>
          <p className="text-muted-foreground mt-1">
            The room you are looking for does not exist
          </p>
          <Button asChild className="mt-4">
            <Link href="/spaces">Back to Spaces</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md">
        <Link
          href={`/ spaces / ${room.space._id}`}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to {room.space.name}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reserve Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="font-medium">{room.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{room.space.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Maximum Capacity</p>
              <p className="font-medium">{room.capacity} people</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available Hours</p>
              <p className="font-medium">
                {room.space.openTime} - {room.space.closeTime}
              </p>
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
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of People</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={room.capacity}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Reserve Room"
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
