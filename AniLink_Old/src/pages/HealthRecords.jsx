import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Stethoscope, 
  Heart, 
  Plus,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  PawPrint,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as healthRecordsApi from '@/api/healthRecords';
import * as herdsApi from '@/api/herds';
import * as animalsApi from '@/api/animals';

const RECORD_TYPES = [
  'routine_check',
  'vaccination',
  'treatment',
  'lab_result',
  'surgery',
  'mortality',
  'other'
];

const LIVESTOCK_SPECIES = [
  'cattle', 'goats', 'sheep', 'poultry', 'swine', 'rabbits', 'fish', 'camels'
];

const VACCINE_TYPES = [
  'FMD', 'CBPP', 'LSD', 'Brucellosis', 'Blackleg', 'PPR', 'Newcastle', 'Gumboro', 'other'
];

const HealthRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState('all');
  const [selectedHerd, setSelectedHerd] = useState('all');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [herds, setHerds] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedAnimal, selectedHerd, recordTypeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [herdsRes, animalsRes, recordsRes] = await Promise.all([
        herdsApi.getHerds(),
        animalsApi.getAnimals(),
        healthRecordsApi.getHealthRecords({
          ...(selectedAnimal && selectedAnimal !== 'all' && { animal: selectedAnimal }),
          ...(selectedHerd && selectedHerd !== 'all' && { herd: selectedHerd }),
          ...(recordTypeFilter !== 'all' && { recordType: recordTypeFilter })
        })
      ]);
      setHerds(herdsRes?.data?.herds || []);
      setAnimals(animalsRes?.data?.animals || []);
      setRecords(recordsRes?.data?.records || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load data');
      setHerds([]);
      setAnimals([]);
      setRecords([]);
      // Only show toast if it's not an auth error (401)
      if (error.response?.status !== 401) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || error.message || 'Failed to load data',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      recordType: formData.get('recordType') || 'treatment',
      species: formData.get('species'),
      animal: formData.get('animal') && formData.get('animal') !== 'none' ? formData.get('animal') : undefined,
      herd: formData.get('herd') && formData.get('herd') !== 'none' ? formData.get('herd') : undefined,
      diagnosis: formData.get('diagnosis') || undefined,
      symptoms: formData.get('symptoms')?.split(',').map(s => s.trim()).filter(Boolean) || [],
      treatmentPlan: formData.get('treatmentDrug') ? [{
        drug: formData.get('treatmentDrug'),
        dosage: formData.get('treatmentDosage') || '',
        frequency: formData.get('treatmentFrequency') || '',
        durationDays: parseInt(formData.get('treatmentDuration') || '0'),
        administeredBy: formData.get('treatmentAdministeredBy') || ''
      }] : [],
      vaccinesAdministered: formData.get('vaccineType') && formData.get('vaccineType') !== 'none' ? [{
        vaccine: formData.get('vaccineType'),
        batchNumber: formData.get('vaccineBatch') || '',
        administeredAt: formData.get('vaccineDate') ? new Date(formData.get('vaccineDate')) : new Date(),
        nextDueDate: formData.get('vaccineNextDue') ? new Date(formData.get('vaccineNextDue')) : undefined
      }] : [],
      followUpDate: formData.get('followUpDate') ? new Date(formData.get('followUpDate')) : undefined
    };

    try {
      if (editingRecord) {
        await healthRecordsApi.updateHealthRecord(editingRecord._id, data);
        toast({
          title: 'Success',
          description: 'Health record updated successfully'
        });
      } else {
        await healthRecordsApi.createHealthRecord(data);
        toast({
          title: 'Success',
          description: 'Health record created successfully'
        });
      }
      setIsDialogOpen(false);
      setEditingRecord(null);
      e.target.reset();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save record',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await healthRecordsApi.deleteHealthRecord(recordId);
      toast({
        title: 'Success',
        description: 'Record deleted successfully'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete record',
        variant: 'destructive'
      });
    }
  };

  const filteredRecords = records.filter(record =>
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.animal?.tagId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.herd?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingReminders = records
    .filter(r => r.vaccinesAdministered?.some(v => v.nextDueDate && new Date(v.nextDueDate) > new Date()))
    .map(r => ({
      id: r._id,
      type: 'vaccination',
      title: r.vaccinesAdministered?.[0]?.vaccine || 'Vaccination',
      dueDate: r.vaccinesAdministered?.[0]?.nextDueDate,
      animal: r.animal?.tagId || r.herd?.name || 'Unknown',
      priority: new Date(r.vaccinesAdministered?.[0]?.nextDueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium'
    }))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

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
            <h1 className="text-4xl md:text-5xl font-bold">Digital Health Records</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Manage your livestock's complete health history. Track vaccinations, treatments, 
              and medical records all in one secure digital platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Animals */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>My Animals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="mb-4">
                    <Label className="text-sm font-semibold mb-2 block">Filter by Herd</Label>
                    <Select value={selectedHerd} onValueChange={(val) => {
                      setSelectedHerd(val);
                      setSelectedAnimal('all');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All herds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All herds</SelectItem>
                        {herds.map(herd => (
                          <SelectItem key={herd._id} value={herd._id}>
                            {herd.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <Label className="text-sm font-semibold mb-2 block">Filter by Animal</Label>
                    <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                      <SelectTrigger>
                        <SelectValue placeholder="All animals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All animals</SelectItem>
                        {animals
                          .filter(a => selectedHerd === 'all' || a.herd?._id === selectedHerd || a.herd === selectedHerd)
                          .map(animal => (
                            <SelectItem key={animal._id} value={animal._id}>
                              {animal.tagId} ({animal.species})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {animals
                    .filter(a => selectedHerd === 'all' || a.herd?._id === selectedHerd || a.herd === selectedHerd)
                    .map((animal) => (
                      <div
                        key={animal._id}
                        onClick={() => setSelectedAnimal(animal._id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedAnimal === animal._id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <PawPrint className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-semibold">{animal.tagId}</p>
                            <p className="text-sm text-gray-600 capitalize">{animal.species} {animal.breed && `• ${animal.breed}`}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {animals.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No animals found. Add animals to herds first.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Reminders */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span>Upcoming Reminders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div key={reminder.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{reminder.title}</p>
                          <p className="text-xs text-gray-600">{reminder.animal}</p>
                          <p className="text-xs text-orange-600 mt-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Due: {reminder.dueDate}
                          </p>
                        </div>
                        <Badge variant={reminder.priority === 'high' ? 'destructive' : 'secondary'}>
                          {reminder.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Records */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                  <p className="text-red-500 text-xs mt-1">Please make sure you are logged in.</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search health records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs value={recordTypeFilter} onValueChange={setRecordTypeFilter} className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all">All Records</TabsTrigger>
                  <TabsTrigger value="vaccination">Vaccinations</TabsTrigger>
                  <TabsTrigger value="treatment">Treatments</TabsTrigger>
                  <TabsTrigger value="routine_check">Checkups</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading records...</div>
                  ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No health records found</div>
                  ) : (
                    filteredRecords.map((record) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="card-hover">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              {record.recordType === 'vaccination' && (
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Heart className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                              {record.recordType === 'treatment' && (
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <Stethoscope className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                              {(record.recordType === 'routine_check' || record.recordType === 'lab_result') && (
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {record.diagnosis || `${record.recordType.replace('_', ' ')} Record`}
                                </CardTitle>
                                <CardDescription>
                                  {record.animal ? `Animal: ${record.animal.tagId}` : record.herd ? `Herd: ${record.herd.name}` : 'General Record'}
                                  {record.vet?.user && ` • Vet: ${record.vet.user.name}`}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="capitalize">
                                {record.recordType.replace('_', ' ')}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRecord(record._id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {record.species}
                              </Badge>
                            </div>
                            {record.symptoms?.length > 0 && (
                              <div>
                                <Label className="text-xs font-semibold">Symptoms:</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {record.symptoms.map((symptom, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{symptom}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {record.treatmentPlan?.length > 0 && (
                              <div>
                                <Label className="text-xs font-semibold">Treatment:</Label>
                                <div className="text-sm text-gray-600 mt-1">
                                  {record.treatmentPlan.map((t, idx) => (
                                    <div key={idx}>
                                      {t.drug} - {t.dosage} ({t.frequency} for {t.durationDays} days)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {record.vaccinesAdministered?.length > 0 && (
                              <div>
                                <Label className="text-xs font-semibold">Vaccines:</Label>
                                <div className="text-sm text-gray-600 mt-1">
                                  {record.vaccinesAdministered.map((v, idx) => (
                                    <div key={idx}>
                                      {v.vaccine} {v.batchNumber && `(Batch: ${v.batchNumber})`}
                                      {v.nextDueDate && (
                                        <span className="text-orange-600 ml-2">
                                          Next due: {new Date(v.nextDueDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {record.followUpDate && (
                              <div className="flex items-center space-x-1 text-orange-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>Follow-up: {new Date(record.followUpDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="vaccination" className="space-y-4">
                  {filteredRecords.filter(r => r.recordType === 'vaccination').length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No vaccination records</div>
                  ) : (
                    filteredRecords.filter(r => r.recordType === 'vaccination').map(record => (
                      <Card key={record._id} className="card-hover">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {record.vaccinesAdministered?.[0]?.vaccine || 'Vaccination'}
                          </CardTitle>
                          <CardDescription>
                            {record.animal ? record.animal.tagId : record.herd?.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            Date: {new Date(record.createdAt).toLocaleDateString()}
                            {record.vaccinesAdministered?.[0]?.nextDueDate && (
                              <div className="text-orange-600 mt-1">
                                Next due: {new Date(record.vaccinesAdministered[0].nextDueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="treatment" className="space-y-4">
                  {filteredRecords.filter(r => r.recordType === 'treatment').length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No treatment records</div>
                  ) : (
                    filteredRecords.filter(r => r.recordType === 'treatment').map(record => (
                      <Card key={record._id} className="card-hover">
                        <CardHeader>
                          <CardTitle className="text-lg">{record.diagnosis || 'Treatment'}</CardTitle>
                          <CardDescription>
                            {record.animal ? record.animal.tagId : record.herd?.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            Date: {new Date(record.createdAt).toLocaleDateString()}
                            {record.treatmentPlan?.length > 0 && (
                              <div className="mt-2">
                                {record.treatmentPlan.map((t, idx) => (
                                  <div key={idx}>{t.drug} - {t.dosage}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="routine_check" className="space-y-4">
                  {filteredRecords.filter(r => r.recordType === 'routine_check').length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No checkup records</div>
                  ) : (
                    filteredRecords.filter(r => r.recordType === 'routine_check').map(record => (
                      <Card key={record._id} className="card-hover">
                        <CardHeader>
                          <CardTitle className="text-lg">Routine Check</CardTitle>
                          <CardDescription>
                            {record.animal ? record.animal.tagId : record.herd?.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            Date: {new Date(record.createdAt).toLocaleDateString()}
                            {record.diagnosis && <div className="mt-1">Notes: {record.diagnosis}</div>}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>

              {/* Add Record Button */}
              <div className="mt-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg" onClick={() => {
                      setEditingRecord(null);
                      setIsDialogOpen(true);
                    }}>
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Health Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingRecord ? 'Edit Health Record' : 'Add Health Record'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateRecord} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recordType">Record Type *</Label>
                          <input type="hidden" name="recordType" id="recordType" defaultValue={editingRecord?.recordType || 'treatment'} />
                          <Select defaultValue={editingRecord?.recordType || 'treatment'} onValueChange={(value) => {
                            document.getElementById('recordType').value = value;
                          }}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RECORD_TYPES.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="species">Species *</Label>
                          <input type="hidden" name="species" id="species" defaultValue={editingRecord?.species || ''} required />
                          <Select 
                            defaultValue={editingRecord?.species || undefined} 
                            onValueChange={(value) => {
                              const hiddenInput = document.getElementById('species');
                              if (hiddenInput) hiddenInput.value = value;
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select species" />
                            </SelectTrigger>
                            <SelectContent>
                              {LIVESTOCK_SPECIES.map(species => (
                                <SelectItem key={species} value={species}>
                                  {species.charAt(0).toUpperCase() + species.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="herd">Herd (Optional)</Label>
                          <input type="hidden" name="herd" id="herd" defaultValue={editingRecord?.herd?._id || editingRecord?.herd || 'none'} />
                          <Select defaultValue={editingRecord?.herd?._id || editingRecord?.herd || 'none'} onValueChange={(value) => {
                            const hiddenInput = document.getElementById('herd');
                            if (hiddenInput) hiddenInput.value = value === 'none' ? '' : value;
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select herd" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {herds.map(herd => (
                                <SelectItem key={herd._id} value={herd._id}>
                                  {herd.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="animal">Animal (Optional)</Label>
                          <input type="hidden" name="animal" id="animal" defaultValue={editingRecord?.animal?._id || editingRecord?.animal || 'none'} />
                          <Select defaultValue={editingRecord?.animal?._id || editingRecord?.animal || 'none'} onValueChange={(value) => {
                            const hiddenInput = document.getElementById('animal');
                            if (hiddenInput) hiddenInput.value = value === 'none' ? '' : value;
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select animal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {animals.map(animal => (
                                <SelectItem key={animal._id} value={animal._id}>
                                  {animal.tagId} ({animal.species})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="diagnosis">Diagnosis/Notes</Label>
                        <Textarea
                          id="diagnosis"
                          name="diagnosis"
                          defaultValue={editingRecord?.diagnosis}
                          placeholder="Enter diagnosis or notes..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
                        <Input
                          id="symptoms"
                          name="symptoms"
                          defaultValue={editingRecord?.symptoms?.join(', ')}
                          placeholder="e.g., fever, loss of appetite, coughing"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <Label className="text-sm font-semibold mb-2 block">Treatment Plan (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="treatmentDrug" className="text-xs">Drug Name</Label>
                            <Input id="treatmentDrug" name="treatmentDrug" placeholder="e.g., Antibiotic" />
                          </div>
                          <div>
                            <Label htmlFor="treatmentDosage" className="text-xs">Dosage</Label>
                            <Input id="treatmentDosage" name="treatmentDosage" placeholder="e.g., 10ml" />
                          </div>
                          <div>
                            <Label htmlFor="treatmentFrequency" className="text-xs">Frequency</Label>
                            <Input id="treatmentFrequency" name="treatmentFrequency" placeholder="e.g., Twice daily" />
                          </div>
                          <div>
                            <Label htmlFor="treatmentDuration" className="text-xs">Duration (days)</Label>
                            <Input id="treatmentDuration" name="treatmentDuration" type="number" placeholder="e.g., 7" />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="treatmentAdministeredBy" className="text-xs">Administered By</Label>
                            <Input id="treatmentAdministeredBy" name="treatmentAdministeredBy" placeholder="e.g., Dr. Smith" />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <Label className="text-sm font-semibold mb-2 block">Vaccination (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vaccineType" className="text-xs">Vaccine Type</Label>
                            <input type="hidden" name="vaccineType" id="vaccineType" defaultValue={editingRecord?.vaccinesAdministered?.[0]?.vaccine || ''} />
                            <Select defaultValue={editingRecord?.vaccinesAdministered?.[0]?.vaccine || ''} onValueChange={(value) => {
                              document.getElementById('vaccineType').value = value;
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select vaccine" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {VACCINE_TYPES.map(vaccine => (
                                  <SelectItem key={vaccine} value={vaccine}>
                                    {vaccine}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="vaccineBatch" className="text-xs">Batch Number</Label>
                            <Input id="vaccineBatch" name="vaccineBatch" defaultValue={editingRecord?.vaccinesAdministered?.[0]?.batchNumber} />
                          </div>
                          <div>
                            <Label htmlFor="vaccineDate" className="text-xs">Date Administered</Label>
                            <Input
                              id="vaccineDate"
                              name="vaccineDate"
                              type="date"
                              defaultValue={editingRecord?.vaccinesAdministered?.[0]?.administeredAt ? new Date(editingRecord.vaccinesAdministered[0].administeredAt).toISOString().split('T')[0] : ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="vaccineNextDue" className="text-xs">Next Due Date</Label>
                            <Input
                              id="vaccineNextDue"
                              name="vaccineNextDue"
                              type="date"
                              defaultValue={editingRecord?.vaccinesAdministered?.[0]?.nextDueDate ? new Date(editingRecord.vaccinesAdministered[0].nextDueDate).toISOString().split('T')[0] : ''}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
                        <Input
                          id="followUpDate"
                          name="followUpDate"
                          type="date"
                          defaultValue={editingRecord?.followUpDate ? new Date(editingRecord.followUpDate).toISOString().split('T')[0] : ''}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        {editingRecord ? 'Update Record' : 'Save Record'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthRecords;

