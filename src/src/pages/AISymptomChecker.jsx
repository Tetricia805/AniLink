import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Stethoscope,
  ArrowRight,
  Info,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as aiApi from '@/api/ai';

const LIVESTOCK_SPECIES = [
  'cattle', 'goats', 'sheep', 'poultry', 'swine', 'rabbits', 'fish', 'camels'
];

const AISymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [symptomList, setSymptomList] = useState([]);
  const [species, setSpecies] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [environment, setEnvironment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const { toast } = useToast();

  const commonSymptoms = [
    'Loss of appetite',
    'Lethargy',
    'Vomiting',
    'Diarrhea',
    'Coughing',
    'Sneezing',
    'Fever',
    'Difficulty breathing',
    'Excessive thirst',
    'Weight loss',
    'Limping',
    'Skin irritation'
  ];

  const handleAnalyze = async () => {
    const symptomsArray = symptomList.length > 0 
      ? symptomList 
      : symptoms.split(',').map(s => s.trim()).filter(Boolean);

    if (symptomsArray.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please provide at least one symptom.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const data = {
        symptoms: symptomsArray,
        ...(species && { species }),
        ...(durationHours && { durationHours: parseInt(durationHours) }),
        ...(environment && { environment })
      };

      const response = await aiApi.symptomCheck(data);
      
      if (response.status === 'success') {
        const aiResponse = response.data;
        setResults({
          diagnosis: aiResponse.diagnosis,
          riskLevel: aiResponse.riskLevel,
          confidence: aiResponse.confidence,
          recommendations: aiResponse.recommendations || [],
          triage: aiResponse.triage,
          urgency: aiResponse.riskLevel === 'critical' ? 'high' : 
                   aiResponse.riskLevel === 'high' ? 'high' :
                   aiResponse.riskLevel === 'medium' ? 'medium' : 'low',
          shouldSeeVet: aiResponse.riskLevel === 'critical' || aiResponse.riskLevel === 'high'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to analyze symptoms',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSymptom = (symptom) => {
    if (!symptomList.includes(symptom)) {
      setSymptomList(prev => [...prev, symptom]);
    }
  };

  const removeSymptom = (symptom) => {
    setSymptomList(prev => prev.filter(s => s !== symptom));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <Brain className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">AI Symptom Checker</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get instant AI-powered insights about your animal's health. 
              Enter symptoms and receive preliminary analysis and recommendations.
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Info className="h-5 w-5" />
              <span className="text-sm opacity-90">
                This is a preliminary assessment. Always consult a veterinarian for professional diagnosis.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5 text-purple-600" />
                    <span>Enter Symptoms</span>
                  </CardTitle>
                  <CardDescription>
                    Describe your animal's symptoms in detail
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="species">Livestock Species (Optional)</Label>
                    <Select value={species} onValueChange={setSpecies}>
                      <SelectTrigger id="species">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIVESTOCK_SPECIES.map(s => (
                          <SelectItem key={s} value={s}>
                            <span className="capitalize">{s}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="durationHours">Duration (Hours) - Optional</Label>
                    <Input
                      id="durationHours"
                      type="number"
                      placeholder="How long have symptoms been present?"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="symptoms">Symptoms (comma-separated or use quick add below)</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Enter symptoms separated by commas, e.g., fever, cough, loss of appetite"
                      rows={4}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can also use the quick add buttons below or type symptoms separated by commas
                    </p>
                  </div>

                  {symptomList.length > 0 && (
                    <div>
                      <Label>Selected Symptoms</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {symptomList.map((symptom, idx) => (
                          <Badge
                            key={idx}
                            variant="default"
                            className="cursor-pointer"
                            onClick={() => removeSymptom(symptom)}
                          >
                            {symptom} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common Symptoms */}
                  <div>
                    <Label>Quick Add Common Symptoms</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonSymptoms.map((symptom) => (
                        <Badge
                          key={symptom}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-50"
                          onClick={() => addSymptom(symptom)}
                        >
                          + {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Analyzing Symptoms...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Analyze Symptoms
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
                    <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Enter symptoms and click "Analyze Symptoms" to get AI-powered insights
                    </p>
                  </CardContent>
                </Card>
              )}

              {isAnalyzing && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 font-medium">AI is analyzing symptoms...</p>
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
                  {/* Urgency Alert */}
                  <Card className={results.urgency === 'high' ? 'border-red-500 bg-red-50' : 
                                   results.urgency === 'medium' ? 'border-orange-500 bg-orange-50' : 
                                   'border-blue-500 bg-blue-50'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        {results.urgency === 'high' ? (
                          <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                        ) : (
                          <Info className="h-6 w-6 text-blue-600 mt-1" />
                        )}
                        <div>
                          <h3 className="font-semibold mb-1">
                            {results.urgency === 'high' ? 'High Priority' : 
                             results.urgency === 'medium' ? 'Medium Priority' : 
                             'Low Priority'}
                          </h3>
                          <p className="text-sm">
                            {results.shouldSeeVet 
                              ? 'We recommend consulting a veterinarian as soon as possible.'
                              : 'Monitor the situation and consult a vet if symptoms persist.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diagnosis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Diagnosis</CardTitle>
                      <CardDescription>
                        Based on analysis of the symptoms provided
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{results.diagnosis}</h4>
                          <Badge variant="outline">
                            {Math.round(results.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Badge 
                            variant={
                              results.riskLevel === 'critical' ? 'destructive' : 
                              results.riskLevel === 'high' ? 'destructive' :
                              results.riskLevel === 'medium' ? 'default' : 'secondary'
                            }
                          >
                            {results.riskLevel} risk
                          </Badge>
                          {results.triage && (
                            <Badge variant="outline" className="ml-2">
                              {results.triage} triage
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <span>Recommendations</span>
                      </CardTitle>
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

                  {/* Action Button */}
                  <div className="space-y-2">
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                      variant={results.shouldSeeVet ? 'default' : 'outline'}
                    >
                      <a href="/vets">
                        Find a Veterinarian
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </a>
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setResults(null);
                        setSymptoms('');
                        setSymptomList([]);
                        setSpecies('');
                        setDurationHours('');
                        setEnvironment('');
                      }}
                    >
                      Check Another Animal
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

export default AISymptomChecker;

