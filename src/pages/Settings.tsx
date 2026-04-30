"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Lock, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Phone,
  Calendar,
  Heart,
  Users,
  Star,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhotoUrl?: string;
  maritalStatus?: string;
  alternativePhone?: string;
  ministryGroup?: string;
  servicePosition?: string;
  spiritualGifts?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    profilePhotoUrl: "",
    maritalStatus: "",
    alternativePhone: "",
    ministryGroup: "",
    servicePosition: "",
    spiritualGifts: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: score, label: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { level: score, label: "Good", color: "bg-yellow-500" };
    return { level: score, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  const loadProfile = async () => {
    try {
      const res = await sendPostRequest("auth", "get-current-user", {});
      if (res.returnCode === 200 && res.returnData) {
        const rawDob = res.returnData.dateOfBirth;
        let dobStr = "";
        if (rawDob) {
          if (typeof rawDob === "string") {
            dobStr = rawDob.split("T")[0];
          } else if (typeof rawDob === "object" && rawDob !== null) {
            dobStr = rawDob.split("T")[0];
          }
        }
        
        setProfile({
          id: res.returnData.id,
          username: res.returnData.username || "",
          email: res.returnData.email || "",
          firstName: res.returnData.firstName || "",
          lastName: res.returnData.lastName || "",
          middleName: res.returnData.middleName || "",
          phoneNumber: res.returnData.phoneNumber || "",
          dateOfBirth: dobStr,
          gender: res.returnData.gender || "",
          profilePhotoUrl: res.returnData.profilePhotoUrl || "",
          maritalStatus: res.returnData.maritalStatus || "",
          alternativePhone: res.returnData.alternativePhone || "",
          ministryGroup: res.returnData.ministryGroup || "",
          servicePosition: res.returnData.servicePosition || "",
          spiritualGifts: res.returnData.spiritualGifts || "",
          emergencyContactName: res.returnData.emergencyContactName || "",
          emergencyContactPhone: res.returnData.emergencyContactPhone || "",
          emergencyContactRelationship: res.returnData.emergencyContactRelationship || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [navigate]);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await sendPostRequest("auth", "update-current-user", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        maritalStatus: profile.maritalStatus,
        alternativePhone: profile.alternativePhone,
        ministryGroup: profile.ministryGroup,
        servicePosition: profile.servicePosition,
        spiritualGifts: profile.spiritualGifts,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        emergencyContactRelationship: profile.emergencyContactRelationship,
      });
      if (res.returnCode === 200) {
        toast({ title: "Profile updated successfully" });
        loadProfile();
      } else {
        toast({ 
          title: res.message || "Failed to update profile", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast({ title: "All password fields are required", variant: "destructive" });
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    if (!/[A-Z]/.test(passwords.newPassword) || !/[a-z]/.test(passwords.newPassword)) {
      toast({ title: "Password must include both uppercase and lowercase letters", variant: "destructive" });
      return;
    }

    if (!/\d/.test(passwords.newPassword)) {
      toast({ title: "Password must include at least one number", variant: "destructive" });
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(passwords.newPassword)) {
      toast({ title: "Password must include at least one special character", variant: "destructive" });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      toast({ title: "New password must be different from current password", variant: "destructive" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await sendPostRequest("auth", "update-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.returnCode === 200) {
        toast({ title: "Password updated successfully" });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: res.returnMessage || "Failed to update password", variant: "destructive" });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.returnMessage || error?.message || "Error updating password";
      toast({ title: errorMessage, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary" />
          <Loader2 className="w-5 h-5 animate-spin text-primary absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="relative bg-slate-450 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative  mx-auto px-3 sm:px-4 lg:px-6 pt-5 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary/40">
                Account Settings
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Your Profile
              </h1>
            </div>
          </div>
          <p className="text-sm text-primary/50 ml-[52px]">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden text-[10px]">PROF</span>
            </TabsTrigger>
            <TabsTrigger 
              value="additional" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Star className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Extra</span>
              <span className="sm:hidden text-[10px]">EXTRA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Password</span>
              <span className="sm:hidden text-[10px]">PASS</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personal Info</h3>
                      <p className="text-xs text-muted-foreground">Your basic account details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        disabled
                        className="bg-muted/50 border-dashed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-muted/50 border-dashed pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="text-xs font-medium text-muted-foreground">Middle Name</Label>
                      <Input
                        id="middleName"
                        placeholder="Optional"
                        value={profile.middleName}
                        onChange={(e) => handleProfileChange("middleName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={profile.phoneNumber}
                          onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-xs font-medium text-muted-foreground">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-medium text-muted-foreground">Gender</Label>
                      <Select
                        value={profile.gender || "none"}
                        onValueChange={(value) => handleProfileChange("gender", value === "none" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Prefer not to say</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !profile.firstName || !profile.lastName}
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Additional Details</h3>
                      <p className="text-xs text-muted-foreground">More info about yourself</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className="text-xs font-medium text-muted-foreground">Marital Status</Label>
                      <Select
                        value={profile.maritalStatus || "none"}
                        onValueChange={(value) => handleProfileChange("maritalStatus", value === "none" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Prefer not to say</SelectItem>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                          <SelectItem value="Separated">Separated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alternativePhone" className="text-xs font-medium text-muted-foreground">Alternative Phone</Label>
                      <Input
                        id="alternativePhone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={profile.alternativePhone}
                        onChange={(e) => handleProfileChange("alternativePhone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ministryGroup" className="text-xs font-medium text-muted-foreground">Ministry Group</Label>
                      <Input
                        id="ministryGroup"
                        value={profile.ministryGroup}
                        onChange={(e) => handleProfileChange("ministryGroup", e.target.value)}
                        placeholder="e.g., Worship, Ushering"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicePosition" className="text-xs font-medium text-muted-foreground">Service Position</Label>
                      <Input
                        id="servicePosition"
                        value={profile.servicePosition}
                        onChange={(e) => handleProfileChange("servicePosition", e.target.value)}
                        placeholder="e.g., Leader, Volunteer"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="spiritualGifts" className="text-xs font-medium text-muted-foreground">Spiritual Gifts</Label>
                      <Input
                        id="spiritualGifts"
                        value={profile.spiritualGifts}
                        onChange={(e) => handleProfileChange("spiritualGifts", e.target.value)}
                        placeholder="e.g., Teaching, Mercy, Evangelism"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Emergency Contact</h3>
                      <p className="text-xs text-muted-foreground">Who to contact in case of emergency</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName" className="text-xs font-medium text-muted-foreground">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        placeholder="Full name"
                        value={profile.emergencyContactName}
                        onChange={(e) => handleProfileChange("emergencyContactName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={profile.emergencyContactPhone}
                        onChange={(e) => handleProfileChange("emergencyContactPhone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelationship" className="text-xs font-medium text-muted-foreground">Relationship</Label>
                      <Input
                        id="emergencyContactRelationship"
                        placeholder="e.g., Spouse, Parent"
                        value={profile.emergencyContactRelationship}
                        onChange={(e) => handleProfileChange("emergencyContactRelationship", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !profile.firstName || !profile.lastName}
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Change Password</h3>
                      <p className="text-xs text-muted-foreground">Keep your account secure</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-xs font-medium text-muted-foreground">Current Password *</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          placeholder="Enter current password"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("current")}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground">New Password *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          placeholder="Enter new password"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {passwords.newPassword && (
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1 flex-1 rounded transition-all",
                                  i <= passwordStrength.level ? passwordStrength.color : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                          <p className={cn(
                            "text-xs font-medium",
                            passwordStrength.label === "Weak" || passwordStrength.label === "Fair"
                              ? "text-red-500"
                              : passwordStrength.label === "Good"
                              ? "text-yellow-500"
                              : "text-green-500"
                          )}>
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          placeholder="Confirm new password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {passwords.newPassword && passwords.confirmPassword && (
                        passwords.newPassword === passwords.confirmPassword ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Passwords match
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Passwords don't match
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>Passwords must match and meet all requirements before saving.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      savingPassword ||
                      !passwords.currentPassword ||
                      !passwords.newPassword ||
                      !passwords.confirmPassword ||
                      passwords.newPassword !== passwords.confirmPassword ||
                      passwords.newPassword.length < 8 ||
                      !/[A-Z]/.test(passwords.newPassword) ||
                      !/[a-z]/.test(passwords.newPassword) ||
                      !/\d/.test(passwords.newPassword) ||
                      !/[^a-zA-Z0-9]/.test(passwords.newPassword)
                    }
                  >
                    {savingPassword ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="h-8" />
      </div>
    </div>
  );
}