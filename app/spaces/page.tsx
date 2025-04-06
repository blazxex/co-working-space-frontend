"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building, Clock, Loader2, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Define API_URL constant
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Space = {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  openTime: string;
  closeTime: string;
};

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/v1/spaces`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setSpaces(data.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Failed to fetch spaces",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while fetching spaces",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [toast]);

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

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Co-working Spaces</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse and find the perfect workspace for your needs
          </p>
        </div>

        {spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border">
            <Building className="h-16 w-16 text-blue-200 mb-4" />
            <h2 className="text-2xl font-medium">No spaces available</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              Check back later for new spaces
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card
                key={space._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-blue-50 flex items-center justify-center">
                  <Building className="h-16 w-16 text-blue-300" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{space.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      {space.address}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      {space.phoneNumber}
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      {formatTime(space.openTime)} -{" "}
                      {formatTime(space.closeTime)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Button asChild className="w-full">
                    <Link href={`/spaces/${space._id}`}>View Rooms</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
