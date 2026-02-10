# AniLink FMD Detection Models - React Native Package

## Overview

This package contains two trained deep learning models for the AniLink FMD (Foot-and-Mouth Disease) Detection System, optimized for React Native mobile applications:

1. **Cattle Detection Model** - Validates that images contain cattle
2. **FMD Detection Model** - Classifies cattle health status (Healthy/Infected)

## Model Files

### Cattle Detection Model
- `cattle_detection.onnx` - ONNX format (React Native optimized, opset 18)
- **Size:** 0.24 MB
- **Format:** ONNX (compatible with onnxruntime-react-native)

### FMD Detection Model
- `fmd_detection.onnx` - ONNX format (React Native optimized, opset 18)
- **Size:** 0.24 MB
- **Format:** ONNX (compatible with onnxruntime-react-native)

### Documentation
- `README.md` - This file (general integration guide)
- [REACT_NATIVE_INTEGRATION.md](../docs/REACT_NATIVE_INTEGRATION.md) - Complete React Native integration guide with code examples

## Model Specifications

### Input Requirements
- **Image Size**: 224x224 pixels
- **Color Format**: RGB (3 channels)
- **Data Type**: Float32
- **Normalization**: 
  - Mean: [0.485, 0.456, 0.406]
  - Std: [0.229, 0.224, 0.225]
- **Input Shape**: [1, 3, 224, 224] (batch_size, channels, height, width)

### Output Format
- **Output Shape**: [1, 2] (batch_size, num_classes)
- **Output Values**: Logits (raw scores before softmax)
- **Class 0**: First class (Cattle/Healthy)
- **Class 1**: Second class (Non-Cattle/Infected)

### Model Architecture
- **Base Model**: MobileNetV2
- **Parameters**: ~3.4M
- **Model Size**: ~9 MB per model
- **Optimized for**: Mobile devices (Android/iOS)

## Model Performance

### Cattle Detection Model (IMPROVED v2.0)
- **Validation Accuracy**: 95.30%
- **Test Accuracy**: 93.11%
- **Precision**: 93.20%
- **Recall**: 93.11%
- **F1-Score**: 93.10%
- **Purpose**: Binary classification (Cattle vs Non-Cattle)
- **Improvements**: Better discrimination, reduced false positives (dogs/pigs rejection)

### FMD Detection Model
- **Validation Accuracy**: 97.47%
- **Purpose**: Binary classification (Healthy vs Infected)

## Usage Pipeline

The models must be used in a two-stage pipeline:

```
Image Input
    |
    v
[Cattle Detection] --> Is Cattle?
    |                    |
    |                    v
    |              [FMD Detection] --> Result (Healthy/Infected)
    |                    |
    v                    v
  Reject            Return Status
```

### Step 1: Cattle Detection
1. Preprocess image (resize to 224x224, normalize)
2. Run through cattle detection model
3. Check output: Class 0 = Cattle, Class 1 = Non-Cattle
4. If Class 0 probability > 0.75, proceed to Step 2
5. Otherwise, reject with error: "Image does not contain cattle"

### Step 2: FMD Detection (only if cattle detected)
1. Use the same preprocessed image
2. Run through FMD detection model
3. Check output: Class 0 = Healthy, Class 1 = Infected
4. Return result with confidence score

## Image Preprocessing

All models require the same preprocessing:

```python
import numpy as np
from PIL import Image

def preprocess_image(image_path):
    # Load and resize image
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    
    # Convert to numpy array
    img_array = np.array(img).astype(np.float32) / 255.0
    
    # Normalize
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_array = (img_array - mean) / std
    
    # Change from HWC to CHW format
    img_array = np.transpose(img_array, (2, 0, 1))
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array
```

## Integration Examples

### Android (TensorFlow Lite)

