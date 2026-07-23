import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Navigation, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface BangaloreArea {
  id: string;
  name: string;
  coordinates: Coordinates;
  facilities: Omit<HealthFacility, "distance">[];
}

const bangaloreAreas: BangaloreArea[] = [
  {
    id: "marathahalli",
    name: "Marathahalli",
    coordinates: { latitude: 12.9569, longitude: 77.7011 },
    facilities: [
      {
        id: 1001,
        name: "Sakra World Hospital",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9322, longitude: 77.6851 },
      },
      {
        id: 1002,
        name: "VIMS Hospital",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Consultation"],
        available: true,
        coordinates: { latitude: 12.9564, longitude: 77.7151 },
      },
      {
        id: 1003,
        name: "Apollo Clinic Marathahalli",
        type: "Hospital",
        phone: "N/A",
        services: ["Clinic", "Basic Care"],
        available: true,
        coordinates: { latitude: 12.9592, longitude: 77.6974 },
      },
      {
        id: 1004,
        name: "MedPlus Marathahalli",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Health Products"],
        available: true,
        coordinates: { latitude: 12.9562, longitude: 77.7018 },
      },
      {
        id: 1005,
        name: "Apollo Pharmacy Marathahalli",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Pharmacy"],
        available: true,
        coordinates: { latitude: 12.9584, longitude: 77.7001 },
      },
    ],
  },
  {
    id: "whitefield",
    name: "Whitefield",
    coordinates: { latitude: 12.9698, longitude: 77.7500 },
    facilities: [
      {
        id: 2001,
        name: "Manipal Hospital Whitefield",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9866, longitude: 77.7281 },
      },
      {
        id: 2002,
        name: "Vydehi Hospital",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Specialist Care"],
        available: true,
        coordinates: { latitude: 12.9760, longitude: 77.7286 },
      },
      {
        id: 2003,
        name: "Aster Whitefield Hospital",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9952, longitude: 77.7611 },
      },
      {
        id: 2004,
        name: "Apollo Pharmacy Whitefield",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Pharmacy"],
        available: true,
        coordinates: { latitude: 12.9691, longitude: 77.7498 },
      },
      {
        id: 2005,
        name: "MedPlus Whitefield",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Health Products"],
        available: true,
        coordinates: { latitude: 12.9712, longitude: 77.7510 },
      },
    ],
  },
  {
    id: "indiranagar",
    name: "Indiranagar",
    coordinates: { latitude: 12.9784, longitude: 77.6408 },
    facilities: [
      {
        id: 3001,
        name: "Chinmaya Mission Hospital",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9804, longitude: 77.6486 },
      },
      {
        id: 3002,
        name: "Cloudnine Hospital Old Airport Road",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Specialist Care"],
        available: true,
        coordinates: { latitude: 12.9592, longitude: 77.6489 },
      },
      {
        id: 3003,
        name: "Manipal Hospital Old Airport Road",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9581, longitude: 77.6488 },
      },
      {
        id: 3004,
        name: "Apollo Pharmacy Indiranagar",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Pharmacy"],
        available: true,
        coordinates: { latitude: 12.9788, longitude: 77.6414 },
      },
      {
        id: 3005,
        name: "MedPlus Indiranagar",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Health Products"],
        available: true,
        coordinates: { latitude: 12.9775, longitude: 77.6389 },
      },
    ],
  },
  {
    id: "koramangala",
    name: "Koramangala",
    coordinates: { latitude: 12.9352, longitude: 77.6245 },
    facilities: [
      {
        id: 4001,
        name: "St. John’s Medical College Hospital",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9295, longitude: 77.6192 },
      },
      {
        id: 4002,
        name: "Apollo Spectra Hospital Koramangala",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Specialist Care"],
        available: true,
        coordinates: { latitude: 12.9347, longitude: 77.6169 },
      },
      {
        id: 4003,
        name: "Ayu Health Hospital Koramangala",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Consultation"],
        available: true,
        coordinates: { latitude: 12.9366, longitude: 77.6267 },
      },
      {
        id: 4004,
        name: "Apollo Pharmacy Koramangala",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Pharmacy"],
        available: true,
        coordinates: { latitude: 12.9359, longitude: 77.6240 },
      },
      {
        id: 4005,
        name: "MedPlus Koramangala",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Health Products"],
        available: true,
        coordinates: { latitude: 12.9340, longitude: 77.6261 },
      },
    ],
  },
  {
    id: "jayanagar",
    name: "Jayanagar",
    coordinates: { latitude: 12.9299, longitude: 77.5933 },
    facilities: [
      {
        id: 5001,
        name: "Sagar Hospitals Jayanagar",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Emergency Care"],
        available: true,
        coordinates: { latitude: 12.9246, longitude: 77.5907 },
      },
      {
        id: 5002,
        name: "Manipal Hospital Jayanagar",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Specialist Care"],
        available: true,
        coordinates: { latitude: 12.9291, longitude: 77.5863 },
      },
      {
        id: 5003,
        name: "Apollo Speciality Hospital Jayanagar",
        type: "Hospital",
        phone: "N/A",
        services: ["Hospital", "Consultation"],
        available: true,
        coordinates: { latitude: 12.9306, longitude: 77.5837 },
      },
      {
        id: 5004,
        name: "Apollo Pharmacy Jayanagar",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Pharmacy"],
        available: true,
        coordinates: { latitude: 12.9308, longitude: 77.5937 },
      },
      {
        id: 5005,
        name: "MedPlus Jayanagar",
        type: "Medical Store",
        phone: "N/A",
        services: ["Medicines", "Health Products"],
        available: true,
        coordinates: { latitude: 12.9288, longitude: 77.5948 },
      },
    ],
  },
];

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
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState("marathahalli");
  const [dataMode, setDataMode] = useState<"live" | "area">("live");
  const { toast } = useToast();

  const applyAreaFacilities = (areaId: string) => {
    const area = bangaloreAreas.find((item) => item.id === areaId) || bangaloreAreas[0];
    setSelectedAreaId(area.id);
    setUserLocation(area.coordinates);
    setDataMode("area");

    const facilities = area.facilities
      .map((facility) => {
        const distance = calculateDistance(area.coordinates, facility.coordinates);
        return {
          ...facility,
          distance: `${distance.toFixed(1)} ${getTranslation(language as Language, "km")}`,
        };
      })
      .sort((a, b) => parseFloat(a.distance || "0") - parseFloat(b.distance || "0"));

    setFacilitiesWithDistance(facilities);
    setIsLoadingLocation(false);
    setIsLoadingFacilities(false);
    localStorage.setItem("nearbyHospitals", JSON.stringify(facilities.filter((f) => f.type === "Hospital").slice(0, 5)));
    localStorage.setItem("userLocation", JSON.stringify(area.coordinates));
  };

  const fetchNearbyFacilities = async (coords: Coordinates) => {
    setIsLoadingFacilities(true);
    let data: any = null;
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: fnData, error } = await supabase.functions.invoke("nearby-facilities", {
        body: { lat: coords.latitude, lon: coords.longitude, radius: 10000 },
      });
      if (error) throw error;
      data = fnData;

    } catch (err) {
      console.error("nearby-facilities failed:", err);
    }


    if (!data) {
      console.error("Nearby facilities fetch failed");
      toast({
        title: "Showing Bangalore area list",
        description: "Live location hospitals did not load, so choose an area below.",
      });
      applyAreaFacilities(selectedAreaId);
      return;
    }

    try {
      const facilities: HealthFacility[] = (data.elements || []).map((element: any, index: number) => {
        const tags = element.tags || {};
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        if (lat == null || lon == null) return null;

        let type: HealthFacility["type"] = "Hospital";
        let services: string[] = [];

        if (tags.amenity === "pharmacy" || tags.healthcare === "pharmacy") {
          type = "Medical Store";
          services = ["Medicines", "Health Products"];
        } else if (tags.amenity === "hospital") {
          type = "Hospital";
          services = ["General Medicine", "Emergency"];
        } else if (tags.amenity === "clinic" || tags.healthcare === "clinic" || tags.amenity === "doctors") {
          type = "Hospital";
          services = ["Consultation", "Basic Care"];
        } else if (tags.healthcare) {
          type = "Hospital";
          services = [tags.healthcare];
        }

        const facilityCoords = { latitude: lat, longitude: lon };
        const distance = calculateDistance(coords, facilityCoords);

        return {
          id: element.id ?? index,
          name: tags.name || `${type} ${index + 1}`,
          type,
          phone: tags.phone || tags["contact:phone"] || "N/A",
          services,
          available: true,
          coordinates: facilityCoords,
          distance: `${distance.toFixed(1)} ${getTranslation(language as Language, "km")}`,
        } as HealthFacility;
      }).filter(Boolean) as HealthFacility[];

      const sortedFacilities = facilities.sort((a, b) => parseFloat(a.distance || "0") - parseFloat(b.distance || "0"));
      if (sortedFacilities.length === 0) {
        toast({
          title: "Showing Bangalore area list",
          description: "No live facilities were found near this location, so choose an area below.",
        });
        applyAreaFacilities(selectedAreaId);
        return;
      }

      setDataMode("live");
      setFacilitiesWithDistance(sortedFacilities);

      localStorage.setItem('nearbyHospitals', JSON.stringify(
        sortedFacilities.filter(f => f.type === "Hospital").slice(0, 5)
      ));
      localStorage.setItem('userLocation', JSON.stringify(coords));
    } catch (error) {
      console.error("Error parsing facilities:", error);
      toast({
        title: "Error",
        description: "Could not parse nearby facilities.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFacilities(false);
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
          setIsLoadingLocation(false);
          await fetchNearbyFacilities(coords);
        },
        (error) => {
          console.error("Geolocation error:", error);
          applyAreaFacilities(selectedAreaId);
          toast({
            title: getTranslation(language as Language, "locationError"),
            description: "Choose a Bangalore area below to see hospitals and medical stores.",
          });
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
      );
    } else {
      applyAreaFacilities(selectedAreaId);
      toast({
        title: getTranslation(language as Language, "locationError"),
        description: "Choose a Bangalore area below to see hospitals and medical stores.",
      });
    }
  }, [language, toast]);

  const handleAreaChange = (areaId: string) => {
    applyAreaFacilities(areaId);
  };

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
        <div className="mb-4 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant={dataMode === "live" ? "default" : "outline"}
              onClick={() => {
                if (!userLocation || dataMode === "area") {
                  setIsLoadingLocation(true);
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const coords = {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                        };
                        setUserLocation(coords);
                        setIsLoadingLocation(false);
                        await fetchNearbyFacilities(coords);
                      },
                      () => applyAreaFacilities(selectedAreaId),
                      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
                    );
                  } else {
                    applyAreaFacilities(selectedAreaId);
                  }
                } else {
                  fetchNearbyFacilities(userLocation);
                }
              }}
              className="w-full sm:w-auto"
            >
              Use my location
            </Button>
            <Select value={selectedAreaId} onValueChange={handleAreaChange}>
              <SelectTrigger className="h-10 w-full sm:max-w-xs">
                <SelectValue placeholder="Choose Bangalore area" />
              </SelectTrigger>
              <SelectContent>
                {bangaloreAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {dataMode === "area" && (
            <p className="text-sm text-muted-foreground">
              Showing saved Bangalore area results. Select your area if live location does not load.
            </p>
          )}
        </div>
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

            {isLoadingFacilities ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading nearby facilities…</span>
              </div>
            ) : (
              <>
                <TabsContent value="hospitals" className="space-y-3">
                  {getFilteredFacilities("Hospital").length > 0 ? (
                    getFilteredFacilities("Hospital").map(renderFacilityCard)
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">No hospitals found for this search.</p>
                  )}
                </TabsContent>

                <TabsContent value="stores" className="space-y-3">
                  {getFilteredFacilities("Medical Store").length > 0 ? (
                    getFilteredFacilities("Medical Store").map(renderFacilityCard)
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">No medical stores found for this search.</p>
                  )}
                </TabsContent>


                <TabsContent value="asha" className="space-y-3">
                  {getFilteredFacilities("ASHA Worker").map(renderFacilityCard)}
                </TabsContent>
              </>
            )}
          </Tabs>

        )}
      </div>
    </div>
  );
};

export default HealthDirectory;
