import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Navigation, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  type: "Hospital" | "Medical Store" | "ASHA Worker";
  distance?: string;
  phone: string;
  services: string[];
  available: boolean;
  coordinates: Coordinates;
}

const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371;
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
  const [facilitiesWithDistance, setFacilitiesWithDistance] = useState<HealthFacility[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const { toast } = useToast();

  const fetchNearbyFacilities = async (coords: Coordinates) => {
    try {
      const radius = 5000; // 5km radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radius},${coords.latitude},${coords.longitude});
          node["amenity"="clinic"](around:${radius},${coords.latitude},${coords.longitude});
          node["amenity"="pharmacy"](around:${radius},${coords.latitude},${coords.longitude});
          node["healthcare"="centre"](around:${radius},${coords.latitude},${coords.longitude});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });

      const data = await response.json();
      const facilities: HealthFacility[] = data.elements.map((element: any, index: number) => {
        let type: HealthFacility["type"] = "Hospital";
        let services: string[] = [];

        if (element.tags.amenity === "pharmacy") {
          type = "Medical Store";
          services = ["Medicines", "Health Products"];
        } else if (element.tags.amenity === "hospital" || element.tags.healthcare === "centre") {
          type = "Hospital";
          services = ["General Medicine", "Emergency"];
        } else if (element.tags.amenity === "clinic") {
          type = "Hospital";
          services = ["Consultation", "Basic Care"];
        }

        const facilityCoords = { latitude: element.lat, longitude: element.lon };
        const distance = calculateDistance(coords, facilityCoords);

        return {
          id: index,
          name: element.tags.name || `${type} ${index + 1}`,
          type,
          phone: element.tags.phone || element.tags["contact:phone"] || "N/A",
          services,
          available: true,
          coordinates: facilityCoords,
          distance: `${distance.toFixed(1)} ${getTranslation(language as Language, "km")}`,
        };
      });

      const sortedFacilities = facilities.sort((a, b) => {
        const distA = parseFloat(a.distance || "0");
        const distB = parseFloat(b.distance || "0");
        return distA - distB;
      });

      setFacilitiesWithDistance(sortedFacilities);
      
      // Store in localStorage for chat access
      localStorage.setItem('nearbyHospitals', JSON.stringify(
        sortedFacilities.filter(f => f.type === "Hospital").slice(0, 5)
      ));
      localStorage.setItem('userLocation', JSON.stringify(coords));
    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast({
        title: "Error",
        description: "Could not fetch nearby facilities. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);
          await fetchNearbyFacilities(coords);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setFacilitiesWithDistance([]);
          setIsLoadingLocation(false);
          toast({
            title: getTranslation(language as Language, "locationError"),
            description: getTranslation(language as Language, "locationErrorDesc"),
            variant: "destructive",
          });
        }
      );
    } else {
      setFacilitiesWithDistance([]);
      setIsLoadingLocation(false);
      toast({
        title: getTranslation(language as Language, "locationError"),
        description: getTranslation(language as Language, "locationNotSupported"),
        variant: "destructive",
      });
    }
  }, [language, toast]);

  const getFilteredFacilities = (type: HealthFacility["type"]) => {
    return facilitiesWithDistance
      .filter((facility) => facility.type === type)
      .filter((facility) => 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  };

  const openDirections = (facility: HealthFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.latitude},${facility.coordinates.longitude}`;
    window.open(url, "_blank");
  };

  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const renderFacilityCard = (facility: HealthFacility) => (
    <Card key={facility.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{facility.name}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {facility.distance && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {facility.distance}
              </span>
            )}
            {facility.available && (
              <span className="text-health-success font-medium">● Available</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {facility.services.map((service, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {service}
          </Badge>
        ))}
      </div>

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
  );

  return (
    <div className="min-h-screen bg-background">
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

      <div className="p-4">
        {isLoadingLocation ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              {getTranslation(language as Language, "detectingLocation")}
            </span>
          </div>
        ) : (
          <Tabs defaultValue="hospitals" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="hospitals">
                {getTranslation(language as Language, "hospitals")}
              </TabsTrigger>
              <TabsTrigger value="stores">
                {getTranslation(language as Language, "medicalStores")}
              </TabsTrigger>
              <TabsTrigger value="asha">
                {getTranslation(language as Language, "ashaWorkers")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hospitals" className="space-y-3">
              {getFilteredFacilities("Hospital").map(renderFacilityCard)}
            </TabsContent>

            <TabsContent value="stores" className="space-y-3">
              {getFilteredFacilities("Medical Store").map(renderFacilityCard)}
            </TabsContent>

            <TabsContent value="asha" className="space-y-3">
              {getFilteredFacilities("ASHA Worker").map(renderFacilityCard)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default HealthDirectory;
