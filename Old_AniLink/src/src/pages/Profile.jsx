import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getMe } from '@/api/auth';
import { updateProfile, changePassword } from '@/api/user';

const regions = ['Central', 'Eastern', 'Western', 'Northern'];
const contactMethods = ['phone', 'sms', 'whatsapp', 'email'];
const languages = ['English', 'Luganda', 'Runyankole', 'Ateso', 'Luo'];
const livestockSpecies = [
  'cattle',
  'goats',
  'sheep',
  'poultry',
  'swine',
  'rabbits',
  'fish',
  'camels'
];

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    region: '',
    district: '',
    address: '',
    preferredLanguages: ['English'],
    preferredContactMethod: 'phone',
    farmerProfile: {
      primarySpecies: []
    },
    location: {
      coordinates: [32.5825, 0.3476]
    }
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMe();
        if (response.status === 'success') {
          const data = response.data.user;
          setProfile((prev) => ({
            ...prev,
            ...data,
            preferredLanguages: data.preferredLanguages?.length
              ? data.preferredLanguages
              : prev.preferredLanguages,
            preferredContactMethod:
              data.preferredContactMethod || prev.preferredContactMethod,
            farmerProfile: {
              primarySpecies:
                data.farmerProfile?.primarySpecies || prev.farmerProfile.primarySpecies
            },
            location: data.location || prev.location
          }));
        }
      } catch (error) {
        toast({
          title: 'Failed to load profile',
          description: error.response?.data?.message || error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageToggle = (language) => {
    setProfile((prev) => {
      const exists = prev.preferredLanguages.includes(language);
      return {
        ...prev,
        preferredLanguages: exists
          ? prev.preferredLanguages.filter((lang) => lang !== language)
          : [...prev.preferredLanguages, language]
      };
    });
  };

  const handleSpeciesToggle = (species) => {
    setProfile((prev) => {
      const current = prev.farmerProfile?.primarySpecies || [];
      const exists = current.includes(species);
      return {
        ...prev,
        farmerProfile: {
          primarySpecies: exists
            ? current.filter((item) => item !== species)
            : [...current, species]
        }
      };
    });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      location: {
        type: 'Point',
        coordinates: [
          name === 'lng'
            ? parseFloat(value) || prev.location?.coordinates?.[0] || 0
            : prev.location?.coordinates?.[0] || 0,
          name === 'lat'
            ? parseFloat(value) || prev.location?.coordinates?.[1] || 0
            : prev.location?.coordinates?.[1] || 0
        ]
      }
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        region: profile.region,
        district: profile.district,
        address: profile.address,
        preferredLanguages: profile.preferredLanguages,
        preferredContactMethod: profile.preferredContactMethod
      };
      if (profile.location?.coordinates?.every((val) => typeof val === 'number')) {
        payload.location = profile.location;
      }
      if (profile.farmerProfile?.primarySpecies?.length) {
        payload.farmerProfile = profile.farmerProfile;
      }
      const response = await updateProfile(payload);
      toast({
        title: 'Profile updated',
        description: 'Your information has been saved.'
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await changePassword(passwordForm);
      toast({
        title: 'Password updated',
        description: 'Your password has been changed.'
      });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast({
        title: 'Failed to update password',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <p className="text-center text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-16 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <select
                  id="region"
                  name="region"
                  value={profile.region || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  name="district"
                  value={profile.district || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address || ''}
                  onChange={handleInputChange}
                  placeholder="Village or trading center"
                />
              </div>
              <div>
                <Label htmlFor="preferredContactMethod">Preferred Contact</Label>
                <select
                  id="preferredContactMethod"
                  name="preferredContactMethod"
                  value={profile.preferredContactMethod || 'phone'}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {contactMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Preferred Languages</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {languages.map((language) => (
                  <label key={language} className="flex items-center space-x-1 text-sm">
                    <input
                      type="checkbox"
                      checked={profile.preferredLanguages?.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                    />
                    <span>{language}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Primary Livestock</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {livestockSpecies.map((species) => (
                  <label key={species} className="flex items-center space-x-1 text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={profile.farmerProfile?.primarySpecies?.includes(species)}
                      onChange={() => handleSpeciesToggle(species)}
                    />
                    <span>{species}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  name="lat"
                  type="number"
                  step="0.00001"
                  value={profile.location?.coordinates?.[1] ?? ''}
                  onChange={handleLocationChange}
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  name="lng"
                  type="number"
                  step="0.00001"
                  value={profile.location?.coordinates?.[0] ?? ''}
                  onChange={handleLocationChange}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

