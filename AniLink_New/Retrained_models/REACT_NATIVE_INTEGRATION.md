# React Native Integration Guide - AniLink FMD Detection Models

## 📦 Package Contents

This package contains two ONNX models optimized for React Native mobile applications:

1. **`cattle_detection.onnx`** (0.24 MB)
   - Validates that images contain cattle
   - Test Accuracy: 93.11%
   - Validation Accuracy: 95.30%

2. **`fmd_detection.onnx`** (0.24 MB)
   - Classifies cattle health status (Healthy vs Infected)
   - Validation Accuracy: 97.47%

---

## 🚀 Installation

### Step 1: Install ONNX Runtime for React Native

```bash
npm install onnxruntime-react-native
# or
yarn add onnxruntime-react-native
```

### Step 2: Install Image Processing Library

```bash
npm install react-native-image-picker
npm install @react-native-community/image-editor
# or
yarn add react-native-image-picker @react-native-community/image-editor
```

### Step 3: Copy Model Files

Copy both `.onnx` files to your React Native project:

```
your-react-native-app/
├── assets/
│   ├── models/
│   │   ├── cattle_detection.onnx
│   │   └── fmd_detection.onnx
```

---

## 💻 Implementation

### Basic Setup

```javascript
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

// Model paths (adjust based on your asset structure)
const CATTLE_MODEL_PATH = require('./assets/models/cattle_detection.onnx');
const FMD_MODEL_PATH = require('./assets/models/fmd_detection.onnx');
```

### Image Preprocessing

```javascript
/**
 * Preprocess image for model input
 * @param {string} imageUri - URI of the image
 * @returns {Promise<Float32Array>} Preprocessed image tensor
 */
async function preprocessImage(imageUri) {
  // 1. Resize image to 224x224
  const resizedImage = await ImageResizer.createResizedImage(
    imageUri,
    224,
    224,
    'JPEG',
    100,
    0,
    undefined,
    false,
    { mode: 'contain', onlyScaleDown: false }
  );

  // 2. Load image as base64 or use image processing library
  // Convert to RGB array and normalize
  const imageData = await loadImageAsArray(resizedImage.uri);
  
  // 3. Normalize: (pixel / 255.0 - mean) / std
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  
  const normalized = new Float32Array(3 * 224 * 224);
  for (let i = 0; i < imageData.length; i++) {
    const channel = Math.floor(i / (224 * 224));
    normalized[i] = (imageData[i] / 255.0 - mean[channel]) / std[channel];
  }
  
  return normalized;
}

/**
 * Load image and convert to array
 * You may need to use react-native-image-to-base64 or similar
 */
async function loadImageAsArray(imageUri) {
  // Implementation depends on your image loading library
  // This is a placeholder - implement based on your needs
  const imageArray = new Float32Array(3 * 224 * 224);
  // ... load and convert image to RGB array
  return imageArray;
}
```

### Cattle Detection

```javascript
/**
 * Detect if image contains cattle
 * @param {string} imageUri - URI of the image
 * @returns {Promise<{isCattle: boolean, confidence: number, error?: string}>}
 */
async function detectCattle(imageUri) {
  try {
    // Load model
    const session = await InferenceSession.create(CATTLE_MODEL_PATH);
    
    // Preprocess image
    const inputTensor = await preprocessImage(imageUri);
    
    // Create input tensor [1, 3, 224, 224]
    const tensor = new Tensor('float32', inputTensor, [1, 3, 224, 224]);
    
    // Run inference
    const feeds = { input: tensor };
    const results = await session.run(feeds);
    const output = results.output.data;
    
    // Apply softmax to get probabilities
    const exp0 = Math.exp(output[0]);
    const exp1 = Math.exp(output[1]);
    const sum = exp0 + exp1;
    const cattleProb = exp0 / sum;
    const nonCattleProb = exp1 / sum;
    
    // Check if cattle with confidence threshold (LOWERED from 0.75 to 0.55)
    // 0.75 was too strict and rejected valid cattle images
    const confidenceThreshold = 0.55;  // More permissive threshold
    const isCattle = cattleProb > nonCattleProb && cattleProb >= confidenceThreshold;
    
    return {
      isCattle,
      confidence: cattleProb,
      probabilities: {
        cattle: cattleProb,
        nonCattle: nonCattleProb
      }
    };
    
  } catch (error) {
    return {
      isCattle: false,
      confidence: 0,
      error: error.message
    };
  }
}
```

### FMD Detection

```javascript
/**
 * Detect FMD status (only call if cattle is detected)
 * @param {string} imageUri - URI of the cattle image
 * @returns {Promise<{status: 'Healthy' | 'Infected', confidence: number}>}
 */
async function detectFMD(imageUri) {
  try {
    // Load model
    const session = await InferenceSession.create(FMD_MODEL_PATH);
    
    // Preprocess image (same as cattle detection)
    const inputTensor = await preprocessImage(imageUri);
    
    // Create input tensor
    const tensor = new Tensor('float32', inputTensor, [1, 3, 224, 224]);
    
    // Run inference
    const feeds = { input: tensor };
    const results = await session.run(feeds);
    const output = results.output.data;
    
    // Apply softmax
    const exp0 = Math.exp(output[0]);
    const exp1 = Math.exp(output[1]);
    const sum = exp0 + exp1;
    const healthyProb = exp0 / sum;
    const infectedProb = exp1 / sum;
    
    const status = infectedProb > healthyProb ? 'Infected' : 'Healthy';
    const confidence = Math.max(healthyProb, infectedProb);
    
    return {
      status,
      confidence,
      probabilities: {
        healthy: healthyProb,
        infected: infectedProb
      }
    };
    
  } catch (error) {
    return {
      status: 'Error',
      confidence: 0,
      error: error.message
    };
  }
}
```

