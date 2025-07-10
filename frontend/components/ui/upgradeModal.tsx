"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStripe } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const supabase = createClient();

  if (!open) return null;

  const handleCheckout = async (priceId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }
      // Call your backend to create Stripe session
      const response = await fetch(`${backendUrl}/createCheckoutSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onOpenChange(false);
    }
  };

  const handleNavigation = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4 text-center">Choose Your Plan</h2>
        <div className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>Perfect for trying out PianoFi</CardDescription>
              <div className="text-3xl font-bold">
                $9<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 text-sm flex-1">
                <li>• Access to the most advanced SOTA transcription models</li>
                <li>• 10 transcriptions per month</li>
                <li>• Up to 5 minutes per file</li>
                <li>• PDF + MusicXML downloads</li>
                <li>• Email support</li>
              </ul>
              <Button
                onClick={() => handleCheckout("price_1Rgbv3BHhIoAIsYdP9R8hMpa")}
                className="w-full mt-6"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
          <Card className="border-primary flex flex-col h-full">
            <CardHeader>
              <Badge className="w-fit">Most Popular</Badge>
              <CardTitle>Pro</CardTitle>
              <CardDescription>
                For serious musicians and teachers
              </CardDescription>
              <div className="text-3xl font-bold">
                $29<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 text-sm flex-1">
                <li>• 100 transcriptions per month</li>
                <li>• Up to 10 minutes per file</li>
                <li>• PDF + MusicXML downloads</li>
                <li>• Priority support</li>
                <li>• Batch processing</li>
              </ul>
              <Button
                onClick={() => handleCheckout("price_1RgbvaBHhIoAIsYdK7GAZW7h")}
                className="w-full mt-6"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For music schools and studios</CardDescription>
              <div className="text-3xl font-bold">
                $99<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 text-sm flex-1">
                <li>• Unlimited transcriptions</li>
                <li>• No file length limits</li>
                <li>• All formats included</li>
                <li>• Dedicated support</li>
                <li>• API access</li>
              </ul>
              <Button
                onClick={() => handleNavigation("/contact")}
                className="w-full mt-6"
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
