"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building, Clock, Loader2, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

type Space = {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  openTime: string;
  closeTime: string;
};

type Room = {
  _id: string;
  name: string;
  capacity: number;
};

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const [space, setSpace] = useState<Space | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpaceAndRooms = async () => {
      try {
        setLoading(true);

        // Fetch space details
        const spaceData = await api.get(`/api/v1/spaces/${spaceId}`);

        if (!spaceData.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: spaceData.message || "Failed to fetch space details",
          });
          return;
        }

        setSpace(spaceData.data);

        // Fetch rooms
        const roomsData = await api.get(`/api/v1/spaces/${spaceId}/rooms`);

        if (roomsData.success) {
          setRooms(roomsData.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: roomsData.message || "Failed to fetch rooms",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceAndRooms();
  }, [spaceId, toast]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center py-10">
          <Building className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Space not found</h2>
          <p className="text-muted-foreground mt-1">
            The space you are looking for does not exist
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
      <div className="flex flex-col gap-8">
        <div>
          <Link
            href="/spaces"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            &larr; Back to Spaces
          </Link>
          <h1 className="text-3xl font-bold">{space.name}</h1>
          <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              {space.address}
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              {space.phoneNumber}
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              {formatTime(space.openTime)} - {formatTime(space.closeTime)}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border rounded-lg">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No rooms available</h3>
              <p className="text-muted-foreground mt-1">
                Check back later for new rooms
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card
                  key={room._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle>{room.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Capacity: {room.capacity} people</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <Button asChild className="w-full">
                      <Link href={`/reserve/${room._id}`}>Reserve</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
