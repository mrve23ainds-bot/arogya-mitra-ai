import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HealthDirectoryProps {
  onBack: () => void;
}

// Mock data - in production, this would be fetched from a geo-indexed database
const healthFacilities = [
  {
    id: 1,
    name: "Primary Health Centre - Gandhipuram",
    type: "PHC",
    distance: "1.2 km",
    phone: "0422-2345678",
    services: ["General Medicine", "Emergency", "Laboratory"],
    available: true,
  },
  {
    id: 2,
    name: "Community Health Centre - Peelamedu",
    type: "CHC",
    distance: "2.5 km",
    phone: "0422-2456789",
    services: ["Pediatrics", "Maternity", "Surgery"],
    available: true,
  },
  {
    id: 3,
    name: "District Hospital",
    type: "Hospital",
    distance: "4.8 km",
    phone: "0422-2567890",
    services: ["Emergency", "ICU", "All Specialties"],
    available: true,
  },
  {
    id: 4,
    name: "ASHA Worker - Saraswathi",
    type: "ASHA",
    distance: "0.5 km",
    phone: "9876543210",
    services: ["Home Visits", "Basic Health Advice"],
    available: true,
  },
];

const HealthDirectory = ({ onBack }: HealthDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFacilities = healthFacilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h2 className="text-xl font-semibold">Healthcare Directory</h2>
            <p className="text-sm text-white/80">Find care near you</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search facilities..."
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      {/* Facilities List */}
      <div className="p-4 space-y-3">
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
              <Button variant="outline" className="flex-1" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </Button>
              <Button className="flex-1" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-strong"
        >
          <MapPin className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default HealthDirectory;
