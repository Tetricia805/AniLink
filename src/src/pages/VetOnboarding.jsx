import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getMyVetProfile, upsertVetProfile } from '@/api/vet';
import { getMe } from '@/api/auth';

const regions = ['Central', 'Eastern', 'Western', 'Northern'];
const specialties = [
  'dairy',
  'beef',
  'poultry',
  'small ruminants',
  'swine',
  'equine',
  'wildlife',
  'public health'
];
const speciesOptions = ['cattle', 'goats', 'sheep', 'poultry', 'swine', 'rabbits', 'camels'];
const practiceTypes = ['mobile', 'clinic', 'telehealth', 'mixed'];
const consultationModes = ['field', 'clinic', 'virtual'];

const VetOnboarding = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [form, setForm] = useState({
    practiceName: '',
    licenseNumber: '',
    licenseExpiry: '',
    region: '',
    district: '',
    address: '',
    locationLat: '',
    locationLng: '',
    coverageRadiusKm: 30,
    emergencySupport: false,
    consultationFeeField: 50000,
    consultationFeeVirtual: 30000,
    specialtyAreas: [],
    speciesCoverage: [],
    practiceTypes: ['mobile'],
    consultationModes: ['field', 'virtual'],
    services: [
      {
        name: 'General Consultation',
        description: '',
        baseFee: 50000
      }
    ]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await getMe();
        setUserRole(userRes.data.user.role);
        try {
          const { data } = await getMyVetProfile();
          const profile = data.profile;
          setForm({
            practiceName: profile.practiceName || '',
            licenseNumber: profile.licenseNumber || '',
            licenseExpiry: profile.licenseExpiry?.split('T')[0] || '',
            region: profile.region || '',
            district: profile.district || '',
            address: profile.address || '',
            locationLat: profile.location?.coordinates?.[1] ?? '',
            locationLng: profile.location?.coordinates?.[0] ?? '',
            coverageRadiusKm: profile.coverageRadiusKm ?? 30,
            emergencySupport: profile.emergencySupport ?? false,
            consultationFeeField: profile.consultationFee?.field ?? 50000,
            consultationFeeVirtual: profile.consultationFee?.virtual ?? 30000,
            specialtyAreas: profile.specialtyAreas || [],
            speciesCoverage: profile.speciesCoverage || [],
            practiceTypes: profile.practiceTypes || [],
            consultationModes: profile.consultationModes || [],
            services:
              profile.services?.length
                ? profile.services.map((svc) => ({
                    name: svc.name,
                    description: svc.description || '',
                    baseFee: svc.baseFee || 0
                  }))
                : form.services
          });
        } catch (error) {
          if (error.response?.status !== 404) {
            throw error;
          }
        }
      } catch (error) {
        toast({
          title: 'Failed to load data',
          description: error.response?.data?.message || error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleArrayValue = (key, value) => {
    setForm((prev) => {
      const current = prev[key];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((item) => item !== value) : [...current, value]
      };
    });
  };

  const handleServiceChange = (index, field, value) => {
    setForm((prev) => {
      const services = [...prev.services];
      services[index] = { ...services[index], [field]: value };
      return { ...prev, services };
    });
  };

  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', baseFee: 0 }]
    }));
  };

  const removeService = (index) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        practiceName: form.practiceName,
        licenseNumber: form.licenseNumber,
        licenseExpiry: form.licenseExpiry,
        region: form.region,
        district: form.district,
        address: form.address,
        coverageRadiusKm: Number(form.coverageRadiusKm),
        emergencySupport: form.emergencySupport,
        consultationFee: {
          field: Number(form.consultationFeeField),
          virtual: Number(form.consultationFeeVirtual)
        },
        specialtyAreas: form.specialtyAreas,
        speciesCoverage: form.speciesCoverage,
        practiceTypes: form.practiceTypes,
        consultationModes: form.consultationModes,
        services: form.services.map((svc) => ({
          name: svc.name,
          description: svc.description,
          baseFee: Number(svc.baseFee)
        })),
        location: {
          coordinates: [
            Number(form.locationLng) || 0,
            Number(form.locationLat) || 0
          ]
        }
      };

      await upsertVetProfile(payload);
      toast({
        title: 'Profile saved',
        description: 'Your veterinary profile is up to date.'
      });
    } catch (error) {
      toast({
        title: 'Failed to save profile',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  if (userRole !== 'vet' && userRole !== 'admin') {
    return (
      <div className="container py-16 max-w-3xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Veterinarian Access Required</h2>
        <p className="text-gray-600">
          Your account is not marked as a veterinarian. Please sign up as a vet or contact
          support to switch your role.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-16 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Veterinarian Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Practice Name</Label>
                <Input
                  value={form.practiceName}
                  onChange={(e) => setForm((prev) => ({ ...prev, practiceName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>License Number</Label>
                <Input
                  value={form.licenseNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  value={form.licenseExpiry}
                  onChange={(e) => setForm((prev) => ({ ...prev, licenseExpiry: e.target.value }))}
                />
              </div>
              <div>
                <Label>Region</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.region}
                  onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
                  required
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
                <Label>District</Label>
                <Input
                  value={form.district}
                  onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Address / Clinic Location</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={form.locationLat}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationLat: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={form.locationLng}
                  onChange={(e) => setForm((prev) => ({ ...prev, locationLng: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Coverage Radius (KM)</Label>
                <Input
                  type="number"
                  value={form.coverageRadiusKm}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, coverageRadiusKm: e.target.value }))
                  }
                  min={1}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  id="emergency"
                  type="checkbox"
                  checked={form.emergencySupport}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, emergencySupport: e.target.checked }))
                  }
                />
                <Label htmlFor="emergency">Offers emergency support</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Field Consultation Fee (UGX)</Label>
                <Input
                  type="number"
                  value={form.consultationFeeField}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, consultationFeeField: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Virtual Consultation Fee (UGX)</Label>
                <Input
                  type="number"
                  value={form.consultationFeeVirtual}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, consultationFeeVirtual: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Specialty Areas</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {specialties.map((item) => (
                  <label key={item} className="flex items-center space-x-1 text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={form.specialtyAreas.includes(item)}
                      onChange={() => toggleArrayValue('specialtyAreas', item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Species Coverage</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {speciesOptions.map((item) => (
                  <label key={item} className="flex items-center space-x-1 text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={form.speciesCoverage.includes(item)}
                      onChange={() => toggleArrayValue('speciesCoverage', item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Practice Types</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {practiceTypes.map((item) => (
                    <label key={item} className="flex items-center space-x-1 text-sm capitalize">
                      <input
                        type="checkbox"
                        checked={form.practiceTypes.includes(item)}
                        onChange={() => toggleArrayValue('practiceTypes', item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Consultation Modes</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {consultationModes.map((item) => (
                    <label key={item} className="flex items-center space-x-1 text-sm capitalize">
                      <input
                        type="checkbox"
                        checked={form.consultationModes.includes(item)}
                        onChange={() => toggleArrayValue('consultationModes', item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Services Offered</Label>
                <Button type="button" variant="outline" size="sm" onClick={addService}>
                  Add Service
                </Button>
              </div>
              <div className="space-y-4">
                {form.services.map((service, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Service Name</Label>
                        <Input
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Base Fee (UGX)</Label>
                        <Input
                          type="number"
                          value={service.baseFee}
                          onChange={(e) => handleServiceChange(index, 'baseFee', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={service.description}
                        onChange={(e) =>
                          handleServiceChange(index, 'description', e.target.value)
                        }
                        placeholder="Brief summary of the service"
                      />
                    </div>
                    {form.services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VetOnboarding;

