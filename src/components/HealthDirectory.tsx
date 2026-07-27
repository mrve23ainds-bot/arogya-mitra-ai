import { useState, useMemo } from "react";
import { ArrowLeft, MapPin, Phone, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTranslation, type Language } from "@/lib/translations";

interface HealthDirectoryProps {
  onBack: () => void;
  language?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface HealthFacility {
  id: string;
  name: string;
  type: "Hospital" | "Medical Store";
  distanceKm: number;
  phone: string;
  services: string[];
  coordinates: Coordinates;
}

interface BangaloreArea {
  id: string;
  name: string;
  center: Coordinates;
  hospitals: Array<{ name: string; phone: string; services: string[]; coordinates: Coordinates }>;
  stores: Array<{ name: string; phone: string; services: string[]; coordinates: Coordinates }>;
}

const H = (name: string, phone: string, lat: number, lon: number, services = ["Hospital", "Emergency Care"]) =>
  ({ name, phone, services, coordinates: { latitude: lat, longitude: lon } });
const S = (name: string, phone: string, lat: number, lon: number, services = ["Medicines", "Pharmacy"]) =>
  ({ name, phone, services, coordinates: { latitude: lat, longitude: lon } });

const bangaloreAreas: BangaloreArea[] = [
  {
    id: "marathahalli", name: "Marathahalli",
    center: { latitude: 12.9569, longitude: 77.7011 },
    hospitals: [
      H("Sakra World Hospital", "+91 80 4969 4969", 12.9322, 77.6851),
      H("VIMS Hospital", "+91 80 2854 0303", 12.9564, 77.7151),
      H("Apollo Clinic Marathahalli", "+91 80 4145 4145", 12.9592, 77.6974),
      H("Cloudnine Hospital Marathahalli", "+91 99728 99728", 12.9560, 77.6994),
      H("Motherhood Hospital Sarjapur Rd", "+91 80 6660 6666", 12.9250, 77.6870),
    ],
    stores: [
      S("Apollo Pharmacy Marathahalli", "1860 500 0101", 12.9584, 77.7001),
      S("MedPlus Marathahalli", "1800 425 5225", 12.9562, 77.7018),
      S("Wellness Forever Marathahalli", "+91 80 4859 5000", 12.9575, 77.7020),
    ],
  },
  {
    id: "whitefield", name: "Whitefield",
    center: { latitude: 12.9698, longitude: 77.7500 },
    hospitals: [
      H("Manipal Hospital Whitefield", "+91 80 2502 4444", 12.9866, 77.7281),
      H("Vydehi Institute of Medical Sciences", "+91 80 2841 9000", 12.9760, 77.7286),
      H("Aster Whitefield Hospital", "+91 80 4599 0000", 12.9952, 77.7611),
      H("Columbia Asia Hospital Whitefield", "+91 80 6165 6262", 12.9784, 77.7301),
      H("Sathya Sai Hospital Whitefield", "+91 80 2841 1500", 12.9601, 77.7412),
    ],
    stores: [
      S("Apollo Pharmacy Whitefield", "1860 500 0101", 12.9691, 77.7498),
      S("MedPlus Whitefield", "1800 425 5225", 12.9712, 77.7510),
      S("Netmeds Whitefield", "+91 72007 20000", 12.9720, 77.7495),
    ],
  },
  {
    id: "indiranagar", name: "Indiranagar",
    center: { latitude: 12.9784, longitude: 77.6408 },
    hospitals: [
      H("Chinmaya Mission Hospital", "+91 80 2528 0670", 12.9804, 77.6486),
      H("Cloudnine Hospital Old Airport Road", "+91 99729 99729", 12.9592, 77.6489),
      H("Manipal Hospital Old Airport Road", "+91 80 2502 4444", 12.9581, 77.6488),
      H("Apollo Clinic Indiranagar", "+91 80 4145 4145", 12.9770, 77.6410),
      H("CMH Hospital Indiranagar", "+91 80 2521 1246", 12.9780, 77.6390),
    ],
    stores: [
      S("Apollo Pharmacy Indiranagar", "1860 500 0101", 12.9788, 77.6414),
      S("MedPlus Indiranagar", "1800 425 5225", 12.9775, 77.6389),
      S("Wellness Forever Indiranagar", "+91 80 4859 5000", 12.9790, 77.6420),
    ],
  },
  {
    id: "koramangala", name: "Koramangala",
    center: { latitude: 12.9352, longitude: 77.6245 },
    hospitals: [
      H("St. John's Medical College Hospital", "+91 80 2206 5000", 12.9295, 77.6192),
      H("Apollo Spectra Hospital Koramangala", "+91 80 4612 4612", 12.9347, 77.6169),
      H("Ayu Health Hospital Koramangala", "+91 88802 45632", 12.9366, 77.6267),
      H("Sakra Premium Clinic Koramangala", "+91 80 4969 4969", 12.9360, 77.6250),
      H("Cloudnine Hospital Jayanagar", "+91 99729 99729", 12.9295, 77.5850),
    ],
    stores: [
      S("Apollo Pharmacy Koramangala", "1860 500 0101", 12.9359, 77.6240),
      S("MedPlus Koramangala", "1800 425 5225", 12.9340, 77.6261),
      S("Wellness Forever Koramangala", "+91 80 4859 5000", 12.9345, 77.6255),
    ],
  },
  {
    id: "jayanagar", name: "Jayanagar",
    center: { latitude: 12.9299, longitude: 77.5933 },
    hospitals: [
      H("Sagar Hospitals Jayanagar", "+91 80 4288 8888", 12.9246, 77.5907),
      H("Apollo Speciality Hospital Jayanagar", "+91 80 2630 1024", 12.9306, 77.5837),
      H("Fortis Hospital Bannerghatta Road", "+91 80 6621 4444", 12.8952, 77.5983),
      H("Bangalore Hospital Jayanagar", "+91 80 2656 8888", 12.9245, 77.5850),
      H("Sparsh Hospital Jayanagar", "+91 80 4368 8888", 12.9235, 77.5921),
    ],
    stores: [
      S("Apollo Pharmacy Jayanagar", "1860 500 0101", 12.9308, 77.5937),
      S("MedPlus Jayanagar", "1800 425 5225", 12.9288, 77.5948),
      S("Frank Ross Pharmacy Jayanagar", "+91 80 2663 4400", 12.9300, 77.5940),
    ],
  },
  {
    id: "hsr-layout", name: "HSR Layout",
    center: { latitude: 12.9116, longitude: 77.6474 },
    hospitals: [
      H("Narayana Multispeciality Hospital HSR", "+91 80 6750 6750", 12.9145, 77.6390),
      H("Cloudnine Hospital HSR", "+91 99729 99729", 12.9152, 77.6410),
      H("Manipal Clinic HSR Layout", "+91 80 2502 4444", 12.9110, 77.6470),
      H("Apollo Clinic HSR", "+91 80 4145 4145", 12.9120, 77.6480),
      H("Ovum Hospital HSR", "+91 80 2258 0000", 12.9128, 77.6465),
    ],
    stores: [
      S("Apollo Pharmacy HSR Layout", "1860 500 0101", 12.9115, 77.6470),
      S("MedPlus HSR Layout", "1800 425 5225", 12.9130, 77.6482),
      S("Wellness Forever HSR", "+91 80 4859 5000", 12.9122, 77.6478),
    ],
  },
  {
    id: "electronic-city", name: "Electronic City",
    center: { latitude: 12.8452, longitude: 77.6602 },
    hospitals: [
      H("Narayana Health City", "+91 80 7122 2222", 12.8090, 77.6790),
      H("Sparsh Hospital Infantry Road/E-City", "+91 80 4368 8888", 12.8460, 77.6620),
      H("Aster CMI (E-City Clinic)", "+91 80 4342 0100", 12.8480, 77.6635),
      H("Motherhood Hospital Electronic City", "+91 80 6660 6666", 12.8442, 77.6595),
      H("Manipal Hospital Electronic City", "+91 80 2502 4444", 12.8395, 77.6785),
    ],
    stores: [
      S("Apollo Pharmacy Electronic City", "1860 500 0101", 12.8450, 77.6605),
      S("MedPlus Electronic City", "1800 425 5225", 12.8462, 77.6612),
      S("Netmeds Electronic City", "+91 72007 20000", 12.8440, 77.6600),
    ],
  },
  {
    id: "malleshwaram", name: "Malleshwaram",
    center: { latitude: 13.0035, longitude: 77.5709 },
    hospitals: [
      H("Columbia Asia Referral Hospital Yeshwanthpur", "+91 80 6165 6262", 13.0290, 77.5410),
      H("MS Ramaiah Memorial Hospital", "+91 80 2218 3000", 13.0296, 77.5665),
      H("Peoples Tree Hospital Yeshwantpur", "+91 80 2837 0555", 13.0250, 77.5470),
      H("Suguna Hospital Malleshwaram", "+91 80 2334 5666", 13.0030, 77.5720),
      H("Sagar Hospital Malleshwaram", "+91 80 4288 8888", 13.0050, 77.5700),
    ],
    stores: [
      S("Apollo Pharmacy Malleshwaram", "1860 500 0101", 13.0030, 77.5712),
      S("MedPlus Malleshwaram", "1800 425 5225", 13.0040, 77.5705),
      S("Wellness Forever Malleshwaram", "+91 80 4859 5000", 13.0038, 77.5715),
    ],
  },
  {
    id: "jp-nagar", name: "JP Nagar",
    center: { latitude: 12.9082, longitude: 77.5855 },
    hospitals: [
      H("Apollo Hospital Bannerghatta Road", "+91 80 2630 4050", 12.8905, 77.5988),
      H("Fortis Hospital Bannerghatta", "+91 80 6621 4444", 12.8952, 77.5983),
      H("Sagar Hospital Banashankari", "+91 80 4288 8888", 12.8890, 77.5560),
      H("BGS Gleneagles Global Hospital", "+91 80 2625 5555", 12.9130, 77.5320),
      H("Chirayu Hospital JP Nagar", "+91 80 2649 5555", 12.9075, 77.5860),
    ],
    stores: [
      S("Apollo Pharmacy JP Nagar", "1860 500 0101", 12.9080, 77.5852),
      S("MedPlus JP Nagar", "1800 425 5225", 12.9090, 77.5860),
      S("Netmeds JP Nagar", "+91 72007 20000", 12.9085, 77.5865),
    ],
  },
  {
    id: "hebbal", name: "Hebbal",
    center: { latitude: 13.0358, longitude: 77.5970 },
    hospitals: [
      H("Aster CMI Hospital", "+91 80 4342 0100", 13.0435, 77.5945),
      H("Baptist Hospital Hebbal", "+91 80 2202 2222", 13.0410, 77.5920),
      H("Columbia Asia Hospital Hebbal", "+91 80 6165 6262", 13.0400, 77.5930),
      H("Manipal Hospital Hebbal", "+91 80 2502 4444", 13.0390, 77.5960),
      H("Motherhood Hospital Hebbal", "+91 80 6660 6666", 13.0362, 77.5975),
    ],
    stores: [
      S("Apollo Pharmacy Hebbal", "1860 500 0101", 13.0355, 77.5972),
      S("MedPlus Hebbal", "1800 425 5225", 13.0365, 77.5980),
      S("Wellness Forever Hebbal", "+91 80 4859 5000", 13.0360, 77.5968),
    ],
  },
];

const areaNameTranslations: Record<string, Record<string, string>> = {
  marathahalli: { en: "Marathahalli", hi: "मराठाहल्ली", ta: "மராத்தஹள்ளி", te: "మారతహళ్లి", kn: "ಮರಾಠಹಳ್ಳಿ", ml: "മരാത്തഹള്ളി" },
  whitefield: { en: "Whitefield", hi: "व्हाइटफील्ड", ta: "வொயிட்பீல்டு", te: "వైట్‌ఫీల్డ్", kn: "ವೈಟ್‌ಫೀಲ್ಡ್", ml: "വൈറ്റ്ഫീൽഡ്" },
  indiranagar: { en: "Indiranagar", hi: "इंदिरानगर", ta: "இந்திராநகர்", te: "ఇందిరానగర్", kn: "ಇಂದಿರಾನಗರ", ml: "ഇന്ദിരാനഗർ" },
  koramangala: { en: "Koramangala", hi: "कोरमंगला", ta: "கோரமங்கலா", te: "కోరమంగళ", kn: "ಕೋರಮಂಗಲ", ml: "കോറമംഗല" },
  jayanagar: { en: "Jayanagar", hi: "जयनगर", ta: "ஜெயநகர்", te: "జయనగర్", kn: "ಜಯನಗರ", ml: "ജയനഗർ" },
  "hsr-layout": { en: "HSR Layout", hi: "एचएसआर लेआउट", ta: "எச்.எஸ்.ஆர். லேஅவுட்", te: "హెచ్‌ఎస్‌ఆర్ లేఅవుట్", kn: "ಎಚ್‌ಎಸ್‌ಆರ್ ಲೇಔಟ್", ml: "എച്ച്എസ്ആർ ലേഔട്ട്" },
  "electronic-city": { en: "Electronic City", hi: "इलेक्ट्रॉनिक सिटी", ta: "எலக்ட்ரானிக் சிட்டி", te: "ఎలక్ట్రానిక్ సిటీ", kn: "ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ", ml: "ഇലക്ട്രോണിക് സിറ്റി" },
  malleshwaram: { en: "Malleshwaram", hi: "मल्लेश्वरम", ta: "மல்லேஸ்வரம்", te: "మల్లేశ్వరం", kn: "ಮಲ್ಲೇಶ್ವರಂ", ml: "മല്ലേശ്വരം" },
  "jp-nagar": { en: "JP Nagar", hi: "जेपी नगर", ta: "ஜே.பி. நகர்", te: "జేపీ నగర్", kn: "ಜೆಪಿ ನಗರ", ml: "ജെപി നഗർ" },
  hebbal: { en: "Hebbal", hi: "हेब्बल", ta: "ஹெப்பால்", te: "హెబ్బాళ్", kn: "ಹೆಬ್ಬಾಳ", ml: "ഹെബ്ബാൾ" },
};

const chooseAreaLabels: Record<string, string> = {
  en: "Choose your area in Bangalore",
  hi: "बैंगलोर में अपना क्षेत्र चुनें",
  ta: "பெங்களூரில் உங்கள் பகுதியைத் தேர்ந்தெடுக்கவும்",
  te: "బెంగళూరులో మీ ప్రాంతాన్ని ఎంచుకోండి",
  kn: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  ml: "ബംഗളൂരുവിലെ നിങ്ങളുടെ പ്രദേശം തിരഞ്ഞെടുക്കുക",
};

const showingInLabels: Record<string, (area: string) => string> = {
  en: (a) => `Showing hospitals and medical stores in ${a}. Distances are measured from the ${a} centre.`,
  hi: (a) => `${a} में अस्पताल और मेडिकल स्टोर दिखाए जा रहे हैं। दूरी ${a} केंद्र से मापी गई है।`,
  ta: (a) => `${a} இல் உள்ள மருத்துவமனைகள் மற்றும் மருந்தகங்கள் காட்டப்படுகின்றன. தூரங்கள் ${a} மையத்திலிருந்து அளவிடப்படுகின்றன.`,
  te: (a) => `${a}లో ఆసుపత్రులు మరియు మెడికల్ స్టోర్లు చూపబడుతున్నాయి. దూరాలు ${a} కేంద్రం నుండి కొలవబడతాయి.`,
  kn: (a) => `${a} ನಲ್ಲಿನ ಆಸ್ಪತ್ರೆಗಳು ಮತ್ತು ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ. ದೂರವನ್ನು ${a} ಕೇಂದ್ರದಿಂದ ಅಳೆಯಲಾಗುತ್ತದೆ.`,
  ml: (a) => `${a}-ലെ ആശുപത്രികളും മെഡിക്കൽ സ്റ്റോറുകളും കാണിക്കുന്നു. ദൂരം ${a} കേന്ദ്രത്തിൽ നിന്ന് അളക്കുന്നു.`,
};

const getAreaName = (id: string, lang: string) =>
  areaNameTranslations[id]?.[lang] || areaNameTranslations[id]?.en || id;

const calculateDistance = (a: Coordinates, b: Coordinates): number => {
  const R = 6371;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const HealthDirectory = ({ onBack, language = "en" }: HealthDirectoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("marathahalli");

  const area = useMemo(
    () => bangaloreAreas.find((a) => a.id === selectedAreaId) || bangaloreAreas[0],
    [selectedAreaId]
  );

  const facilities: HealthFacility[] = useMemo(() => {
    const list: HealthFacility[] = [];
    area.hospitals.forEach((h, i) =>
      list.push({
        id: `${area.id}-h-${i}`,
        name: h.name,
        type: "Hospital",
        phone: h.phone,
        services: h.services,
        coordinates: h.coordinates,
        distanceKm: calculateDistance(area.center, h.coordinates),
      })
    );
    area.stores.forEach((s, i) =>
      list.push({
        id: `${area.id}-s-${i}`,
        name: s.name,
        type: "Medical Store",
        phone: s.phone,
        services: s.services,
        coordinates: s.coordinates,
        distanceKm: calculateDistance(area.center, s.coordinates),
      })
    );
    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [area]);

  const getFiltered = (type: HealthFacility["type"]) =>
    facilities
      .filter((f) => f.type === type)
      .filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  const openDirections = (f: HealthFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.coordinates.latitude},${f.coordinates.longitude}`;
    window.open(url, "_blank");
  };

  const makeCall = (phone: string) => {
    if (phone && phone !== "N/A") window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
  };

  const renderCard = (f: HealthFacility) => (
    <Card key={f.id} className="p-4 shadow-soft hover:shadow-medium transition-all">
      <div className="mb-3">
        <h3 className="font-semibold text-lg mb-1">{f.name}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {f.distanceKm.toFixed(1)} {getTranslation(language as Language, "km")} from {area.name}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {f.services.map((s, i) => (
          <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" size="sm" onClick={() => openDirections(f)}>
          <Navigation className="h-4 w-4 mr-2" />
          {getTranslation(language as Language, "directions")}
        </Button>
        <Button className="flex-1" size="sm" onClick={() => makeCall(f.phone)}>
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
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{getTranslation(language as Language, "nearbyHealthcare")}</h2>
            <p className="text-sm text-white/80">{getTranslation(language as Language, "findCare")}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation(language as Language, "searchLocation")}
            className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Choose your area in Bangalore</label>
          <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bangaloreAreas.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Showing hospitals and medical stores in {area.name}. Distances are measured from the {area.name} centre.
          </p>
        </div>

        <Tabs defaultValue="hospitals" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="hospitals">
              {getTranslation(language as Language, "hospitals")}
            </TabsTrigger>
            <TabsTrigger value="stores">
              {getTranslation(language as Language, "medicalStores")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hospitals" className="space-y-3">
            {getFiltered("Hospital").length > 0 ? (
              getFiltered("Hospital").map(renderCard)
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No hospitals match your search.</p>
            )}
          </TabsContent>

          <TabsContent value="stores" className="space-y-3">
            {getFiltered("Medical Store").length > 0 ? (
              getFiltered("Medical Store").map(renderCard)
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No medical stores match your search.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthDirectory;
