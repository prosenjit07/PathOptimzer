"use client";

import { useAtom } from "jotai";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { profileData, getEmptyProfile } from "@/lib/ats/store";

const ProfileSection = () => {
  const [profile, setProfile] = useAtom(profileData);

  const handleChange = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const addSocial = () => {
    setProfile((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        { id: Date.now().toString(), text: "", link: "", selected: true },
      ],
    }));
  };

  const removeSocial = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      socials: prev.socials.filter((s) => s.id !== id),
    }));
  };

  const updateSocial = (
    id: string,
    key: "text" | "link" | "selected",
    value: string | boolean
  ) => {
    setProfile((prev) => ({
      ...prev,
      socials: prev.socials.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={profile.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="profile-location">Location</Label>
          <Input
            id="profile-location"
            value={profile.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="City, Country"
          />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label>Socials / Links</Label>
            <Button size="sm" variant="outline" onClick={addSocial}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
          {profile.socials.map((s) => (
            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Input
                placeholder="Label (e.g. LinkedIn)"
                value={s.text}
                onChange={(e) => updateSocial(s.id, "text", e.target.value)}
              />
              <Input
                placeholder="https://"
                value={s.link}
                onChange={(e) => updateSocial(s.id, "link", e.target.value)}
              />
              <Button
                size="icon"
                variant="destructive"
                onClick={() => removeSocial(s.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
