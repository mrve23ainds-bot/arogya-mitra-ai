import { ArrowLeft, Phone, Ambulance, AlertCircle, Hospital } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmergencyContactsProps {
  onBack: () => void;
}

const emergencyNumbers = [
  {
    id: 1,
    name: "National Emergency",
    number: "112",
    icon: AlertCircle,
    description: "All emergency services",
    color: "bg-destructive",
  },
  {
    id: 2,
    name: "Ambulance",
    number: "108",
    icon: Ambulance,
    description: "Medical emergency & ambulance",
    color: "bg-primary",
  },
  {
    id: 3,
    name: "Women Helpline",
    number: "1091",
    icon: Phone,
    description: "24/7 women safety helpline",
    color: "bg-secondary",
  },
  {
    id: 4,
    name: "Child Helpline",
    number: "1098",
    icon: Phone,
    description: "Child protection services",
    color: "bg-accent",
  },
];

const EmergencyContacts = ({ onBack }: EmergencyContactsProps) => {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-destructive to-destructive/80 p-4 text-white shadow-medium">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Emergency Contacts</h2>
            <p className="text-sm text-white/80">Quick access to help</p>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="p-4">
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">In Case of Emergency</h3>
              <p className="text-sm text-muted-foreground">
                Call these numbers immediately if you or someone needs urgent medical help.
                All helplines are toll-free and available 24/7.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency Numbers */}
      <div className="p-4 space-y-3">
        {emergencyNumbers.map((contact) => {
          const Icon = contact.icon;
          return (
            <Card
              key={contact.id}
              className="p-5 shadow-soft hover:shadow-medium transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`${contact.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-0.5">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                </div>
              </div>
              <Button
                onClick={() => handleCall(contact.number)}
                className="w-full mt-4 h-12 text-lg font-semibold"
                size="lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call {contact.number}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Additional Resources */}
      <div className="p-4 pb-8">
        <Card className="p-4 bg-muted">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Hospital className="h-5 w-5 text-primary" />
            Additional Resources
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Mental Health Helpline: 1800-599-0019</li>
            <li>• Senior Citizen Helpline: 1291</li>
            <li>• Disaster Management: 1078</li>
            <li>• Blood Donation: 1910</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default EmergencyContacts;
