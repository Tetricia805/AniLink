import { AIInteraction } from '../models/AIInteraction.js';
import { AI_REQUEST_TYPES, RISK_LEVELS } from '../constants/enums.js';

const symptomRules = [
  {
    keywords: ['fever', 'cough', 'nasal', 'discharge'],
    probable: 'Contagious Bovine Pleuropneumonia',
    risk: 'high',
    advice: 'Isolate affected animals and contact a vet for antibiotics.'
  },
  {
    keywords: ['diarrhea', 'dehydration', 'weakness'],
    probable: 'Enteritis or worm infestation',
    risk: 'medium',
    advice: 'Provide oral rehydration salts and deworm as advised by a vet.'
  },
  {
    keywords: ['swollen', 'udder', 'milk', 'flakes'],
    probable: 'Mastitis',
    risk: 'medium',
    advice: 'Strip affected quarter and seek vet attention for antibiotics.'
  },
  {
    keywords: ['lameness', 'saliva', 'blisters', 'mouth', 'hooves'],
    probable: 'Foot and Mouth Disease',
    risk: 'critical',
    advice: 'Notify veterinary authorities immediately and restrict movement.'
  }
];

const fmdRiskRules = [
  {
    risk: 'low',
    criteria: ({ neighboringOutbreaks, symptomsCount }) =>
      neighboringOutbreaks === 0 && symptomsCount === 0
  },
  {
    risk: 'medium',
    criteria: ({ neighboringOutbreaks, symptomsCount }) =>
      neighboringOutbreaks <= 1 && symptomsCount <= 1
  },
  {
    risk: 'high',
    criteria: ({ neighboringOutbreaks, symptomsCount }) =>
      neighboringOutbreaks >= 2 || symptomsCount >= 2
  },
  {
    risk: 'critical',
    criteria: ({ confirmedDistrictOutbreak, symptomsCount }) =>
      confirmedDistrictOutbreak && symptomsCount >= 2
  }
];

const matchRule = (symptoms, rules) => {
  const text = symptoms.join(' ').toLowerCase();
  let bestRule = null;
  let matches = 0;
  rules.forEach((rule) => {
    const hits = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (hits > matches) {
      matches = hits;
      bestRule = rule;
    }
  });
  return bestRule;
};

const saveInteraction = async (payload) => {
  await AIInteraction.create(payload);
};

export const symptomCheck = async (req, res) => {
  try {
    const { species, symptoms = [], durationHours, environment } = req.body;
    if (!symptoms.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide at least one symptom'
      });
    }

    const rule = matchRule(symptoms, symptomRules);
    const diagnosis = rule
      ? rule.probable
      : `${species || 'Livestock'} condition requires further evaluation`;
    const riskLevel = rule ? rule.risk : 'medium';
    const recommendations = [
      rule?.advice || 'Monitor vitals and consult a veterinarian if worsens.',
      'Maintain hygiene and isolate affected animals when possible.'
    ];

    const response = {
      diagnosis,
      riskLevel,
      confidence: rule ? 0.8 : 0.4,
      recommendations,
      triage: riskLevel === 'critical' ? 'urgent' : 'standard'
    };

    await saveInteraction({
      user: req.user?._id,
      type: AI_REQUEST_TYPES.SYMPTOM_CHECK,
      input: { species, symptoms, durationHours, environment },
      output: response,
      confidence: response.confidence,
      recommendations,
      metadata: { ruleMatched: rule?.keywords }
    });

    return res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const fmdRiskCheck = async (req, res) => {
  try {
    const {
      district,
      herdSize,
      symptoms = [],
      neighboringOutbreaks = 0,
      confirmedDistrictOutbreak = false
    } = req.body;

    const params = {
      neighboringOutbreaks,
      confirmedDistrictOutbreak,
      symptomsCount: symptoms.length
    };

    let risk = 'low';
    for (const rule of fmdRiskRules) {
      if (rule.criteria(params)) {
        risk = rule.risk;
      }
    }

    const recommendations = [];
    if (risk === 'low') {
      recommendations.push(
        'Continue surveillance and maintain standard biosecurity.'
      );
    } else if (risk === 'medium') {
      recommendations.push(
        'Limit animal movement and monitor temperature twice daily.'
      );
    } else if (risk === 'high') {
      recommendations.push(
        'Notify veterinary officers, enhance disinfection, restrict visitors.'
      );
    } else if (risk === 'critical') {
      recommendations.push(
        'Immediate notification to authorities, stop all movement, prepare for quarantine.'
      );
    }

    const response = {
      district,
      riskLevel: risk,
      riskScore: ['low', 'medium', 'high', 'critical'].indexOf(risk) + 1,
      herdImpact: herdSize ? herdSize * 0.8 : null,
      recommendations
    };

    await saveInteraction({
      user: req.user?._id,
      type: AI_REQUEST_TYPES.FMD_RISK,
      input: req.body,
      output: response,
      confidence: 0.6,
      recommendations,
      metadata: {
        district,
        neighboringOutbreaks,
        confirmedDistrictOutbreak
      }
    });

    return res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

