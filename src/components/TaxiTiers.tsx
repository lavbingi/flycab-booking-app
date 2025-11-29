import { Card } from "@/components/ui/card";
import { Plane, Zap, Crown } from "lucide-react";

interface TaxiTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  ratePerKm: number;
  baseFare: number;
  color: string;
}

const tiers: TaxiTier[] = [
  {
    id: "ecofly",
    name: "EcoFly",
    icon: <Plane className="w-6 h-6" />,
    description: "Efficient & Affordable",
    ratePerKm: 15,
    baseFare: 50,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "skyplus",
    name: "SkyPlus",
    icon: <Zap className="w-6 h-6" />,
    description: "Fast & Comfortable",
    ratePerKm: 25,
    baseFare: 100,
    color: "from-primary to-accent",
  },
  {
    id: "royalair",
    name: "RoyalAir",
    icon: <Crown className="w-6 h-6" />,
    description: "Premium Luxury Experience",
    ratePerKm: 45,
    baseFare: 200,
    color: "from-amber-500 to-orange-600",
  },
];

interface TaxiTiersProps {
  distance: number | null;
  onSelectTier: (tier: TaxiTier, price: number) => void;
  selectedTier?: { name: string; price: number } | null;
}

const TaxiTiers = ({ distance, onSelectTier, selectedTier }: TaxiTiersProps) => {
  if (!distance) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Select pickup and dropoff locations to see available tiers</p>
      </div>
    );
  }

  const calculatePrice = (tier: TaxiTier) => {
    return tier.baseFare + distance * tier.ratePerKm;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">Distance: <span className="font-bold text-foreground">{distance.toFixed(2)} km</span></p>
      </div>
      {tiers.map((tier) => {
        const price = calculatePrice(tier);
        const isSelected = selectedTier?.name === tier.name;
        return (
          <Card
            key={tier.id}
            onClick={() => onSelectTier(tier, price)}
            className={`p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${
              isSelected ? "border-2 border-primary bg-primary/5" : "border-2 border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-white shadow-lg`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{tier.baseFare} base + ₹{tier.ratePerKm}/km
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{price.toFixed(0)}</p>
                {isSelected && (
                  <p className="text-xs text-primary font-semibold mt-2">Selected</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TaxiTiers;
