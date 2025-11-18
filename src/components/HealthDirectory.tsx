import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Navigation, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTranslation, type Language } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";

interface HealthDirectoryProps {
  onBack: () => void;
  language?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface HealthFacility {
  id: number;
  name: string;
  type: string;
  distance?: string;
  phone: string;
  services: string[];
  available: boolean;
  coordinates: Coordinates;
}

// Mock data with real coordinates - in production, fetch from database
const healthFacilities: HealthFacility[] = [
  {
    id: 1,
    name: "Primary Health Centre - Gandhipuram",
    type: "PHC",
    phone: "0422-2345678",
    services: ["General Medicine", "Emergency", "Laboratory"],
    available: true,
    coordinates: { latitude: 11.0168, longitude: 76.9558 },
  },
  {
    id: 2,
    name: "Community Health Centre - Peelamedu",
    type: "CHC",
    phone: "0422-2456789",
    services: ["Pediatrics", "Maternity", "Surgery"],
    available: true,
    coordinates: { latitude: 11.0271, longitude: 76.9634 },
  },
  {
    id: 3,
    name: "District Hospital",
    type: "Hospital",
    phone: "0422-2567890",
    services: ["Emergency", "ICU", "All Specialties"],
    available: true,
    coordinates: { latitude: 11.0041, longitude: 76.9678 },
  },
  {
    id: 4,
    name: "ASHA Worker - Saraswathi",
    type: "ASHA",
    phone: "9876543210",
    services: ["Home Visits", "Basic Health Advice"],
    available: true,
    coordinates: { latitude: 11.0210, longitude: 76.9600 },
  },
];

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const HealthDirectory = ({ onBack, language = "en" }: HealthDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [facilitiesWithDistance, setFacilitiesWithDistance] = useState<HealthFacility[]>(healthFacilities);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);
          
          // Calculate distances and sort by nearest
          const withDistances = healthFacilities.map(facility => ({
            ...facility,
            distance: `${calculateDistance(coords, facility.coordinates).toFixed(1)} ${getTranslation(language as Language, "km")}`,
          })).sort((a, b) => {
            const distA = parseFloat(a.distance);
            const distB = parseFloat(b.distance);
            return distA - distB;
          });
          
          setFacilitiesWithDistance(withDistances);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: getTranslation(language as Language, "locationError"),
            description: getTranslation(language as Language, "locationErrorDesc"),
            variant: "destructive",
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: getTranslation(language as Language, "locationNotSupported"),
        variant: "destructive",
      });
      setIsLoadingLocation(false);
    }
  }, [language, toast]);

  const filteredFacilities = facilitiesWithDistance.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDirections = (facility: HealthFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.latitude},${facility.coordinates.longitude}`;
    window.open(url, '_blank');
  };

  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-medium">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{getTranslation(language as Language, "nearbyHealthcare")}</h2>
            <p className="text-sm text-white/80">{getTranslation(language as Language, "findCare")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation(language as Language, "searchLocation")}
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      {/* Facilities List */}
      <div className="p-4 space-y-3">
        {isLoadingLocation && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              {getTranslation(language as Language, "detectingLocation")}
            </span>
          </div>
        )}
        
        {filteredFacilities.map((facility) => (
          <Card key={facility.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{facility.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {facility.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {facility.distance}
                  </span>
                  {facility.available && (
                    <span className="text-health-success font-medium">● Open</span>
                  )}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-2 mb-3">
              {facility.services.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                size="sm"
                onClick={() => openDirections(facility)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {getTranslation(language as Language, "directions")}
              </Button>
              <Button 
                className="flex-1" 
                size="sm"
                onClick={() => makeCall(facility.phone)}
              >
                <Phone className="h-4 w-4 mr-2" />
                {getTranslation(language as Language, "call")}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Action Button */}
      {userLocation && (
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-strong"
            onClick={() => {
              const nearestFacility = filteredFacilities[0];
              if (nearestFacility) openDirections(nearestFacility);
            }}
          >
            <MapPin className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default HealthDirectory;
