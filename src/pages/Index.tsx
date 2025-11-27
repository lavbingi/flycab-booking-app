import { useState } from "react";
import FlightMap from "@/components/FlightMap";
import TaxiTiers from "@/components/TaxiTiers";
import BookingConfirmation from "@/components/BookingConfirmation";
import { Plane } from "lucide-react";

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
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // Reset everything
    setPickup(null);
    setDropoff(null);
    setDistance(null);
    setSelectedTier(null);
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
          <div className="flex flex-col">
            <div className="bg-card rounded-xl p-6 shadow-xl border border-border">
              <h2 className="text-2xl font-bold mb-2">Choose Your Flight</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select your pickup and destination to view available autonomous pods
              </p>
              <TaxiTiers distance={distance} onSelectTier={handleTierSelect} />
            </div>
          </div>
        </div>
      </main>

      {/* Booking Confirmation Dialog */}
      {selectedTier && distance && (
        <BookingConfirmation
          isOpen={showConfirmation}
          onClose={handleCloseConfirmation}
          tierName={selectedTier.name}
          price={selectedTier.price}
          distance={distance}
        />
      )}
    </div>
  );
};

export default Index;
