
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Filter, 
  Search,
  Stethoscope,
  Award,
  Calendar,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const Vets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [vets, setVets] = useState([]);
  const { toast } = useToast();

  // Mock data for veterinarians
  useEffect(() => {
    const mockVets = [
      {
        id: 1,
        name: 'Dr. Sarah Nakamura',
        clinic: 'Kampala Animal Hospital',
        specialty: 'Small Animals',
        region: 'Central',
        district: 'Kampala',
        rating: 4.9,
        reviews: 127,
        experience: '8 years',
        phone: '+256 700 123 456',
        availability: 'Available Today',
        services: ['Vaccinations', 'Surgery', 'Emergency Care'],
        image: 'Professional female veterinarian in white coat with stethoscope',
        verified: true,
        emergency: true
      },
      {
        id: 2,
        name: 'Dr. James Okello',
        clinic: 'Mbarara Veterinary Clinic',
        specialty: 'Large Animals',
        region: 'Western',
        district: 'Mbarara',
        rating: 4.8,
        reviews: 89,
        experience: '12 years',
        phone: '+256 700 234 567',
        availability: 'Available Tomorrow',
        services: ['Cattle Care', 'Farm Visits', 'Breeding Consultation'],
        image: 'Experienced male veterinarian examining cattle on a farm',
        verified: true,
        emergency: false
      },
      {
        id: 3,
        name: 'Dr. Mary Achieng',
        clinic: 'Jinja Pet Care Center',
        specialty: 'Mixed Practice',
        region: 'Eastern',
        district: 'Jinja',
        rating: 4.7,
        reviews: 156,
        experience: '6 years',
        phone: '+256 700 345 678',
        availability: 'Available Today',
        services: ['Pet Care', 'Livestock', 'Preventive Medicine'],
        image: 'Friendly female veterinarian with various animals in clinic',
        verified: true,
        emergency: true
      },
      {
        id: 4,
        name: 'Dr. Peter Ssemakula',
        clinic: 'Gulu Animal Wellness',
        specialty: 'Wildlife & Exotic',
        region: 'Northern',
        district: 'Gulu',
        rating: 4.6,
        reviews: 73,
        experience: '10 years',
        phone: '+256 700 456 789',
        availability: 'Busy - Next Available: Monday',
        services: ['Wildlife Care', 'Exotic Pets', 'Conservation'],
        image: 'Veterinarian specializing in wildlife and exotic animals',
        verified: true,
        emergency: false
      },
      {
        id: 5,
        name: 'Dr. Grace Namuli',
        clinic: 'Mbale Veterinary Services',
        specialty: 'Poultry',
        region: 'Eastern',
        district: 'Mbale',
        rating: 4.8,
        reviews: 94,
        experience: '7 years',
        phone: '+256 700 567 890',
        availability: 'Available Today',
        services: ['Poultry Health', 'Hatchery Management', 'Disease Control'],
        image: 'Veterinarian working with chickens and poultry in modern facility',
        verified: true,
        emergency: true
      },
      {
        id: 6,
        name: 'Dr. Robert Tumwine',
        clinic: 'Fort Portal Animal Clinic',
        specialty: 'Small Animals',
        region: 'Western',
        district: 'Kabarole',
        rating: 4.5,
        reviews: 68,
        experience: '5 years',
        phone: '+256 700 678 901',
        availability: 'Available Tomorrow',
        services: ['Pet Surgery', 'Dental Care', 'Grooming'],
        image: 'Young veterinarian providing dental care to a dog',
        verified: false,
        emergency: false
      }
    ];
    setVets(mockVets);
  }, []);

  const regions = ['all', 'Central', 'Eastern', 'Western', 'Northern'];
  const specialties = ['all', 'Small Animals', 'Large Animals', 'Mixed Practice', 'Wildlife & Exotic', 'Poultry'];

  const filteredVets = vets.filter(vet => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || vet.region === selectedRegion;
    const matchesSpecialty = selectedSpecialty === 'all' || vet.specialty === selectedSpecialty;
    
    return matchesSearch && matchesRegion && matchesSpecialty;
  });

  const handleBookAppointment = (vet) => {
    toast({
      title: 'Booking Request Sent!',
      description: `Your appointment request with ${vet.name} has been sent. They will contact you shortly.`,
    });
  };

  const handleCallVet = (vet) => {
    toast({
      title: 'Calling...',
      description: `Connecting you to ${vet.name} at ${vet.phone}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">Find Veterinarians</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Connect with qualified veterinary professionals across Uganda. 
              From pets to livestock, find the right care for your animals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name, clinic, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {filteredVets.length} Veterinarian{filteredVets.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Sorted by rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVets.map((vet, index) => (
              <motion.div
                key={vet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full card-hover">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img  
                          className="w-16 h-16 rounded-full object-cover" 
                          alt={`Dr. ${vet.name} profile picture`}
                         src="https://images.unsplash.com/photo-1692041490215-1689c30065bc" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg">{vet.name}</CardTitle>
                            {vet.verified && (
                              <Award className="h-4 w-4 text-blue-600" title="Verified Professional" />
                            )}
                          </div>
                          <CardDescription>{vet.clinic}</CardDescription>
                        </div>
                      </div>
                      {vet.emergency && (
                        <Badge variant="destructive" className="text-xs">
                          Emergency
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{vet.rating}</span>
                        <span className="text-gray-500">({vet.reviews} reviews)</span>
                      </div>
                      <Badge variant="outline">{vet.specialty}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{vet.district}, {vet.region} Region</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Stethoscope className="h-4 w-4" />
                        <span>{vet.experience} experience</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span className={vet.availability.includes('Available Today') ? 'text-green-600' : 'text-orange-600'}>
                          {vet.availability}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {vet.services.slice(0, 3).map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={() => handleBookAppointment(vet)}
                        className="flex-1"
                        size="sm"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book
                      </Button>
                      <Button 
                        onClick={() => handleCallVet(vet)}
                        variant="outline" 
                        size="sm"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredVets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No veterinarians found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all available veterinarians.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedRegion('all');
                setSelectedSpecialty('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Vets;
