"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function ArcadePage() {
  const { id } = useParams();
  const router = useRouter();
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQR = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/reservation/${id}/qr`, {
        credentials: "include",
      });

      if (res.success) {
        setQrData(res.data.qrCode);
      } else {
        console.error("Failed to fetch QR code", res.message);
        setQrData(null);
      }
    } catch (err) {
      console.error("QR fetch error", err);
      setQrData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQR();
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Your QR Code</h1>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin mb-6" />
      ) : qrData ? (
        <img
          src={qrData}
          alt="QR Code"
          className="w-64 h-64 border p-2 bg-white mb-6"
        />
      ) : (
        <p className="text-red-500 mb-6">Unable to load QR code.</p>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={fetchQR}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reload QR
        </Button>
      </div>
    </div>
  );
}
