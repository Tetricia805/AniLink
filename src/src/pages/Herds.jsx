import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import * as herdsApi from '@/api/herds';
import * as animalsApi from '@/api/animals';

const LIVESTOCK_SPECIES = [
  'cattle', 'goats', 'sheep', 'poultry', 'swine', 'rabbits', 'fish', 'camels'
];

const HERD_TYPES = ['dairy', 'beef', 'mixed', 'poultry', 'small_ruminants', 'swine', 'other'];

const LIVESTOCK_PURPOSE = ['breeding', 'milk', 'meat', 'dual-purpose', 'egg', 'traction', 'other'];

const Herds = () => {
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedHerd, setSelectedHerd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnimalDialogOpen, setIsAnimalDialogOpen] = useState(false);
  const [editingHerd, setEditingHerd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadHerds();
  }, []);

  useEffect(() => {
    if (selectedHerd) {
      loadAnimals(selectedHerd._id);
    }
  }, [selectedHerd]);

  const loadHerds = async () => {
    try {
      setLoading(true);
      const response = await herdsApi.getHerds();
      setHerds(response.data.herds || []);
      if (response.data.herds?.length > 0 && !selectedHerd) {
        setSelectedHerd(response.data.herds[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load herds',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnimals = async (herdId) => {
    try {
      const response = await animalsApi.getAnimals({ herd: herdId });
      setAnimals(response.data.animals || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load animals',
        variant: 'destructive'
      });
    }
  };

  const handleCreateHerd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      species: formData.getAll('species'),
      herdType: formData.get('herdType') || 'mixed',
      primaryPurpose: formData.get('primaryPurpose') || 'dual-purpose',
      sizeEstimate: {
        adultFemales: parseInt(formData.get('adultFemales') || '0'),
        adultMales: parseInt(formData.get('adultMales') || '0'),
        youngStock: parseInt(formData.get('youngStock') || '0'),
        layers: parseInt(formData.get('layers') || '0')
      },
      location: {
        coordinates: formData.get('latitude') && formData.get('longitude')
          ? [parseFloat(formData.get('longitude')), parseFloat(formData.get('latitude'))]
          : undefined,
        address: formData.get('address') || undefined
      },
      biosecurityMeasures: formData.getAll('biosecurityMeasures')
    };

    try {
      if (editingHerd) {
        await herdsApi.updateHerd(editingHerd._id, data);
        toast({
          title: 'Success',
          description: 'Herd updated successfully'
        });
      } else {
        await herdsApi.createHerd(data);
        toast({
          title: 'Success',
          description: 'Herd created successfully'
        });
      }
      setIsDialogOpen(false);
      setEditingHerd(null);
      e.target.reset();
      loadHerds();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save herd',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteHerd = async (herdId) => {
    if (!confirm('Are you sure you want to delete this herd? This action cannot be undone.')) {
      return;
    }
    try {
      await herdsApi.deleteHerd(herdId);
      toast({
        title: 'Success',
        description: 'Herd deleted successfully'
      });
      if (selectedHerd?._id === herdId) {
        setSelectedHerd(null);
        setAnimals([]);
      }
      loadHerds();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete herd',
        variant: 'destructive'
      });
    }
  };

  const handleCreateAnimal = async (e) => {
    e.preventDefault();
    if (!selectedHerd) {
      toast({
        title: 'Error',
        description: 'Please select a herd first',
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData(e.target);
    const data = {
      herd: selectedHerd._id,
      tagId: formData.get('tagId'),
      species: formData.get('species'),
      breed: formData.get('breed') || undefined,
      sex: formData.get('sex') || 'female',
      dateOfBirth: formData.get('dateOfBirth') || undefined,
      purpose: formData.get('purpose') || 'dual-purpose',
      status: formData.get('status') || 'active',
      metadata: {
        color: formData.get('color') || undefined,
        distinguishingMarks: formData.get('distinguishingMarks') || undefined
      }
    };

    try {
      await animalsApi.createAnimal(data);
      toast({
        title: 'Success',
        description: 'Animal added successfully'
      });
      setIsAnimalDialogOpen(false);
      e.target.reset();
      loadAnimals(selectedHerd._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add animal',
        variant: 'destructive'
      });
    }
  };

  const filteredHerds = herds.filter(herd =>
    herd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    herd.species.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-4xl md:text-5xl font-bold">Manage Your Herds</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Track and manage your livestock herds. Add animals, monitor health, and keep detailed records.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Herds List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>My Herds</CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setEditingHerd(null)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Herd
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingHerd ? 'Edit Herd' : 'Create New Herd'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateHerd} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Herd Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              defaultValue={editingHerd?.name}
                              placeholder="e.g., Main Dairy Herd"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="species">Species *</Label>
                            <div className="space-y-2">
                              {LIVESTOCK_SPECIES.map(species => (
                                <label key={species} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    name="species"
                                    value={species}
                                    defaultChecked={editingHerd?.species?.includes(species)}
                                    className="rounded"
                                  />
                                  <span className="capitalize">{species}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="herdType">Herd Type</Label>
                              <Select name="herdType" defaultValue={editingHerd?.herdType || 'mixed'}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {HERD_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>
                                      <span className="capitalize">{type.replace('_', ' ')}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="primaryPurpose">Primary Purpose</Label>
                              <Select name="primaryPurpose" defaultValue={editingHerd?.primaryPurpose || 'dual-purpose'}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LIVESTOCK_PURPOSE.map(purpose => (
                                    <SelectItem key={purpose} value={purpose}>
                                      <span className="capitalize">{purpose.replace('-', ' ')}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Herd Size Estimate</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="adultFemales" className="text-sm">Adult Females</Label>
                                <Input
                                  id="adultFemales"
                                  name="adultFemales"
                                  type="number"
                                  defaultValue={editingHerd?.sizeEstimate?.adultFemales || 0}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor="adultMales" className="text-sm">Adult Males</Label>
                                <Input
                                  id="adultMales"
                                  name="adultMales"
                                  type="number"
                                  defaultValue={editingHerd?.sizeEstimate?.adultMales || 0}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor="youngStock" className="text-sm">Young Stock</Label>
                                <Input
                                  id="youngStock"
                                  name="youngStock"
                                  type="number"
                                  defaultValue={editingHerd?.sizeEstimate?.youngStock || 0}
                                  min="0"
                                />
                              </div>
                              <div>
                                <Label htmlFor="layers" className="text-sm">Layers (Poultry)</Label>
                                <Input
                                  id="layers"
                                  name="layers"
                                  type="number"
                                  defaultValue={editingHerd?.sizeEstimate?.layers || 0}
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address">Location Address</Label>
                            <Input
                              id="address"
                              name="address"
                              defaultValue={editingHerd?.location?.address}
                              placeholder="e.g., Farm location"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="latitude">Latitude (Optional)</Label>
                              <Input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                defaultValue={editingHerd?.location?.coordinates?.[1]}
                                placeholder="e.g., 0.3476"
                              />
                            </div>
                            <div>
                              <Label htmlFor="longitude">Longitude (Optional)</Label>
                              <Input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                defaultValue={editingHerd?.location?.coordinates?.[0]}
                                placeholder="e.g., 32.5825"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Biosecurity Measures</Label>
                            <div className="space-y-2">
                              {['Quarantine area', 'Vaccination program', 'Regular health checks', 'Isolation protocols'].map(measure => (
                                <label key={measure} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    name="biosecurityMeasures"
                                    value={measure}
                                    defaultChecked={editingHerd?.biosecurityMeasures?.includes(measure)}
                                    className="rounded"
                                  />
                                  <span>{measure}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <Button type="submit" className="w-full">
                            {editingHerd ? 'Update Herd' : 'Create Herd'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search herds..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : filteredHerds.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No herds found</div>
                    ) : (
                      filteredHerds.map(herd => (
                        <div
                          key={herd._id}
                          onClick={() => setSelectedHerd(herd)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedHerd?._id === herd._id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{herd.name}</h3>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {herd.species.map(s => (
                                  <Badge key={s} variant="secondary" className="text-xs capitalize">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>
                                  {herd.sizeEstimate?.adultFemales || 0} females, {herd.sizeEstimate?.adultMales || 0} males
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingHerd(herd);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHerd(herd._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Selected Herd Details & Animals */}
            <div className="lg:col-span-2">
              {selectedHerd ? (
                <>
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedHerd.name}</CardTitle>
                          <CardDescription>
                            {selectedHerd.herdType && (
                              <Badge variant="outline" className="mr-2 capitalize">
                                {selectedHerd.herdType.replace('_', ' ')}
                              </Badge>
                            )}
                            {selectedHerd.primaryPurpose && (
                              <Badge variant="outline" className="capitalize">
                                {selectedHerd.primaryPurpose.replace('-', ' ')}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <Dialog open={isAnimalDialogOpen} onOpenChange={setIsAnimalDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Animal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add Animal to {selectedHerd.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateAnimal} className="space-y-4">
                              <div>
                                <Label htmlFor="tagId">Tag ID *</Label>
                                <Input
                                  id="tagId"
                                  name="tagId"
                                  placeholder="e.g., TAG-001"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="species">Species *</Label>
                                  <Select name="species" required>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select species" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LIVESTOCK_SPECIES.map(species => (
                                        <SelectItem key={species} value={species}>
                                          <span className="capitalize">{species}</span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="sex">Sex</Label>
                                  <Select name="sex" defaultValue="female">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="unknown">Unknown</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="breed">Breed</Label>
                                  <Input id="breed" name="breed" placeholder="e.g., Holstein" />
                                </div>

                                <div>
                                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                  <Input id="dateOfBirth" name="dateOfBirth" type="date" />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="purpose">Purpose</Label>
                                  <Select name="purpose" defaultValue="dual-purpose">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LIVESTOCK_PURPOSE.map(purpose => (
                                        <SelectItem key={purpose} value={purpose}>
                                          <span className="capitalize">{purpose.replace('-', ' ')}</span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="status">Status</Label>
                                  <Select name="status" defaultValue="active">
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="sold">Sold</SelectItem>
                                      <SelectItem value="deceased">Deceased</SelectItem>
                                      <SelectItem value="missing">Missing</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="color">Color/Markings</Label>
                                  <Input id="color" name="color" placeholder="e.g., Black and white" />
                                </div>

                                <div>
                                  <Label htmlFor="distinguishingMarks">Distinguishing Marks</Label>
                                  <Input id="distinguishingMarks" name="distinguishingMarks" placeholder="e.g., White star on forehead" />
                                </div>
                              </div>

                              <Button type="submit" className="w-full">
                                Add Animal
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedHerd.sizeEstimate?.adultFemales || 0}
                          </div>
                          <div className="text-sm text-gray-600">Adult Females</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedHerd.sizeEstimate?.adultMales || 0}
                          </div>
                          <div className="text-sm text-gray-600">Adult Males</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedHerd.sizeEstimate?.youngStock || 0}
                          </div>
                          <div className="text-sm text-gray-600">Young Stock</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {animals.length}
                          </div>
                          <div className="text-sm text-gray-600">Tracked Animals</div>
                        </div>
                      </div>

                      {selectedHerd.location?.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>{selectedHerd.location.address}</span>
                        </div>
                      )}

                      {selectedHerd.biosecurityMeasures?.length > 0 && (
                        <div className="mb-4">
                          <Label className="text-sm font-semibold mb-2 block">Biosecurity Measures</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedHerd.biosecurityMeasures.map((measure, idx) => (
                              <Badge key={idx} variant="outline">{measure}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Animals in Herd</CardTitle>
                      <CardDescription>Individual animals tracked in this herd</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {animals.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No animals added yet</p>
                          <p className="text-sm">Click "Add Animal" to start tracking individual animals</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {animals.map(animal => (
                            <div
                              key={animal._id}
                              className="p-4 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold">{animal.tagId}</h4>
                                    <Badge variant="outline" className="capitalize">{animal.species}</Badge>
                                    {animal.breed && (
                                      <span className="text-sm text-gray-600">({animal.breed})</span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                    <span className="capitalize">Sex: {animal.sex}</span>
                                    {animal.dateOfBirth && (
                                      <span>
                                        DOB: {new Date(animal.dateOfBirth).toLocaleDateString()}
                                      </span>
                                    )}
                                    <Badge
                                      variant={animal.status === 'active' ? 'default' : 'secondary'}
                                      className="capitalize"
                                    >
                                      {animal.status}
                                    </Badge>
                                  </div>
                                  {animal.metadata?.color && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Color: {animal.metadata.color}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Herd Selected</h3>
                    <p className="text-gray-600 mb-4">Select a herd from the list to view details and manage animals</p>
                    {herds.length === 0 && (
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Herd
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Herds;

