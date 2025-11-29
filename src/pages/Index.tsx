import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plane } from "lucide-react";
import FlightMap from "@/components/FlightMap";
import TaxiTiers from "@/components/TaxiTiers";
import BookingConfirmation from "@/components/BookingConfirmation";
import RecentBookings from "@/components/RecentBookings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

const Index = () => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: number } | null>(null);
  const [guestName, setGuestName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLocationSelect = (newPickup: Location | null, newDropoff: Location | null) => {
    setPickup(newPickup);
    setDropoff(newDropoff);

    if (newPickup && newDropoff) {
      // Calculate straight-line distance using Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = ((newDropoff.lat - newPickup.lat) * Math.PI) / 180;
      const dLng = ((newDropoff.lng - newPickup.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((newPickup.lat * Math.PI) / 180) *
          Math.cos((newDropoff.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const calculatedDistance = R * c;
      setDistance(calculatedDistance);
    } else {
      setDistance(null);
    }
  };

  const handleTierSelect = (tier: any, price: number) => {
    setSelectedTier({ name: tier.name, price });
  };

  const handleBooking = async () => {
    if (!guestName.trim()) {
      toast({
        title: "Guest Name Required",
        description: "Please enter your name to continue",
        variant: "destructive",
      });
      return;
    }

    if (pickup && dropoff && selectedTier && distance) {
      setIsSubmitting(true);
      
      try {
        const { error } = await supabase.from("bookings").insert({
          guest_name: guestName,
          start_location: pickup?.name || `${pickup?.lat.toFixed(4)}, ${pickup?.lng.toFixed(4)}`,
          destination: dropoff?.name || `${dropoff?.lat.toFixed(4)}, ${dropoff?.lng.toFixed(4)}`,
          taxi_tier: selectedTier.name,
          total_price: selectedTier.price,
        });

        if (error) throw error;

        setShowConfirmation(true);
        toast({
          title: "Booking Successful!",
          description: "Your autonomous pod is on its way.",
        });
      } catch (error) {
        toast({
          title: "Booking Failed",
          description: "There was an error saving your booking. Please try again.",
          variant: "destructive",
        });
        console.error("Booking error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // Reset everything
    setPickup(null);
    setDropoff(null);
    setDistance(null);
    setSelectedTier(null);
    setGuestName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">FlyCab</h1>
              <p className="text-xs text-muted-foreground">Autonomous Flying Taxis • Bengaluru</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Map Section */}
          <div className="h-[600px] rounded-xl overflow-hidden shadow-2xl">
            <FlightMap onLocationSelect={handleLocationSelect} />
          </div>

          {/* Booking Section */}
          <div className="flex flex-col gap-6">
            <div className="bg-card rounded-xl p-6 shadow-xl border border-border space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose Your Flight</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select your pickup and destination to view available autonomous pods
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest-name">Guest Name *</Label>
                <Input 
                  id="guest-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <TaxiTiers distance={distance} onSelectTier={handleTierSelect} selectedTier={selectedTier} />
              
              <Button 
                onClick={handleBooking}
                disabled={!pickup || !dropoff || !selectedTier || !guestName.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Your Flying Pod"
                )}
              </Button>
            </div>
            
            <RecentBookings />
          </div>
        </div>
      </main>

      {/* Booking Confirmation Dialog */}
      {selectedTier && distance && pickup && dropoff && (
        <BookingConfirmation
          isOpen={showConfirmation}
          onClose={handleCloseConfirmation}
          tierName={selectedTier.name}
          price={selectedTier.price}
          distance={distance}
          pickup={pickup}
          dropoff={dropoff}
        />
      )}
    </div>
  );
};

export default Index;