```kotlin
// Load model
val interpreter = Interpreter(loadModelFile("cattle_detection.tflite"))

// Preprocess image
val inputBuffer = preprocessImage(bitmap)

// Run inference
val outputBuffer = ByteBuffer.allocateDirect(2 * 4) // 2 classes * 4 bytes (float)
interpreter.run(inputBuffer, outputBuffer)

// Get results
val probabilities = FloatArray(2)
outputBuffer.rewind()
outputBuffer.asFloatBuffer().get(probabilities)

// Check if cattle (Class 0)
val isCattle = probabilities[0] > probabilities[1] && probabilities[0] > 0.75
```

### iOS (Core ML - Convert from ONNX)

```swift
// Convert ONNX to Core ML first using coremltools
// Then use in iOS:

let model = try VNCoreMLModel(for: CattleDetection().model)
let request = VNCoreMLRequest(model: model) { request, error in
    // Handle results
}
```

### Python (ONNX Runtime)

```python
import onnxruntime as ort
import numpy as np

# Load model
session = ort.InferenceSession("cattle_detection.onnx")

# Preprocess
input_data = preprocess_image("image.jpg")

# Run inference
outputs = session.run(None, {"input": input_data})
probabilities = outputs[0][0]

# Get result
is_cattle = probabilities[0] > probabilities[1] and probabilities[0] > 0.75
```

## File Formats

### ONNX (.onnx)
- **Best for**: Cross-platform deployment
- **Supported by**: ONNX Runtime, TensorFlow, PyTorch, Core ML
- **Use when**: Need maximum compatibility

### TensorFlow Lite (.tflite)
- **Best for**: Android and iOS native apps
- **Supported by**: TensorFlow Lite, Android ML Kit
- **Use when**: Building native mobile apps
- **Advantages**: Smaller size, faster inference, optimized for mobile

## Important Notes

1. **Always run cattle detection first** - FMD detection should only run on confirmed cattle images
2. **Use confidence threshold of 0.75** for cattle detection to reduce false positives
3. **Images should focus on**: muzzle, tongue, hooves, udder, or mouth
4. **Model expects RGB images** - Convert grayscale to RGB if needed
5. **Normalization is critical** - Use exact mean/std values specified

## Web Deployment (ONNX Runtime Web)

For browser-based inference (e.g. anilink-web), models **must be self-contained**—all weights embedded in a single `.onnx` file. External data files (`.onnx.data`) are not supported in the browser.

### Option A: Convert existing models (if you have .onnx.data)

```bash
python scripts/convert-onnx-to-embedded.py
```

### Option B: Re-export from PyTorch checkpoints

Run from the **project root** (`D:\ANILINK`), not from `anilink-web` or `scripts`:

```bash
cd D:\ANILINK

pip install -r scripts/requirements-export.txt

# Export cattle model (place your .pth in checkpoints/ or pass path)
python scripts/export_onnx_embedded.py cattle path/to/cattle_detection.pth --web

# Export FMD model
python scripts/export_onnx_embedded.py fmd path/to/fmd_detection.pth --web

# Export both
python scripts/export_onnx_embedded.py all --cattle-checkpoint path/to/cattle.pth --fmd-checkpoint path/to/fmd.pth --web
```

The export script uses MobileNetV2 with a 2-class head. If your trained model has a different architecture, update `scripts/export_onnx_embedded.py` to match your training code.

## Troubleshooting

### Model not loading
- Verify file paths are correct
- Check file sizes (~9 MB each)
- Ensure proper format (.onnx or .tflite)

### Poor predictions
- Verify image preprocessing matches specifications
- Check normalization values
- Ensure image is 224x224 RGB

### Performance issues
- Use TensorFlow Lite for best mobile performance
- Consider model quantization for smaller size
- Use GPU acceleration if available

## Model Versions

- **Version**: 1.0
- **Training Date**: 2025
- **Framework**: PyTorch (MobileNetV2)
- **Export Date**: Generated on export

## Support

For integration questions or issues:
- Review the preprocessing code examples
- Check model metadata JSON files
- Verify input/output shapes match specifications

## License

These models are part of the AniLink FMD Detection System.

---

**Generated by AniLink Model Export Script**
