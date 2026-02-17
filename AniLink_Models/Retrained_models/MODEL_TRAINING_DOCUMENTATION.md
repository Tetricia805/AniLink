# AniLink Model Training Documentation
## Complete Technical Guide: From Data Collection to Model Deployment

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Model Architecture](#model-architecture)
3. [Dataset Collection and Preparation](#dataset-collection-and-preparation)
4. [Data Preprocessing and Augmentation](#data-preprocessing-and-augmentation)
5. [Training Procedures](#training-procedures)
6. [Evaluation Methods](#evaluation-methods)
7. [Model Performance](#model-performance)
8. [Model Export and Deployment](#model-export-and-deployment)
9. [Training History and Iterations](#training-history-and-iterations)
10. [Technical Specifications](#technical-specifications)

---

## Project Overview

**AniLink** is an AI-powered health intelligence platform for veterinary services, specifically designed to detect Foot-and-Mouth Disease (FMD) in cattle using smartphone cameras. The system uses a two-stage prediction pipeline:

1. **Cattle Detection Model (Gatekeeper)**: Validates that images contain cattle before FMD analysis
2. **FMD Detection Model**: Classifies cattle health status (Healthy vs Infected with FMD)

Both models are optimized for mobile deployment, using lightweight architectures suitable for smartphone inference.

---

## Model Architecture

### Base Architecture: MobileNetV2

Both models use **MobileNetV2** as the base architecture, chosen for its balance between accuracy and mobile efficiency:

- **Model Size**: ~9 MB (PyTorch) / ~0.24 MB (ONNX)
- **Parameters**: ~3.4 million
- **Pre-trained**: Yes, on ImageNet
- **Input Size**: 224×224 pixels (RGB)
- **Output**: 2 classes (binary classification)

### Architecture Details

```
MobileNetV2 (Pre-trained on ImageNet)
    ↓
Feature Extractor (1280 features)
    ↓
Classifier: Linear(1280 → 2)
    ↓
Output: [Class 0 probability, Class 1 probability]
```

### Why MobileNetV2?

1. **Mobile Optimization**: Designed specifically for mobile devices
2. **Efficiency**: Low computational requirements, fast inference
3. **Accuracy**: Strong performance despite small size
4. **Transfer Learning**: Pre-trained weights accelerate training

---

## Dataset Collection and Preparation

### Cattle Detection Model Dataset

#### Data Sources

1. **Primary Cattle Images**
   - Collected from various sources including:
     - Healthy cattle images
     - Cattle in different poses and environments
     - Various breeds and ages

2. **FMD Dataset Integration** (Added in retraining)
   - **4,426 FMD images** integrated into cattle class
   - **2,169 healthy cattle** images from FMD dataset
   - **2,257 infected cattle** images from FMD dataset
   - Includes cattle with:
     - Wounds on tongue
     - Wounds on hooves
     - Wounds on udder
     - Wounds on muzzle
     - Open mouths (common in FMD cases)

3. **Non-Cattle Images**
   - Dogs (with open mouths - challenging cases)
   - Pigs (with open mouths - challenging cases)
   - Other animals
   - 550+ non-cattle images collected to reduce false positives

#### Dataset Organization

The dataset is organized into two classes:
- **Class 0: Cattle** - All cattle images (healthy and sick)
- **Class 1: Non-Cattle** - All non-cattle images

#### Dataset Splits

- **Training Set**: 70% of data
- **Validation Set**: 15% of data
- **Test Set**: 15% of data

**Note**: Exact counts vary, but the split maintains class balance across all sets.

### FMD Detection Model Dataset

#### Data Structure

The FMD dataset is organized as:
- **Class 0: Healthy Cattle**
- **Class 1: Infected Cattle** (with FMD symptoms)

#### Dataset Location

- **Train Data**: `C:\Users\USER\Desktop\fmd_classification_data\Train data`
- **Validation Data**: `C:\Users\USER\Desktop\fmd_classification_data\Validation data`
- **Test Data**: `C:\Users\USER\Desktop\fmd_classification_data\Test_Data`

#### Data Characteristics

- Images contain cattle with various FMD symptoms
- Multiple image formats: JPG, JPEG, PNG
- Various image sizes (resized to 224×224 during preprocessing)
- Balanced distribution between healthy and infected classes

---

## Data Preprocessing and Augmentation

### Image Preprocessing

All images are preprocessed to meet model requirements:

1. **Resize**: All images resized to 224×224 pixels
2. **Color Format**: Converted to RGB (3 channels)
3. **Normalization**: Applied ImageNet normalization:
   - Mean: [0.485, 0.456, 0.406]
   - Std: [0.229, 0.224, 0.225]

### Data Augmentation (Training Set Only)

To improve model generalization and prevent overfitting, the following augmentations are applied to training images:

1. **Random Horizontal Flip** (p=0.5)
   - Flips images horizontally with 50% probability
   - Helps model learn orientation-invariant features

2. **Random Rotation** (degrees=15)
   - Rotates images by up to ±15 degrees
   - Handles slight camera angle variations

3. **Color Jitter**
   - Brightness: ±0.2
   - Contrast: ±0.2
   - Saturation: ±0.2
   - Hue: ±0.1
   - Simulates different lighting conditions

4. **Random Affine Transformations**
   - Translation: ±10% (0.1, 0.1)
   - Scale: 0.9 to 1.1
   - Handles slight positioning variations

5. **ToTensor**: Converts PIL Image to PyTorch tensor

6. **Normalization**: Applies ImageNet statistics

### Validation/Test Set Preprocessing

Validation and test sets use minimal preprocessing (no augmentation):
- Resize to 224×224
- Convert to tensor
- Normalize with ImageNet statistics

This ensures fair evaluation without data leakage from augmentation.

---

## Training Procedures

### Training Configuration

#### Hyperparameters

```python
HYPERPARAMS = {
    'batch_size': 32,
    'learning_rate': 0.001,
    'num_epochs': 50,
    'weight_decay': 0.0001,
    'patience': 5,          # Early stopping patience
    'factor': 0.5,          # LR reduction factor
    'min_lr': 1e-6,         # Minimum learning rate
}
```

#### Training Setup

- **Optimizer**: Adam optimizer
- **Loss Function**: CrossEntropyLoss
- **Learning Rate Scheduler**: ReduceLROnPlateau
  - Monitors validation accuracy
  - Reduces LR by factor of 0.5 when validation plateaus
  - Minimum LR: 1e-6
- **Early Stopping**: 
  - Patience: 5 epochs
  - Monitors validation accuracy
  - Stops training if no improvement for 5 consecutive epochs
  - Saves best model based on validation accuracy

#### Reproducibility

- **Random Seed**: 42 (fixed for all random operations)
- **Deterministic Operations**: Enabled
- **CUDA Deterministic**: Enabled (if GPU available)

### Training Process

#### Step 1: Data Loading

1. Load images from train/validation/test directories
2. Apply appropriate transforms (augmentation for train, minimal for val/test)
3. Create DataLoader with:
   - Batch size: 32
   - Shuffle: True (train), False (val/test)
   - Pin memory: Enabled if CUDA available

#### Step 2: Model Initialization

1. Load pre-trained MobileNetV2
2. Replace classifier head with 2-class linear layer
3. Move model to device (CPU or GPU)
4. Initialize optimizer and scheduler

#### Step 3: Training Loop

For each epoch:
1. **Training Phase**:
   - Set model to training mode
   - Iterate through training batches
   - Forward pass → Compute loss → Backward pass → Optimizer step
   - Track training loss and accuracy

2. **Validation Phase**:
   - Set model to evaluation mode
   - No gradient computation
   - Forward pass on validation set
   - Track validation loss, accuracy, precision, recall, F1-score

3. **Learning Rate Adjustment**:
   - Scheduler monitors validation accuracy
   - Reduces LR if no improvement

4. **Model Checkpointing**:
   - Save model if validation accuracy improves
   - Track best epoch and best validation accuracy

5. **Early Stopping Check**:
   - If no improvement for 5 epochs → stop training
   - Restore best model

#### Step 4: Final Evaluation

1. Load best model from checkpoint
2. Evaluate on test set
3. Generate confusion matrix
4. Calculate final metrics

---

## Evaluation Methods

### Metrics Used

1. **Accuracy**: Overall classification correctness
   ```
   Accuracy = (TP + TN) / (TP + TN + FP + FN)
   ```

2. **Precision**: Correctness of positive predictions
   ```
   Precision = TP / (TP + FP)
   ```

3. **Recall (Sensitivity)**: Ability to find all positive cases
   ```
   Recall = TP / (TP + FN)
   ```

4. **F1-Score**: Harmonic mean of precision and recall
   ```
   F1 = 2 × (Precision × Recall) / (Precision + Recall)
   ```

5. **Confusion Matrix**: Detailed breakdown of predictions
   - True Positives (TP)
   - True Negatives (TN)
   - False Positives (FP)
   - False Negatives (FN)

### Evaluation Procedure

1. **During Training**:
   - Validation set evaluated after each epoch
   - Metrics tracked: Loss, Accuracy, Precision, Recall, F1

2. **After Training**:
   - Test set evaluated once (unseen data)
   - Comprehensive metrics calculated
   - Confusion matrix generated
   - Classification report created

3. **Visualization**:
   - Training history plots (loss, accuracy over epochs)
   - Confusion matrix heatmap
   - Precision/Recall/F1 curves

---

## Model Performance

### Cattle Detection Model (Latest - After FMD Integration)

#### Performance Metrics

- **Best Validation Accuracy**: **94.07%** (improved from 93.11%)
- **Test Accuracy**: **90.00%**
- **Test Precision**: **91.45%**
- **Test Recall**: **90.00%**
- **Test F1-Score**: **89.99%**

#### Training Details

- **Best Model**: Epoch 10
- **Total Epochs Trained**: 15 (early stopping triggered)
- **Model Architecture**: MobileNetV2
- **Dataset**: Includes FMD healthy + infected cattle images

#### Improvements

- **Higher validation accuracy** (94.07% vs 93.11%)
- **Better generalization** with FMD data included
- **Accepts sick FMD cattle** that were previously rejected
- **Recognizes cattle with wounds** on tongue, hooves, udder, muzzle
- **Handles cattle with open mouths** (common in FMD cases)

### FMD Detection Model

#### Performance Metrics

- **Validation Accuracy**: **97.47%**
- **Test Accuracy**: High (exact value from training logs)
- **Model Architecture**: MobileNetV2

#### Training Details

- Trained on FMD-specific dataset
- Binary classification: Healthy vs Infected
- Optimized for detecting FMD symptoms

---

## Model Export and Deployment

### Export Formats

Models are exported in multiple formats for different use cases:

1. **PyTorch Format** (`.pth`)
   - Full model state dictionary
   - Includes optimizer state, epoch, metrics
   - Used for continued training or Python inference

2. **ONNX Format** (`.onnx` + `.onnx.data`)
   - Cross-platform format
   - Optimized for mobile deployment
   - Opset version: 12 (mobile-optimized)
   - External weights file (`.onnx.data`) for large models

3. **Quantized PyTorch** (`.pth`)
   - Reduced precision for smaller file size
   - Faster inference on mobile devices

### ONNX Export Process

1. **Load Best Model**: Load checkpoint from training
2. **Set to Evaluation Mode**: `model.eval()`
3. **Create Dummy Input**: Random tensor of shape [1, 3, 224, 224]
4. **Export to ONNX**:
   ```python
   torch.onnx.export(
       model,
       dummy_input,
       export_path,
       export_params=True,
       opset_version=12,
       do_constant_folding=True,
       input_names=['input'],
       output_names=['output'],
       dynamic_axes=None  # Fixed batch size for mobile
   )
   ```
5. **Verification**: Check ONNX model validity
6. **File Generation**:
   - `.onnx` file: Model structure (~0.24 MB)
   - `.onnx.data` file: Model weights (~8.5 MB)

### Mobile Deployment Specifications

#### Input Requirements

- **Image Size**: 224×224 pixels
- **Color Format**: RGB (3 channels)
- **Data Type**: Float32
- **Normalization**: 
  - Mean: [0.485, 0.456, 0.406]
  - Std: [0.229, 0.224, 0.225]
- **Input Shape**: [1, 3, 224, 224] (batch_size, channels, height, width)

#### Output Format

- **Output Shape**: [1, 2] (batch_size, num_classes)
- **Output Values**: Logits (raw scores before softmax)
- **Class 0**: First class (Cattle/Healthy)
- **Class 1**: Second class (Non-Cattle/Infected)

#### Confidence Threshold

- **Cattle Detection**: 0.55 (recommended)
- **FMD Detection**: Model-dependent

#### Model Files for Mobile

**Cattle Detection Model:**
- `cattle_detection.onnx` (252 KB)
- `cattle_detection.onnx.data` (8.5 MB)

**FMD Detection Model:**
- `fmd_detection.onnx` (252 KB)
- `fmd_detection.onnx.data` (8.5 MB)

---

## Training History and Iterations

### Cattle Detection Model Evolution

#### Initial Training
- **Accuracy**: ~93.11% validation accuracy
- **Issue**: Model rejected sick FMD cattle
- **Problem**: Not trained on FMD dataset images

#### Data Collection Phase
- Collected 550+ non-cattle images (dogs, pigs with open mouths)
- Focused on challenging cases to reduce false positives

#### First Retraining
- Improved non-cattle detection
- Still had issues with sick FMD cattle rejection

#### FMD Dataset Integration
- **4,426 FMD images** added to cattle class
- Both healthy (2,169) and infected (2,257) cattle included
- Ensures model recognizes cattle in all states

#### Final Retraining (Current Model)
- **Accuracy**: 94.07% validation accuracy
- **Improvement**: +0.96% from initial model
- **Fixed**: Now accepts sick FMD cattle
- **Best Epoch**: 10
- **Total Epochs**: 15 (early stopping)

### Training Timeline

1. **Initial Model Training**: Baseline model
2. **Non-Cattle Data Collection**: Added challenging non-cattle images
3. **First Retraining**: Improved false positive reduction
4. **FMD Integration**: Integrated FMD dataset into cattle class
5. **Final Retraining**: Current model with 94.07% accuracy

---

## Technical Specifications

### Hardware Requirements

#### Training
- **CPU**: Any modern CPU (training runs on CPU if GPU unavailable)
- **GPU**: Optional, but recommended for faster training
- **RAM**: Minimum 8 GB recommended
- **Storage**: ~10 GB for datasets and models

#### Inference (Mobile)
- **CPU**: Any modern smartphone CPU
- **RAM**: Minimal (models are lightweight)
- **Storage**: ~20 MB per model

### Software Dependencies

#### Training Environment
- Python 3.7+
- PyTorch 1.9+
- torchvision
- NumPy
- PIL/Pillow
- scikit-learn
- matplotlib
- seaborn
- tqdm

#### Mobile Deployment
- ONNX Runtime (React Native: `onnxruntime-react-native`)
- Image processing libraries

### File Structure

```
AniLink_2/
├── models/
│   ├── cattle_detection_model_best.pth      # Best cattle detection model
│   ├── cattle_detection_model.pth          # Last epoch model
│   ├── cattle_detection_model_quantized.pth # Quantized version
│   ├── fmd_model_best.pth                  # Best FMD detection model
│   ├── fmd_model_quantized.pth             # Quantized FMD model
│   └── cattle_detection_training_summary.json # Training results
│
├── mobile_app_models/
│   ├── cattle_detection.onnx                # ONNX model (structure)
│   ├── cattle_detection.onnx.data          # ONNX model (weights)
│   ├── fmd_detection.onnx                 # FMD ONNX model
│   ├── fmd_detection.onnx.data            # FMD ONNX weights
│   ├── README.md                          # Model documentation
│   └── REACT_NATIVE_INTEGRATION.md        # Integration guide
│
├── cattle_detection_data/
│   ├── raw_data/
│   │   ├── cattle/                         # Cattle images
│   │   └── non_cattle/                     # Non-cattle images
│   └── processed_data/
│       ├── train/                          # Training split
│       ├── validation/                     # Validation split
│       └── test/                           # Test split
│
├── train_cattle_detection_model.py         # Main training script
├── train_fmd_model_complete.py            # FMD training script
├── organize_cattle_dataset.py              # Dataset organization
├── export_models_for_react_native.py      # ONNX export script
└── app_onnx.py                            # Testing UI (Streamlit)
```

### Training Scripts

1. **`train_cattle_detection_model.py`**
   - Main cattle detection training script
   - Supports: train, evaluate, export, all modes
   - Includes data augmentation, early stopping, model saving

2. **`train_fmd_model_complete.py`**
   - FMD detection training script
   - Similar structure to cattle detection
   - Trained on FMD-specific dataset

3. **`organize_cattle_dataset.py`**
   - Organizes raw data into train/val/test splits
   - Validates images
   - Maintains class balance

4. **`integrate_fmd_into_cattle_detection.py`**
   - Integrates FMD dataset into cattle detection training data
   - Copies both healthy and infected cattle images
   - Ensures gatekeeper recognizes sick cattle

5. **`export_models_for_react_native.py`**
   - Exports models to ONNX format
   - Optimized for mobile deployment
   - Creates both `.onnx` and `.onnx.data` files

---

## Summary

### Key Achievements

1. **High Accuracy Models**:
   - Cattle Detection: 94.07% validation accuracy
   - FMD Detection: 97.47% validation accuracy

2. **Mobile Optimization**:
   - Lightweight models (~9 MB PyTorch, ~0.24 MB ONNX)
   - Fast inference suitable for smartphones
   - Cross-platform ONNX format

3. **Robust Training**:
   - Comprehensive data augmentation
   - Early stopping to prevent overfitting
   - Learning rate scheduling
   - Reproducible results (fixed random seeds)

4. **Problem Solving**:
   - Fixed false positive issues (non-cattle detection)
   - Fixed sick cattle rejection (FMD integration)
   - Improved generalization with diverse dataset

### Model Capabilities

**Cattle Detection Model:**
- ✅ Recognizes healthy cattle
- ✅ Recognizes sick FMD cattle (with wounds)
- ✅ Handles cattle with open mouths
- ✅ Rejects non-cattle animals (dogs, pigs, etc.)
- ✅ Works in various lighting conditions
- ✅ Handles different camera angles

**FMD Detection Model:**
- ✅ Classifies cattle as healthy or infected
- ✅ Detects FMD symptoms
- ✅ High accuracy (97.47%)
- ✅ Mobile-optimized inference

### Future Improvements

Potential areas for enhancement:
1. Larger dataset collection
2. Additional data augmentation techniques
3. Model ensemble methods
4. Real-time video processing
5. Multi-class classification (different diseases)
6. Edge device optimization (TensorFlow Lite, Core ML)

---

## Conclusion

The AniLink models represent a complete end-to-end machine learning pipeline, from data collection through model deployment. The use of transfer learning with MobileNetV2, comprehensive data augmentation, and careful hyperparameter tuning has resulted in highly accurate models suitable for mobile deployment. The integration of FMD dataset into cattle detection ensures robust performance across all cattle states, making the system reliable for real-world veterinary applications.

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Model Versions**: 
- Cattle Detection: v2.0 (with FMD integration)
- FMD Detection: v1.0
