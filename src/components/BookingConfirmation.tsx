import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Calendar, Clock, Plane } from "lucide-react";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  tierName: string;
  price: number;
  distance: number;
}

const BookingConfirmation = ({ isOpen, onClose, tierName, price, distance }: BookingConfirmationProps) => {
  // Estimate travel time (assume 120 km/h average speed)
  const travelTimeMinutes = Math.ceil((distance / 120) * 60);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
        
        <Button onClick={onClose} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmation;
