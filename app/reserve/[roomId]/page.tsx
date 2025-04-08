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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = ["00", "30"];

const formSchema = z.object({
  date: z.string().min(1, { message: "Required" }),
  startHour: z.string().min(1, { message: "Required" }),
  startMinute: z.string().min(1, { message: "Required" }),
  endHour: z.string().min(1, { message: "Required" }),
  endMinute: z.string().min(1, { message: "Required" }),
  capacity: z.coerce.number().min(1, { message: "Minimum 1" }),
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startHour: "",
      startMinute: "",
      endHour: "",
      endMinute: "",
      capacity: 1,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/v1/rooms/${roomId}`);
        const data = await res.json();
        if (data.success) {
          setRoom(data.data);
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
  }, [roomId, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!room) return;

    const startTime = new Date(
      `${values.date}T${values.startHour}:${values.startMinute}:00`
    ).toISOString();
    const endTime = new Date(
      `${values.date}T${values.endHour}:${values.endMinute}:00`
    ).toISOString();

    const reserveData = {
      roomId: roomId,
      startTime,
      endTime,
      capacity: values.capacity,
    };

    try {
      setSubmitting(true);
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

  if (!user || !room) return null;

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-md">
        <Link
          href={`/spaces/${room.space._id}`}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to {room.space.name}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reserve Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="font-medium">{room.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{room.space.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Capacity</p>
              <p className="font-medium">{room.capacity} people</p>
            </div>
            <div>
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
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Time */}
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="startHour"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hours.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startMinute"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {minutes.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </FormItem>

                {/* End Time */}
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="endHour"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hours.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endMinute"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {minutes.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </FormItem>

                {/* Capacity */}
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
