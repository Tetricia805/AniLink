import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Beef,
  AlertCircle,
  Info,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as aiApi from '@/api/ai';

const UGANDA_DISTRICTS = [
  'Kampala', 'Wakiso', 'Mukono', 'Jinja', 'Gulu', 'Mbarara', 
  'Fort Portal', 'Arua', 'Lira', 'Masaka'
];

const FMDChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [district, setDistrict] = useState('');
  const [herdSize, setHerdSize] = useState('');
  const [neighboringOutbreaks, setNeighboringOutbreaks] = useState('0');
  const [confirmedDistrictOutbreak, setConfirmedDistrictOutbreak] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const { toast } = useToast();

  const fmdSymptoms = [
    {
      id: 'mouth-blisters',
      label: 'Mouth blisters or sores',
      severity: 'high',
      description: 'Blisters on tongue, gums, or inside of mouth'
    },
    {
      id: 'drooling',
      label: 'Excessive drooling',
      severity: 'high',
      description: 'Unusual amount of saliva production'
    },
    {
      id: 'hoof-lesions',
      label: 'Hoof lesions or blisters',
      severity: 'high',
      description: 'Blisters on hooves, between toes, or coronary band'
    },
    {
      id: 'lameness',
      label: 'Sudden lameness',
      severity: 'high',
      description: 'Difficulty walking or standing'
    },
    {
      id: 'loss-appetite',
      label: 'Loss of appetite',
      severity: 'medium',
      description: 'Reduced or complete refusal to eat'
    },
    {
      id: 'fever',
      label: 'Fever',
      severity: 'medium',
      description: 'Elevated body temperature'
    },
    {
      id: 'reduced-milk',
      label: 'Reduced milk production',
      severity: 'medium',
      description: 'Significant drop in milk yield (for dairy cattle)'
    },
    {
      id: 'blisters-teats',
      label: 'Blisters on teats',
      severity: 'high',
      description: 'Blisters or sores on udder teats'
    },
    {
      id: 'depression',
      label: 'Depression or lethargy',
      severity: 'medium',
      description: 'Animal appears listless or unresponsive'
    }
  ];

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleAnalyze = async () => {
    if (!district) {
      toast({
        title: 'Missing Information',
        description: 'Please select your district.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const symptomLabels = selectedSymptoms.map(id => {
        const symptom = fmdSymptoms.find(s => s.id === id);
        return symptom?.label || id;
      });

      const data = {
        district,
        ...(herdSize && { herdSize: parseInt(herdSize) }),
        ...(neighboringOutbreaks && { neighboringOutbreaks: parseInt(neighboringOutbreaks) }),
        confirmedDistrictOutbreak,
        ...(symptomLabels.length > 0 && { symptoms: symptomLabels })
      };

      const response = await aiApi.fmdRiskCheck(data);
      
      if (response.status === 'success') {
        const aiResponse = response.data;
        setResults({
          riskLevel: aiResponse.riskLevel,
          riskScore: aiResponse.riskScore,
          herdImpact: aiResponse.herdImpact,
          recommendations: aiResponse.recommendations || [],
          selectedSymptoms: selectedSymptoms.map(id => {
            const symptom = fmdSymptoms.find(s => s.id === id);
            return symptom;
          }),
          shouldReport: aiResponse.riskLevel === 'high' || aiResponse.riskLevel === 'critical',
          emergencyContacts: [
            { name: 'District Veterinary Office', phone: '+256 700 VET HELP' },
            { name: 'Emergency Hotline', phone: '+256 800 FMD HELP' }
          ]
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to analyze FMD risk',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <Beef className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">FMD Sign Checker</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Specialized AI tool for detecting Foot-and-Mouth Disease (FMD) signs in cattle. 
              Early detection helps prevent outbreaks and protect your herd.
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4 bg-white/10 rounded-lg p-3 max-w-2xl mx-auto">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm opacity-90">
                FMD is a highly contagious disease. If you suspect FMD, contact veterinary authorities immediately.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Symptom Selection */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    <span>Select Observed Symptoms</span>
                  </CardTitle>
                  <CardDescription>
                    Check all symptoms you have observed in your cattle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Select value={district} onValueChange={setDistrict} required>
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Select your district" />
                      </SelectTrigger>
                      <SelectContent>
                        {UGANDA_DISTRICTS.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="herdSize">Herd Size (Optional)</Label>
                      <Input
                        id="herdSize"
                        type="number"
                        placeholder="Number of animals"
                        value={herdSize}
                        onChange={(e) => setHerdSize(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighboringOutbreaks">Neighboring Outbreaks (Optional)</Label>
                      <Input
                        id="neighboringOutbreaks"
                        type="number"
                        placeholder="Number of outbreaks"
                        value={neighboringOutbreaks}
                        onChange={(e) => setNeighboringOutbreaks(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="confirmedOutbreak"
                      checked={confirmedDistrictOutbreak}
                      onCheckedChange={setConfirmedDistrictOutbreak}
                    />
                    <Label htmlFor="confirmedOutbreak" className="cursor-pointer">
                      Confirmed district outbreak reported
                    </Label>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="mb-4 block">Select Observed Symptoms</Label>
                    {fmdSymptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedSymptoms.includes(symptom.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                      onClick={() => handleSymptomToggle(symptom.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedSymptoms.includes(symptom.id)}
                          onCheckedChange={() => handleSymptomToggle(symptom.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="font-semibold cursor-pointer">
                              {symptom.label}
                            </Label>
                            <Badge 
                              variant={symptom.severity === 'high' ? 'destructive' : 'default'}
                              className="text-xs"
                            >
                              {symptom.severity} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{symptom.description}</p>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional observations, timeline of symptoms, number of affected animals..."
                      rows={4}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !district}
                    className="w-full"
                    size="lg"
                    variant="destructive"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing FMD Signs...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Check for FMD Signs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div>
              {!results && !isAnalyzing && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Beef className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select the symptoms you've observed and click "Check for FMD Signs"
                    </p>
                  </CardContent>
                </Card>
              )}

              {isAnalyzing && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-16 w-16 text-red-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 font-medium">Analyzing FMD signs...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </CardContent>
                </Card>
              )}

              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Risk Assessment */}
                  <Card className={results.riskLevel === 'high' ? 'border-red-500 bg-red-50' : 
                                   results.riskLevel === 'medium' ? 'border-orange-500 bg-orange-50' : 
                                   'border-blue-500 bg-blue-50'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        {results.riskLevel === 'high' ? (
                          <AlertTriangle className="h-8 w-8 text-red-600 mt-1" />
                        ) : (
                          <AlertCircle className="h-8 w-8 text-orange-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {results.riskLevel === 'critical' ? 'CRITICAL RISK - IMMEDIATE ACTION REQUIRED' :
                             results.riskLevel === 'high' ? 'HIGH RISK - IMMEDIATE ACTION REQUIRED' : 
                             results.riskLevel === 'medium' ? 'MEDIUM RISK - VETERINARY CONSULTATION NEEDED' : 
                             'LOW RISK - MONITOR CLOSELY'}
                          </h3>
                          <p className="text-sm mb-3">
                            Risk Score: <span className="font-bold">{results.riskScore}/4</span>
                            {results.herdImpact && (
                              <span className="ml-4">
                                Potential Impact: <span className="font-bold">{Math.round(results.herdImpact)} animals</span>
                              </span>
                            )}
                          </p>
                          <p className="text-sm">
                            {results.riskLevel === 'critical' || results.riskLevel === 'high'
                              ? 'High FMD risk detected. This requires immediate veterinary attention and reporting.'
                              : results.riskLevel === 'medium'
                              ? 'Some FMD risk factors present. Professional diagnosis recommended.'
                              : 'Low risk level. Continue monitoring and maintain biosecurity.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Symptoms Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Selected Symptoms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.selectedSymptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{symptom.label}</span>
                            <Badge variant={symptom.severity === 'high' ? 'destructive' : 'default'}>
                              {symptom.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Emergency Contacts */}
                  {results.shouldReport && (
                    <Card className="border-red-500 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-red-700">Emergency Contacts</CardTitle>
                        <CardDescription className="text-red-600">
                          Report suspected FMD cases immediately
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {results.emergencyContacts.map((contact, index) => (
                          <div key={index} className="p-3 bg-white rounded border border-red-200">
                            <p className="font-semibold text-sm">{contact.name}</p>
                            <p className="text-red-600 font-mono">{contact.phone}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {results.shouldReport && (
                      <Button
                        className="w-full"
                        size="lg"
                        variant="destructive"
                        asChild
                      >
                        <a href="/vets">
                          Find Emergency Veterinarian
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </a>
                      </Button>
                    )}
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setResults(null);
                        setSelectedSymptoms([]);
                        setAdditionalNotes('');
                        setDistrict('');
                        setHerdSize('');
                        setNeighboringOutbreaks('0');
                        setConfirmedDistrictOutbreak(false);
                      }}
                    >
                      Check Another Herd
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FMDChecker;

