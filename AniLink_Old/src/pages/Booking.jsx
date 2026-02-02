
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  PawPrint,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { listVets } from '@/api/vet';
import { createAppointment } from '@/api/appointments';

const appointmentTypes = [
  { value: 'checkup', label: 'General Checkup', icon: Stethoscope },
  { value: 'vaccination', label: 'Vaccination', icon: Heart },
  { value: 'emergency', label: 'Emergency Care', icon: AlertCircle },
  { value: 'surgery', label: 'Surgery Consultation', icon: Stethoscope },
  { value: 'dental', label: 'Dental Care', icon: Heart },
  { value: 'grooming', label: 'Grooming', icon: PawPrint }
];

const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30'
];

const Booking = () => {
  const { toast } = useToast();
  const [loadingVets, setLoadingVets] = useState(true);
  const [vets, setVets] = useState([]);
  const [form, setForm] = useState({
    vetId: '',
    mode: 'field',
    appointmentType: '',
    date: '',
    time: '',
    durationMinutes: 60,
    serviceId: '',
    serviceName: '',
    serviceFee: '',
    species: 'cattle',
    symptoms: '',
    notes: '',
    address: '',
    locationLat: '',
    locationLng: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        setLoadingVets(true);
        // In development, include pending vets too
        const includePending = import.meta.env.DEV ? 'true' : 'false';
        const response = await listVets({ includePending });
        const vetsList = response?.data?.vets || [];
        setVets(vetsList);
        
        if (vetsList.length === 0) {
          toast({
            title: 'No veterinarians available',
            description: 'There are currently no veterinarians in the system. If you just created a vet profile, it may need to be verified first.',
            variant: 'default'
          });
        }
      } catch (error) {
        console.error('Error fetching vets:', error);
        toast({
          title: 'Failed to load veterinarians',
          description: error.response?.data?.message || error.message || 'Unable to load veterinarians. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoadingVets(false);
      }
    };
    fetchVets();
  }, [toast]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedVet = useMemo(
    () => vets.find((vet) => vet._id === form.vetId),
    [vets, form.vetId]
  );

  const selectedService = useMemo(() => {
    if (!selectedVet) return null;
    if (form.serviceId) {
      return selectedVet.services?.find(
        (svc) => (svc.code || svc._id || svc.name) === form.serviceId
      );
    }
    if (selectedVet.services?.length === 1) {
      return selectedVet.services[0];
    }
    return null;
  }, [selectedVet, form.serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!selectedVet) {
        throw new Error('Please select a veterinarian');
      }
      const scheduledFor = new Date(`${form.date}T${form.time}`);
      if (Number.isNaN(scheduledFor.getTime())) {
        throw new Error('Invalid date or time');
      }

      const payload = {
        vetId: form.vetId,
        scheduledFor: scheduledFor.toISOString(),
        durationMinutes: Number(form.durationMinutes),
        mode: form.mode,
        serviceId: selectedService?.code || selectedService?._id,
        serviceName: selectedService?.name || form.serviceName || 'Consultation',
        serviceFee: selectedService?.baseFee || Number(form.serviceFee) || 0,
        location:
          form.locationLat && form.locationLng
            ? {
                coordinates: [
                  Number(form.locationLng),
                  Number(form.locationLat)
                ],
                address: form.address
              }
            : undefined,
        livestock: {
          species: form.species,
          primarySymptoms: form.symptoms
            ? form.symptoms.split(',').map((symptom) => symptom.trim())
            : []
        },
        farmerNotes: form.notes
      };

      await createAppointment(payload);
      toast({
        title: 'Appointment Booked',
        description: 'Your appointment request has been sent to the veterinarian.'
      });
      setForm({
        vetId: '',
        mode: 'field',
        appointmentType: '',
        date: '',
        time: '',
        durationMinutes: 60,
        serviceId: '',
        serviceName: '',
        serviceFee: '',
        species: 'cattle',
        symptoms: '',
        notes: '',
        address: '',
        locationLat: '',
        locationLng: ''
      });
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">Book Appointment</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Schedule professional veterinary care for your pets and farm animals. 
              Choose from qualified veterinarians across Uganda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <span>Book Your Appointment</span>
                  </CardTitle>
                  <CardDescription>
                    Fill in the details below to schedule your veterinary appointment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingVets ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading veterinarians...</p>
                    </div>
                  ) : vets.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">No veterinarians available</p>
                        <p className="text-sm text-gray-500 mb-4">
                          There are currently no active veterinarians in the system. 
                          This could mean:
                        </p>
                        <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1 mb-4">
                          <li>• Veterinarians are still being verified</li>
                          <li>• No veterinarians have registered yet</li>
                          <li>• All veterinarians are currently unavailable</li>
                        </ul>
                        <p className="text-sm text-gray-500">
                          Please check back later or contact support for assistance.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Veterinarian Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="vet">Select Veterinarian</Label>
                        <Select value={form.vetId} onValueChange={(val) => handleChange('vetId', val)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a veterinarian" />
                          </SelectTrigger>
                          <SelectContent>
                            {vets.length === 0 ? (
                              <div className="p-4 text-center text-sm text-gray-500">
                                No veterinarians available
                              </div>
                            ) : (
                              vets.map((vet) => (
                                <SelectItem key={vet._id} value={vet._id}>
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <p className="font-medium">{vet.practiceName || vet.user?.name || 'Veterinarian'}</p>
                                        {vet.status === 'pending' && (
                                          <Badge variant="outline" className="text-xs">
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-500">
                                        {vet.address || vet.district || ''} {vet.region ? `• ${vet.region}` : ''}
                                      </p>
                                    </div>
                                    {vet.emergencySupport && (
                                      <Badge variant="destructive" className="ml-2">
                                        Emergency
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {vets.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: Only active veterinarians are shown. If you just created a vet profile, it may need to be verified first.
                          </p>
                        )}
                      </div>

                      {/* Appointment Type */}
                      <div className="space-y-2">
                        <Label htmlFor="type">Appointment Type</Label>
                        <Select
                          value={form.appointmentType}
                          onValueChange={(val) => handleChange('appointmentType', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {appointmentTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center space-x-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Preferred Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={form.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Preferred Time</Label>
                          <Select
                            value={form.time}
                            onValueChange={(val) => handleChange('time', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={form.durationMinutes}
                            onChange={(e) => handleChange('durationMinutes', e.target.value)}
                            min={15}
                          />
                        </div>
                        <div>
                          <Label>Consultation Mode</Label>
                          <Select value={form.mode} onValueChange={(val) => handleChange('mode', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="field">Field Visit</SelectItem>
                              <SelectItem value="clinic">Clinic Visit</SelectItem>
                              <SelectItem value="virtual">Virtual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Species</Label>
                          <Select
                            value={form.species}
                            onValueChange={(val) => handleChange('species', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Species" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cattle">Cattle</SelectItem>
                              <SelectItem value="goats">Goats</SelectItem>
                              <SelectItem value="sheep">Sheep</SelectItem>
                              <SelectItem value="poultry">Poultry</SelectItem>
                              <SelectItem value="swine">Swine</SelectItem>
                              <SelectItem value="pets">Pets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-2">
                        <Label>Service</Label>
                        {selectedVet?.services?.length ? (
                          <Select
                            value={form.serviceId}
                            onValueChange={(val) => handleChange('serviceId', val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedVet.services.map((service) => (
                                <SelectItem
                                  key={service._id || service.code || service.name}
                                  value={service.code || service._id || service.name}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <p className="font-medium">{service.name}</p>
                                      {service.description && (
                                        <p className="text-xs text-gray-500">
                                          {service.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      UGX {service.baseFee?.toLocaleString()}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Service Name</Label>
                              <Input
                                value={form.serviceName}
                                onChange={(e) => handleChange('serviceName', e.target.value)}
                                placeholder="e.g., AI consultation"
                              />
                            </div>
                            <div>
                              <Label>Estimated Fee (UGX)</Label>
                              <Input
                                type="number"
                                value={form.serviceFee}
                                onChange={(e) => handleChange('serviceFee', e.target.value)}
                                placeholder="50000"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-2">
                        <Label>Symptoms / Concerns</Label>
                        <Textarea
                          value={form.symptoms}
                          onChange={(e) => handleChange('symptoms', e.target.value)}
                          placeholder="E.g., fever, reduced appetite, nasal discharge"
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple symptoms with commas
                        </p>
                      </div>

                      {/* Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Latitude (optional)</Label>
                          <Input
                            type="number"
                            step="0.00001"
                            value={form.locationLat}
                            onChange={(e) => handleChange('locationLat', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Longitude (optional)</Label>
                          <Input
                            type="number"
                            step="0.00001"
                            value={form.locationLng}
                            onChange={(e) => handleChange('locationLng', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Address (optional)</Label>
                        <Input
                          value={form.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          placeholder="Farm address or description"
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <Label>Additional Notes (optional)</Label>
                        <Textarea
                          value={form.notes}
                          onChange={(e) => handleChange('notes', e.target.value)}
                          rows={4}
                          placeholder="Any extra context you'd like to share"
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Vet Info */}
              {selectedVet && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Selected Veterinarian</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <img
                          className="w-12 h-12 rounded-full object-cover"
                          alt={`${selectedVet.practiceName} profile`}
                          src="https://images.unsplash.com/photo-1543523195-e0613799d7ad"
                        />
                        <div>
                          <p className="font-semibold">{selectedVet.practiceName}</p>
                          <p className="text-sm text-gray-600">
                            {selectedVet.address} • {selectedVet.region}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Stethoscope className="h-4 w-4 text-green-600" />
                          <span>{selectedVet.specialtyAreas?.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span>{selectedVet.district}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span>Coverage radius: {selectedVet.coverageRadiusKm} km</span>
                        </div>
                      </div>
                      {selectedVet.emergencySupport && (
                        <Badge variant="destructive" className="w-full justify-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Emergency Services Available
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Booking Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Booking Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Book at least 24 hours in advance for regular appointments</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Emergency appointments are available 24/7</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Bring vaccination records if available</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Confirmation will be sent via SMS and email</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Cancellations must be made 12 hours before</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700 mb-3">
                    For immediate veterinary emergencies, call our 24/7 hotline:
                  </p>
                  <div className="flex items-center space-x-2 text-red-700 font-semibold">
                    <Phone className="h-4 w-4" />
                    <span>+256 800 VET HELP</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
