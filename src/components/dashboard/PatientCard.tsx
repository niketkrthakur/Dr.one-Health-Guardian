import { Droplet, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientCardProps {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  avatarUrl?: string;
}

const PatientCard = ({
  name,
  age,
  gender,
  bloodGroup,
  allergies,
  avatarUrl,
}: PatientCardProps) => {
  return (
    <div className="healthcare-card gradient-primary text-white animate-fade-in">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-white/30">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-white/20 text-white text-xl font-semibold">
            {name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{name}</h2>
          <p className="text-white/80 text-sm">
            {age} years • {gender}
          </p>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <Droplet className="h-4 w-4" />
              <span className="font-semibold text-sm">{bloodGroup}</span>
            </div>
            
            {allergies.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{allergies.length} allergies</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;