### Complete Pipeline

```javascript
/**
 * Complete two-stage detection pipeline
 * @param {string} imageUri - URI of the uploaded image
 * @returns {Promise<Object>} Detection result
 */
async function detectFMDComplete(imageUri) {
  try {
    // Stage 1: Cattle Detection
    const cattleResult = await detectCattle(imageUri);
    
    if (!cattleResult.isCattle) {
      return {
        success: false,
        error: 'Image does not contain cattle. Please upload images of cattle focusing on muzzle, tongue, hooves, udder, or mouth.',
        cattleDetection: cattleResult
      };
    }
    
    // Stage 2: FMD Detection (only if cattle detected)
    const fmdResult = await detectFMD(imageUri);
    
    return {
      success: true,
      cattleDetection: cattleResult,
      fmdDetection: fmdResult,
      result: {
        status: fmdResult.status,
        confidence: fmdResult.confidence,
        message: fmdResult.status === 'Infected' 
          ? 'FMD symptoms detected. Please consult a veterinarian.'
          : 'Cattle appears healthy. Continue monitoring.'
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### React Component Example

```javascript
import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { detectFMDComplete } from './models/fmdDetection';

export default function FMDDetectionScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.assets && response.assets[0]) {
          setImageUri(response.assets[0].uri);
          setResult(null);
        }
      }
    );
  };

  const analyzeImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setLoading(true);
    try {
      const detectionResult = await detectFMDComplete(imageUri);
      setResult(detectionResult);
      
      if (!detectionResult.success) {
        Alert.alert('Detection Failed', detectionResult.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        AniLink FMD Detection
      </Text>

      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={{ width: 300, height: 300, marginBottom: 20 }}
        />
      )}

      <Button title="Pick Image" onPress={pickImage} />
      <Button 
        title={loading ? "Analyzing..." : "Analyze"} 
        onPress={analyzeImage}
        disabled={loading || !imageUri}
      />

      {loading && <ActivityIndicator size="large" />}

      {result && result.success && (
        <View style={{ marginTop: 20, padding: 15, backgroundColor: '#e8f5e9' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Status: {result.result.status}
          </Text>
          <Text>Confidence: {(result.result.confidence * 100).toFixed(1)}%</Text>
          <Text>{result.result.message}</Text>
        </View>
      )}

      {result && !result.success && (
        <View style={{ marginTop: 20, padding: 15, backgroundColor: '#ffebee' }}>
          <Text style={{ color: 'red' }}>{result.error}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## 📋 Model Specifications

### Input Requirements
- **Image Size:** 224x224 pixels
- **Color Format:** RGB (3 channels)
- **Data Type:** Float32
- **Normalization:**
  - Mean: [0.485, 0.456, 0.406]
  - Std: [0.229, 0.224, 0.225]
- **Input Shape:** [1, 3, 224, 224] (batch_size, channels, height, width)

### Output Format
- **Output Shape:** [1, 2]
- **Output Values:** Logits (apply softmax to get probabilities)
- **Class 0:** Cattle / Healthy
- **Class 1:** Non-Cattle / Infected

### Model Details
- **Architecture:** MobileNetV2
- **Opset Version:** 18 (backward compatible with 12+)
- **Size:** ~0.24 MB per model
- **Optimized for:** Mobile devices

---

## ⚠️ Important Notes

1. **Always run Cattle Detection FIRST** before FMD Detection
2. **Reject non-cattle images** with the provided error message
3. **Image preprocessing is critical** - must match specifications exactly
4. **Use confidence threshold** - recommend 0.55 for cattle detection (0.75 was too strict)
5. **Handle errors gracefully** - models may fail on corrupted images

---

## 🔧 Troubleshooting

### Model Loading Issues
- Ensure model files are in the correct path
- Check file permissions
- Verify ONNX Runtime is properly installed

### Performance Issues
- Models are optimized for mobile but may be slow on older devices
- Consider running inference on a background thread
- Cache model sessions if processing multiple images

### Image Preprocessing Issues
- Ensure images are properly resized to 224x224
- Verify normalization values are correct
- Check that image format is RGB (not RGBA)

---

## 📚 Additional Resources

- ONNX Runtime React Native: https://onnxruntime.ai/docs/tutorials/mobile/
- React Native Image Picker: https://github.com/react-native-image-picker/react-native-image-picker
- Model Performance: See README.md for detailed metrics

---

## ✅ Testing Checklist

- [ ] Models load successfully
- [ ] Image preprocessing works correctly
- [ ] Cattle detection rejects non-cattle images
- [ ] Cattle detection accepts cattle images
- [ ] FMD detection works on cattle images
- [ ] Error handling works properly
- [ ] UI displays results correctly

---

**Package Version:** v2.0 (Improved Cattle Detection)
**Last Updated:** February 3, 2026
**Compatible with:** React Native 0.60+
