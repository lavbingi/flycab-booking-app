import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, MapPin, Calendar, Clock, Plane, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const bookingSchema = z.object({
  guest_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  tierName: string;
  price: number;
  distance: number;
  pickup: { lat: number; lng: number; name?: string } | null;
  dropoff: { lat: number; lng: number; name?: string } | null;
}

const BookingConfirmation = ({ isOpen, onClose, tierName, price, distance, pickup, dropoff }: BookingConfirmationProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Estimate travel time (assume 120 km/h average speed)
  const travelTimeMinutes = Math.ceil((distance / 120) * 60);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: "",
    },
  });

  const handleClose = () => {
    setIsConfirmed(false);
    form.reset();
    onClose();
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("bookings").insert({
        guest_name: data.guest_name,
        start_location: pickup?.name || `${pickup?.lat.toFixed(4)}, ${pickup?.lng.toFixed(4)}`,
        destination: dropoff?.name || `${dropoff?.lat.toFixed(4)}, ${dropoff?.lng.toFixed(4)}`,
        taxi_tier: tierName,
        total_price: price,
      });

      if (error) throw error;

      setIsConfirmed(true);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isConfirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Complete Your Booking</DialogTitle>
              <DialogDescription>
                Enter your details to confirm your flying taxi booking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Flying Pod</p>
                    <p className="font-bold">{tierName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-bold">{distance.toFixed(2)} km</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fare</p>
                    <p className="font-bold text-xl text-primary">₹{price.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="guest_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Booking Confirmed!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Your autonomous pod is on its way
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Flying Pod</p>
                    <p className="font-bold">{tierName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-bold">{distance.toFixed(2)} km</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="font-bold">{travelTimeMinutes} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fare</p>
                    <p className="font-bold text-xl text-primary">₹{price.toFixed(0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Your autonomous flying taxi will arrive in <span className="font-bold text-foreground">3-5 minutes</span>
                </p>
              </div>
            </div>
            
            <Button onClick={handleClose} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmation;
