import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Camera, 
  Droplet, 
  Phone, 
  AlertTriangle, 
  Heart,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other"];

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    age: "",
    gender: "",
    blood_group: "",
    phone: "",
    emergency_contact: "",
    emergency_contact_name: "",
    allergies: [] as string[],
    chronic_conditions: [] as string[]
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        blood_group: profile.blood_group || "",
        phone: profile.phone || "",
        emergency_contact: profile.emergency_contact || "",
        emergency_contact_name: profile.emergency_contact_name || "",
        allergies: profile.allergies || [],
        chronic_conditions: profile.chronic_conditions || []
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile({
      name: editedProfile.name || null,
      age: editedProfile.age ? parseInt(editedProfile.age) : null,
      gender: editedProfile.gender || null,
      blood_group: editedProfile.blood_group || null,
      phone: editedProfile.phone || null,
      emergency_contact: editedProfile.emergency_contact || null,
      emergency_contact_name: editedProfile.emergency_contact_name || null,
      allergies: editedProfile.allergies,
      chronic_conditions: editedProfile.chronic_conditions
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);
    await uploadAvatar(file);
    setIsUploading(false);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setEditedProfile({
        ...editedProfile,
        allergies: [...editedProfile.allergies, newAllergy.trim()]
      });
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      allergies: editedProfile.allergies.filter((_, i) => i !== index)
    });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setEditedProfile({
        ...editedProfile,
        chronic_conditions: [...editedProfile.chronic_conditions, newCondition.trim()]
      });
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      chronic_conditions: editedProfile.chronic_conditions.filter((_, i) => i !== index)
    });
  };

  if (authLoading || profileLoading) {
    return (
      <AppLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const displayProfile = isEditing ? editedProfile : {
    name: profile?.name || "",
    age: profile?.age?.toString() || "",
    gender: profile?.gender || "",
    blood_group: profile?.blood_group || "",
    phone: profile?.phone || "",
    emergency_contact: profile?.emergency_contact || "",
    emergency_contact_name: profile?.emergency_contact_name || "",
    allergies: profile?.allergies || [],
    chronic_conditions: profile?.chronic_conditions || []
  };

  return (
    <AppLayout title="My Profile">
      <div className="space-y-6 animate-fade-in">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url || ""} alt={displayProfile.name} />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {displayProfile.name?.split(" ").map(n => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center">
            {isEditing ? (
              <Input
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="text-center text-xl font-bold"
                placeholder="Your Name"
              />
            ) : (
              <>
                <h2 className="text-xl font-bold">{displayProfile.name || "Set your name"}</h2>
                <p className="text-muted-foreground">
                  {displayProfile.age ? `${displayProfile.age} years` : "Age not set"} • {displayProfile.gender || "Gender not set"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Edit Toggle */}
        <div className="flex justify-end">
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gradient-primary">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Basic Info Card */}
        <div className="healthcare-card space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Droplet className="h-4 w-4 text-primary" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Blood Group</Label>
              {isEditing ? (
                <Select
                  value={editedProfile.blood_group}
                  onValueChange={(v) => setEditedProfile({ ...editedProfile, blood_group: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-semibold text-lg text-destructive">{displayProfile.blood_group || "Not set"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Age</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={editedProfile.age} 
                  onChange={(e) => setEditedProfile({ ...editedProfile, age: e.target.value })}
                  className="mt-1"
                  placeholder="Age"
                />
              ) : (
                <p className="font-semibold text-lg">{displayProfile.age ? `${displayProfile.age} years` : "Not set"}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground text-xs">Gender</Label>
              {isEditing ? (
                <Select
                  value={editedProfile.gender}
                  onValueChange={(v) => setEditedProfile({ ...editedProfile, gender: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-semibold">{displayProfile.gender || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="healthcare-card space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contact Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">Phone Number</Label>
              {isEditing ? (
                <Input 
                  value={editedProfile.phone} 
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  className="mt-1"
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <p className="font-medium">{displayProfile.phone || "Not set"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Emergency Contact Name</Label>
              {isEditing ? (
                <Input 
                  value={editedProfile.emergency_contact_name} 
                  onChange={(e) => setEditedProfile({ ...editedProfile, emergency_contact_name: e.target.value })}
                  className="mt-1"
                  placeholder="Contact name"
                />
              ) : (
                <p className="font-medium">{displayProfile.emergency_contact_name || "Not set"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Emergency Contact Number</Label>
              {isEditing ? (
                <Input 
                  value={editedProfile.emergency_contact} 
                  onChange={(e) => setEditedProfile({ ...editedProfile, emergency_contact: e.target.value })}
                  className="mt-1"
                  placeholder="+1 (555) 987-6543"
                />
              ) : (
                <p className="font-medium text-destructive">{displayProfile.emergency_contact || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Allergies */}
        <div className="healthcare-card space-y-4 alert-critical border">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Known Allergies
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {displayProfile.allergies.map((allergy, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-destructive/20 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {allergy}
                {isEditing && (
                  <button onClick={() => removeAllergy(index)} className="hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {displayProfile.allergies.length === 0 && !isEditing && (
              <span className="text-muted-foreground text-sm">No allergies recorded</span>
            )}
          </div>
          
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add allergy"
                onKeyDown={(e) => e.key === "Enter" && addAllergy()}
              />
              <Button variant="outline" size="icon" onClick={addAllergy}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Chronic Conditions */}
        <div className="healthcare-card space-y-4 alert-warning border">
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Chronic Conditions
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {displayProfile.chronic_conditions.map((condition, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-warning/20 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {condition}
                {isEditing && (
                  <button onClick={() => removeCondition(index)} className="hover:text-warning">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
            {displayProfile.chronic_conditions.length === 0 && !isEditing && (
              <span className="text-muted-foreground text-sm">No conditions recorded</span>
            )}
          </div>
          
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add condition"
                onKeyDown={(e) => e.key === "Enter" && addCondition()}
              />
              <Button variant="outline" size="icon" onClick={addCondition}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Data Privacy Notice */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Your medical data is encrypted and only accessible by you and 
            authorized medical staff with your consent.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
