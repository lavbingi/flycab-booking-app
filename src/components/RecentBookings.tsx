import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plane, MapPin, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  guest_name: string;
  start_location: string;
  destination: string;
  taxi_tier: string;
  total_price: number;
  created_at: string;
}

const RecentBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
        <p className="text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
        <p className="text-muted-foreground">No bookings yet. Make your first booking!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-4 bg-muted/30 border-primary/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{booking.guest_name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Plane className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{booking.taxi_tier}</span>
                  <span className="ml-auto font-bold text-primary">₹{booking.total_price}</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="line-clamp-1">{booking.start_location}</span>
                    <span className="text-xs">→</span>
                    <span className="line-clamp-1">{booking.destination}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(booking.created_at).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default RecentBookings;
