"""
FMD Detection Model Training: Complete Python Script
AniLink: AI-Powered Health Intelligence Platform for Veterinary Services

This script contains all functionality from the FMD_Model_Training.ipynb notebook
for automated training and deployment.

Usage:
    python train_fmd_model_complete.py --mode train
    python train_fmd_model_complete.py --mode evaluate
    python train_fmd_model_complete.py --mode export
    python train_fmd_model_complete.py --mode all
"""

import os
import sys
import argparse
import hashlib
import numpy as np
import pandas as pd
from pathlib import Path
from collections import Counter, defaultdict
from PIL import Image
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for automation
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from tqdm import tqdm
import json

# Set style for professional plots
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# ============================================================================
# CONFIGURATION
# ============================================================================

# Dataset paths
TRAIN_DIR = r'C:\Users\USER\Desktop\fmd_classification_data\Train data'
VAL_DIR = r'C:\Users\USER\Desktop\fmd_classification_data\Validation data'
TEST_DIR = r'C:\Users\USER\Desktop\fmd_classification_data\Test_Data'

# Model configuration
MODEL_SAVE_DIR = './models'
IMAGE_SIZE = 224
MODEL_NAME = 'mobilenet_v2'  # Options: 'mobilenet_v2', 'efficientnet_b0', 'resnet50'
NUM_CLASSES = 2
USE_PRETRAINED = True

# Hyperparameters
HYPERPARAMS = {
    'batch_size': 32,
    'learning_rate': 0.001,
    'num_epochs': 50,
    'weight_decay': 0.0001,
    'patience': 5,
    'factor': 0.5,
    'min_lr': 1e-6,
}

# Set random seeds for reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed(RANDOM_SEED)
    torch.cuda.manual_seed_all(RANDOM_SEED)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Create model save directory
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)


# ============================================================================
# DATA ANALYSIS FUNCTIONS
# ============================================================================

def analyze_dataset(data_dir, dataset_name):
    """Analyze dataset composition"""
    print(f"\n{dataset_name}:")
    print("-" * 80)
    
    class_counts = {}
    image_sizes = []
    file_extensions = Counter()
    
    for class_label in [0, 1]:
        class_dir = os.path.join(data_dir, str(class_label))
        if not os.path.exists(class_dir):
            continue
        
        count = 0
        for filename in os.listdir(class_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.JPG')):
                count += 1
                file_ext = os.path.splitext(filename)[1].lower()
                file_extensions[file_ext] += 1
                
                # Get image size
                try:
                    img_path = os.path.join(class_dir, filename)
                    img = Image.open(img_path)
                    image_sizes.append(img.size)
                except Exception as e:
                    pass
        
        class_counts[class_label] = count
        class_name = "Healthy" if class_label == 0 else "Infected"
        print(f"  {class_name} (Class {class_label}): {count:,} images")
    
    total = sum(class_counts.values())
    print(f"  Total: {total:,} images")
    if file_extensions:
        print(f"  File formats: {dict(file_extensions)}")
    
    if image_sizes:
        widths, heights = zip(*image_sizes)
        print(f"  Image dimensions - Width: {min(widths)}-{max(widths)}px (avg: {np.mean(widths):.0f}px)")
        print(f"  Image dimensions - Height: {min(heights)}-{max(heights)}px (avg: {np.mean(heights):.0f}px)")
    
    return class_counts, image_sizes


def visualize_dataset_distribution(train_counts, val_counts, test_counts):
    """Visualize dataset distribution"""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    datasets = [
        ('Training', train_counts),
        ('Validation', val_counts),
        ('Test', test_counts)
    ]
    
    for idx, (name, counts) in enumerate(datasets):
        if counts:
            classes = ['Healthy', 'Infected']
            values = [counts.get(0, 0), counts.get(1, 0)]
            axes[idx].bar(classes, values, color=['#2ecc71', '#e74c3c'], alpha=0.8, edgecolor='black')
            axes[idx].set_title(f'{name} Set\n(n={sum(values)})', fontsize=14, fontweight='bold')
            axes[idx].set_ylabel('Number of Images', fontsize=12)
            axes[idx].grid(axis='y', alpha=0.3)
            for i, v in enumerate(values):
                axes[idx].text(i, v, str(v), ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('dataset_distribution.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("\n✓ Dataset distribution plot saved as 'dataset_distribution.png'")


# ============================================================================
# DATA CLEANING FUNCTIONS
# ============================================================================

def get_image_hash(image_path):
    """Calculate MD5 hash of image file"""
    hash_md5 = hashlib.md5()
    try:
        with open(image_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except:
        return None


def check_image_validity(image_path):
    """Check if image can be opened and is valid"""
    try:
        img = Image.open(image_path)
        img.verify()
        return True
    except:
        return False


def clean_dataset(data_dir, dataset_name):
    """Analyze dataset for cleaning issues"""
    print(f"\n{dataset_name} Cleaning Analysis:")
    print("-" * 80)
    
    issues = {
        'corrupted': [],
        'duplicates': [],
        'invalid_format': []
    }
    valid_images = 0
    image_hashes = defaultdict(list)
    
    for class_label in [0, 1]:
        class_dir = os.path.join(data_dir, str(class_label))
        if not os.path.exists(class_dir):
            continue
        
        for filename in os.listdir(class_dir):
            if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.JPG')):
                continue
            
            img_path = os.path.join(class_dir, filename)
            
            # Check validity
            if not check_image_validity(img_path):
                issues['corrupted'].append(img_path)
                continue
            
            valid_images += 1
            
            # Check for duplicates
            img_hash = get_image_hash(img_path)
            if img_hash:
                image_hashes[img_hash].append(img_path)
    
    # Find duplicates
    for hash_val, paths in image_hashes.items():
        if len(paths) > 1:
            issues['duplicates'].extend(paths[1:])  # Keep first, mark others as duplicates
    
    print(f"  Valid images: {valid_images:,}")
    print(f"  Corrupted images: {len(issues['corrupted']):,}")
    print(f"  Duplicate images: {len(issues['duplicates']):,}")
    
    return issues, valid_images


# ============================================================================
# DATASET CLASS
# ============================================================================

class FMDDataset(Dataset):
    """Custom dataset for FMD classification"""
    
    def __init__(self, data_dir, transform=None):
        self.data_dir = data_dir
        self.transform = transform
        self.images = []
        self.labels = []
        
        # Load images from class folders (0 = healthy, 1 = infected)
        for class_label in [0, 1]:
            class_dir = os.path.join(data_dir, str(class_label))
            if os.path.exists(class_dir):
                for img_name in os.listdir(class_dir):
                    if img_name.lower().endswith(('.jpg', '.jpeg', '.png', '.JPG')):
                        img_path = os.path.join(class_dir, img_name)
                        self.images.append(img_path)
                        self.labels.append(class_label)
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_path = self.images[idx]
        label = self.labels[idx]
        
        # Load image
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            print(f'Error loading image {img_path}: {e}')
            image = Image.new('RGB', (IMAGE_SIZE, IMAGE_SIZE), color='black')
        
        # Apply transforms
        if self.transform:
            image = self.transform(image)
        
        return image, label


# ============================================================================
# MODEL ARCHITECTURE
# ============================================================================

def create_fmd_model(model_name='mobilenet_v2', num_classes=2, use_pretrained=True):
    """Create FMD detection model with transfer learning - optimized for mobile deployment"""
    
    if model_name == 'mobilenet_v2':
        # MobileNetV2: ~9MB, 3.4M parameters - Perfect for mobile phones
        model = models.mobilenet_v2(pretrained=use_pretrained)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, num_classes)
        print(f"Model: MobileNetV2 (pre-trained on ImageNet)")
        print(f"Model Size: ~9MB (mobile-optimized)")
        print(f"Parameters: ~3.4M")
        print(f"Feature Extractor: {num_features} features")
        print(f"Classifier: Linear({num_features} → {num_classes})")
    elif model_name == 'efficientnet_b0':
        # EfficientNet-B0: ~5MB, 5.3M parameters - Even smaller
        model = models.efficientnet_b0(pretrained=use_pretrained)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, num_classes)
        print(f"Model: EfficientNet-B0 (pre-trained on ImageNet)")
        print(f"Model Size: ~5MB (ultra-lightweight)")
        print(f"Parameters: ~5.3M")
        print(f"Feature Extractor: {num_features} features")
        print(f"Classifier: Linear({num_features} → {num_classes})")
    elif model_name == 'resnet50':
        # ResNet50: ~90MB, 25.6M parameters - Too heavy for mobile
        model = models.resnet50(pretrained=use_pretrained)
        num_features = model.fc.in_features
        model.fc = nn.Linear(num_features, num_classes)
        print(f"Model: ResNet50 (pre-trained on ImageNet)")
        print(f"⚠ WARNING: ResNet50 is ~90MB - too large for mobile deployment!")
        print(f"Feature Extractor: {num_features} features")
        print(f"Classifier: Linear({num_features} → {num_classes})")
    else:
        raise ValueError(f"Unknown model: {model_name}. Choose 'mobilenet_v2', 'efficientnet_b0', or 'resnet50'")
    
    return model


# ============================================================================
# TRAINING FUNCTIONS
# ============================================================================

def train_epoch(model, dataloader, criterion, optimizer, device):
    """Train for one epoch"""
    model.train()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    
    progress_bar = tqdm(dataloader, desc='Training', leave=False)
    for images, labels in progress_bar:
        images = images.to(device)
        labels = labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, preds = torch.max(outputs, 1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
        
        progress_bar.set_postfix({'loss': f'{loss.item():.4f}'})
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = accuracy_score(all_labels, all_preds)
    return epoch_loss, epoch_acc


def validate_epoch(model, dataloader, criterion, device):
    """Validate for one epoch"""
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        progress_bar = tqdm(dataloader, desc='Validation', leave=False)
        for images, labels in progress_bar:
            images = images.to(device)
            labels = labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = accuracy_score(all_labels, all_preds)
    epoch_precision = precision_score(all_labels, all_preds, average='weighted', zero_division=0)
    epoch_recall = recall_score(all_labels, all_preds, average='weighted', zero_division=0)
    epoch_f1 = f1_score(all_labels, all_preds, average='weighted', zero_division=0)
    
    return epoch_loss, epoch_acc, epoch_precision, epoch_recall, epoch_f1


def plot_training_history(history, best_epoch, best_val_acc, save_path='training_history.png'):
    """Plot training history"""
    if len(history['train_loss']) == 0:
        print("⚠ Training history is empty.")
        return
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # Loss plot
    axes[0, 0].plot(history['train_loss'], label='Train Loss', linewidth=2, color='#3498db')
    axes[0, 0].plot(history['val_loss'], label='Val Loss', linewidth=2, color='#e74c3c')
    axes[0, 0].set_xlabel('Epoch', fontsize=12)
    axes[0, 0].set_ylabel('Loss', fontsize=12)
    axes[0, 0].set_title('Training and Validation Loss', fontsize=14, fontweight='bold')
    axes[0, 0].legend(fontsize=11)
    axes[0, 0].grid(True, alpha=0.3)
    if best_epoch > 0:
        axes[0, 0].axvline(x=best_epoch-1, color='green', linestyle='--', alpha=0.5, label=f'Best Epoch ({best_epoch})')
        axes[0, 0].legend(fontsize=11)
    
    # Accuracy plot
    axes[0, 1].plot(history['train_acc'], label='Train Accuracy', linewidth=2, color='#2ecc71')
    axes[0, 1].plot(history['val_acc'], label='Val Accuracy', linewidth=2, color='#e67e22')
    axes[0, 1].set_xlabel('Epoch', fontsize=12)
    axes[0, 1].set_ylabel('Accuracy', fontsize=12)
    axes[0, 1].set_title('Training and Validation Accuracy', fontsize=14, fontweight='bold')
    axes[0, 1].legend(fontsize=11)
    axes[0, 1].grid(True, alpha=0.3)
    if best_epoch > 0:
        axes[0, 1].axvline(x=best_epoch-1, color='green', linestyle='--', alpha=0.5, label=f'Best Epoch ({best_epoch})')
        axes[0, 1].legend(fontsize=11)
        if best_val_acc > 0:
            axes[0, 1].axhline(y=best_val_acc, color='red', linestyle='--', alpha=0.5, label=f'Best Val Acc ({best_val_acc:.4f})')
            axes[0, 1].legend(fontsize=11)
    
    # F1 Score plot
    if 'val_f1' in history and len(history['val_f1']) > 0:
        axes[1, 0].plot(history['val_f1'], label='Val F1-Score', linewidth=2, color='#9b59b6')
        axes[1, 0].set_xlabel('Epoch', fontsize=12)
        axes[1, 0].set_ylabel('F1-Score', fontsize=12)
        axes[1, 0].set_title('Validation F1-Score', fontsize=14, fontweight='bold')
        axes[1, 0].legend(fontsize=11)
        axes[1, 0].grid(True, alpha=0.3)
    else:
        axes[1, 0].text(0.5, 0.5, 'F1-Score data not available', 
                       ha='center', va='center', transform=axes[1, 0].transAxes, fontsize=12)
        axes[1, 0].set_title('Validation F1-Score', fontsize=14, fontweight='bold')
    
    # Learning rate plot
    axes[1, 1].text(0.5, 0.5, 'Learning rate schedule\n(monitored during training)', 
                   ha='center', va='center', transform=axes[1, 1].transAxes, fontsize=12)
    axes[1, 1].set_title('Learning Rate Schedule', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✓ Training history plots saved as '{save_path}'")


# ============================================================================
# EVALUATION FUNCTIONS
# ============================================================================

def evaluate_model(model, test_loader, device, save_path='test_confusion_matrix.png'):
    """Evaluate model on test set"""
    print("=" * 80)
    print("TEST SET EVALUATION")
    print("=" * 80)
    
    model.eval()
    test_labels = []
    test_preds = []
    test_probs = []
    
    with torch.no_grad():
        for images, labels in tqdm(test_loader, desc='Testing'):
            images = images.to(device)
            labels = labels.to(device)
            
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)
            
            test_labels.extend(labels.cpu().numpy())
            test_preds.extend(preds.cpu().numpy())
            test_probs.extend(probs.cpu().numpy())
    
    # Calculate metrics
    test_acc = accuracy_score(test_labels, test_preds)
    test_precision = precision_score(test_labels, test_preds, average='weighted', zero_division=0)
    test_recall = recall_score(test_labels, test_preds, average='weighted', zero_division=0)
    test_f1 = f1_score(test_labels, test_preds, average='weighted', zero_division=0)
    
    print(f"\nTest Set Results:")
    print(f"  Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"  Precision: {test_precision:.4f}")
    print(f"  Recall: {test_recall:.4f}")
    print(f"  F1-Score: {test_f1:.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(test_labels, test_preds)
    print(f"\nConfusion Matrix:")
    print(f"                Predicted")
    print(f"              Healthy  Infected")
    print(f"Actual Healthy   {cm[0,0]:4d}     {cm[0,1]:4d}")
    print(f"       Infected   {cm[1,0]:4d}     {cm[1,1]:4d}")
    
    # Classification report
    print(f"\nClassification Report:")
    print(classification_report(test_labels, test_preds, 
                              target_names=['Healthy', 'Infected'],
                              digits=4))
    
    # Visualize confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', 
                xticklabels=['Healthy', 'Infected'],
                yticklabels=['Healthy', 'Infected'])
    plt.ylabel('True Label', fontsize=12, fontweight='bold')
    plt.xlabel('Predicted Label', fontsize=12, fontweight='bold')
    plt.title('Test Set Confusion Matrix', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"\n✓ Test evaluation complete. Confusion matrix saved as '{save_path}'")
    
    return {
        'accuracy': test_acc,
        'precision': test_precision,
        'recall': test_recall,
        'f1_score': test_f1,
        'confusion_matrix': cm
    }


# ============================================================================
# MODEL EXPORT FUNCTIONS
# ============================================================================

def export_model(model, device, image_size=224):
    """Export model for mobile deployment"""
    print("=" * 80)
    print("MODEL EXPORT FOR MOBILE DEPLOYMENT")
    print("=" * 80)
    
    model.eval()
    dummy_input = torch.randn(1, 3, image_size, image_size).to(device)
    
    # 1. Export as TorchScript
    print("\n1. Exporting as TorchScript...")
    try:
        traced_model = torch.jit.trace(model, dummy_input)
        torchscript_path = os.path.join(MODEL_SAVE_DIR, 'fmd_model_torchscript.pt')
        traced_model.save(torchscript_path)
        print(f"   ✓ TorchScript model saved: {torchscript_path}")
        
        # Test TorchScript model
        with torch.no_grad():
            output = traced_model(dummy_input)
        print(f"   ✓ TorchScript model verified")
        
        # Calculate size
        size_mb = os.path.getsize(torchscript_path) / (1024 * 1024)
        print(f"   Model size: {size_mb:.2f} MB")
    except Exception as e:
        print(f"   ✗ TorchScript export failed: {e}")
        torchscript_path = None
    
    # 2. Export as ONNX
    print("\n2. Exporting as ONNX...")
    try:
        onnx_path = os.path.join(MODEL_SAVE_DIR, 'fmd_model.onnx')
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}},
            opset_version=11
        )
        print(f"   ✓ ONNX model saved: {onnx_path}")
    except Exception as e:
        print(f"   ✗ ONNX export failed: {e}")
        print(f"   Note: ONNX export may require additional dependencies (pip install onnx onnxruntime)")
    
    # 3. Model quantization (INT8)
    print("\n3. Quantizing model (INT8)...")
    try:
        quantized_model = torch.quantization.quantize_dynamic(
            model, {torch.nn.Linear}, dtype=torch.qint8
        )
        quantized_path = os.path.join(MODEL_SAVE_DIR, 'fmd_model_quantized.pth')
        torch.save(quantized_model.state_dict(), quantized_path)
        print(f"   ✓ Quantized model saved: {quantized_path}")
    except Exception as e:
        print(f"   ✗ Quantization failed: {e}")
    
    print("\n" + "=" * 80)
    print("MODEL EXPORT COMPLETE")
    print("=" * 80)
    print(f"Exported models saved in: {MODEL_SAVE_DIR}")
    print("\nFor mobile deployment:")
    print("  - Use TorchScript (.pt) for PyTorch Mobile")
    print("  - Use ONNX (.onnx) for cross-platform deployment")
    print("  - Use quantized model for reduced size and faster inference")


# ============================================================================
# CATTLE DETECTION FRAMEWORK
# ============================================================================

class CattleDetector:
    """
    Cattle Detection Model - Loads trained model to validate cattle images.
    This model acts as a gatekeeper before FMD detection.
    """
    
    def __init__(self, model_path=None, device=None):
        """
        Initialize cattle detection model.
        
        Args:
            model_path: Path to trained cattle detection model checkpoint
            device: Torch device (cuda/cpu)
        """
        self.device = device if device else torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Default model path
        if model_path is None:
            model_path = os.path.join(MODEL_SAVE_DIR, 'cattle_detection_model_best.pth')
        
        self.model_path = model_path
        self.model = None
        self.transform = None
        self.class_names = ['Cattle', 'Non-cattle']
        
        # Load model if path exists
        if os.path.exists(model_path):
            self._load_model(model_path)
        else:
            print(f"Warning: Cattle detection model not found at {model_path}")
            print("Cattle detection will be disabled. Please train the cattle detection model first.")
    
    def _load_model(self, model_path):
        """Load trained cattle detection model"""
        try:
            # Load checkpoint
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # Get model configuration from checkpoint
            if 'config' in checkpoint:
                model_name = checkpoint['config'].get('model_name', 'mobilenet_v2')
            else:
                model_name = 'mobilenet_v2'  # Default
            
            # Create model architecture
            if model_name == 'mobilenet_v2':
                model = models.mobilenet_v2(pretrained=False)
                num_features = model.classifier[1].in_features
                model.classifier[1] = nn.Linear(num_features, 2)
            elif model_name == 'efficientnet_b0':
                model = models.efficientnet_b0(pretrained=False)
                num_features = model.classifier[1].in_features
                model.classifier[1] = nn.Linear(num_features, 2)
            elif model_name == 'resnet50':
                model = models.resnet50(pretrained=False)
                num_features = model.fc.in_features
                model.fc = nn.Linear(num_features, 2)
            else:
                raise ValueError(f"Unknown model name: {model_name}")
            
            # Load weights
            model.load_state_dict(checkpoint['model_state_dict'])
            model = model.to(self.device)
            model.eval()
            
            self.model = model
            
            # Create transform (same as training)
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            
            print(f"[OK] Cattle detection model loaded from {model_path}")
            if 'val_acc' in checkpoint:
                print(f"  Model accuracy: {checkpoint['val_acc']:.4f}")
        except Exception as e:
            print(f"Error loading cattle detection model: {e}")
            self.model = None
    
    def is_cattle(self, image_path, confidence_threshold=0.5):
        """
        Check if image contains cattle using trained model.
        
        Args:
            image_path: Path to image file
            confidence_threshold: Minimum confidence to classify as cattle (default: 0.5)
        
        Returns:
            bool: True if cattle detected, False otherwise
        """
        if self.model is None:
            # Fallback: if model not loaded, return True (allow all images)
            print("Warning: Cattle detection model not loaded. Allowing image.")
            return True
        
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
            
            # Class 0 = Cattle, Class 1 = Non-cattle
            is_cattle = (predicted.item() == 0) and (confidence.item() >= confidence_threshold)
            
            return is_cattle
            
        except Exception as e:
            print(f"Error in cattle detection: {e}")
            # On error, allow image (fail-safe)
            return True
    
    def validate_cattle_image(self, image_path, confidence_threshold=0.5):
        """
        Validate that image contains cattle.
        Returns (is_valid, error_message)
        
        Args:
            image_path: Path to image file
            confidence_threshold: Minimum confidence to classify as cattle
        """
        if not os.path.exists(image_path):
            return False, "Image file not found."
        
        if self.model is None:
            # If model not loaded, allow image with warning
            return True, None
        
        if not self.is_cattle(image_path, confidence_threshold):
            return False, "Error: Image does not contain cattle. Please upload images of cattle focusing on muzzle, tongue, hooves, udder, or mouth."
        
        return True, None


def predict_fmd_with_cattle_check(model, image_path, transform, device, cattle_detector):
    """
    Complete inference pipeline: Cattle detection + FMD classification
    """
    # Step 1: Check if image contains cattle
    is_valid, error_msg = cattle_detector.validate_cattle_image(image_path)
    if not is_valid:
        return {
            'success': False,
            'error': error_msg,
            'prediction': None,
            'confidence': None
        }
    
    # Step 2: Load and preprocess image
    try:
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)
    except Exception as e:
        return {
            'success': False,
            'error': f"Error loading image: {str(e)}",
            'prediction': None,
            'confidence': None
        }
    
    # Step 3: FMD classification
    model.eval()
    with torch.no_grad():
        outputs = model(image_tensor)
        probs = torch.softmax(outputs, dim=1)
        _, pred = torch.max(outputs, 1)
    
    class_names = ['Healthy', 'Infected']
    pred_class = class_names[pred.item()]
    confidence = probs[0][pred.item()].item()
    
    return {
        'success': True,
        'error': None,
        'prediction': pred_class,
        'confidence': confidence,
        'probabilities': {
            'Healthy': probs[0][0].item(),
            'Infected': probs[0][1].item()
        }
    }


# ============================================================================
# MAIN TRAINING FUNCTION
# ============================================================================

def train_model():
    """Main training function"""
    print("=" * 80)
    print("FMD MODEL TRAINING")
    print("=" * 80)
    print(f"PyTorch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA Version: {torch.version.cuda}")
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"Device: {device}")
    print(f"Random Seed: {RANDOM_SEED}")
    print("=" * 80)
    
    # 1. Data Analysis
    print("\n" + "=" * 80)
    print("STEP 1: DATA ANALYSIS")
    print("=" * 80)
    train_counts, _ = analyze_dataset(TRAIN_DIR, "Training Set")
    val_counts, _ = analyze_dataset(VAL_DIR, "Validation Set")
    test_counts, _ = analyze_dataset(TEST_DIR, "Test Set")
    visualize_dataset_distribution(train_counts, val_counts, test_counts)
    
    # 2. Data Cleaning
    print("\n" + "=" * 80)
    print("STEP 2: DATA CLEANING")
    print("=" * 80)
    train_issues, train_valid = clean_dataset(TRAIN_DIR, "Training Set")
    val_issues, val_valid = clean_dataset(VAL_DIR, "Validation Set")
    test_issues, test_valid = clean_dataset(TEST_DIR, "Test Set")
    
    total_valid = train_valid + val_valid + test_valid
    total_corrupted = len(train_issues['corrupted']) + len(val_issues['corrupted']) + len(test_issues['corrupted'])
    print(f"\nTotal valid images: {total_valid:,}")
    print(f"Total corrupted: {total_corrupted:,}")
    print(f"Data quality: {(total_valid/(total_valid+total_corrupted)*100):.1f}% valid")
    
    # 3. Create transforms
    print("\n" + "=" * 80)
    print("STEP 3: DATA PREPROCESSING & AUGMENTATION")
    print("=" * 80)
    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1), scale=(0.9, 1.1)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    print("✓ Data preprocessing and augmentation transforms defined.")
    
    # 4. Create datasets and dataloaders
    print("\n" + "=" * 80)
    print("STEP 4: DATASET CREATION")
    print("=" * 80)
    train_dataset = FMDDataset(TRAIN_DIR, transform=train_transform)
    val_dataset = FMDDataset(VAL_DIR, transform=val_transform)
    test_dataset = FMDDataset(TEST_DIR, transform=val_transform)
    
    print(f"Training samples: {len(train_dataset):,}")
    print(f"Validation samples: {len(val_dataset):,}")
    print(f"Test samples: {len(test_dataset):,}")
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=HYPERPARAMS['batch_size'],
        shuffle=True,
        num_workers=0,
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=HYPERPARAMS['batch_size'],
        shuffle=False,
        num_workers=0,
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=HYPERPARAMS['batch_size'],
        shuffle=False,
        num_workers=0,
        pin_memory=True if torch.cuda.is_available() else False
    )
    
    print(f"\nBatch size: {HYPERPARAMS['batch_size']}")
    print(f"Training batches: {len(train_loader)}")
    print(f"Validation batches: {len(val_loader)}")
    print(f"Test batches: {len(test_loader)}")
    
    # 5. Create model
    print("\n" + "=" * 80)
    print("STEP 5: MODEL ARCHITECTURE")
    print("=" * 80)
    model = create_fmd_model(MODEL_NAME, NUM_CLASSES, USE_PRETRAINED)
    model = model.to(device)
    
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\nModel Parameters:")
    print(f"  Total: {total_params:,}")
    print(f"  Trainable: {trainable_params:,}")
    
    # 6. Setup optimizer and loss
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        model.parameters(),
        lr=HYPERPARAMS['learning_rate'],
        weight_decay=HYPERPARAMS['weight_decay']
    )
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode='min',
        factor=HYPERPARAMS['factor'],
        patience=HYPERPARAMS['patience'],
        min_lr=HYPERPARAMS['min_lr']
    )
    
    # 7. Training loop
    print("\n" + "=" * 80)
    print("STEP 6: MODEL TRAINING")
    print("=" * 80)
    print(f"Total epochs: {HYPERPARAMS['num_epochs']}")
    print(f"Early stopping patience: {HYPERPARAMS['patience']} epochs")
    print(f"Device: {device}")
    print(f"Model: {MODEL_NAME}")
    print("=" * 80)
    
    history = {
        'train_loss': [], 'train_acc': [],
        'val_loss': [], 'val_acc': [], 'val_precision': [], 'val_recall': [], 'val_f1': []
    }
    
    best_val_acc = 0.0
    best_epoch = 0
    patience = HYPERPARAMS['patience']
    epochs_without_improvement = 0
    best_model_state = None
    
    for epoch in range(HYPERPARAMS['num_epochs']):
        print(f'\nEpoch {epoch+1}/{HYPERPARAMS["num_epochs"]}')
        print('-' * 80)
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        
        # Validate
        val_loss, val_acc, val_precision, val_recall, val_f1 = validate_epoch(
            model, val_loader, criterion, device)
        
        # Learning rate scheduling
        scheduler.step(val_loss)
        current_lr = optimizer.param_groups[0]['lr']
        
        # Save history
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        history['val_precision'].append(val_precision)
        history['val_recall'].append(val_recall)
        history['val_f1'].append(val_f1)
        
        # Print metrics
        print(f'Train - Loss: {train_loss:.4f}, Acc: {train_acc:.4f}')
        print(f'Val   - Loss: {val_loss:.4f}, Acc: {val_acc:.4f}, '
              f'Precision: {val_precision:.4f}, Recall: {val_recall:.4f}, F1: {val_f1:.4f}')
        print(f'Learning Rate: {current_lr:.6f}')
        
        # Check for improvement
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch + 1
            epochs_without_improvement = 0
            
            # Save best model state
            best_model_state = {
                'epoch': epoch + 1,
                'model_state_dict': model.state_dict().copy(),
                'optimizer_state_dict': optimizer.state_dict().copy(),
                'val_acc': val_acc,
                'val_f1': val_f1,
                'history': history.copy(),
                'config': {
                    'model_name': MODEL_NAME,
                    'num_classes': NUM_CLASSES,
                    'image_size': IMAGE_SIZE,
                    'hyperparams': HYPERPARAMS
                }
            }
            
            # Save best model checkpoint
            model_path = os.path.join(MODEL_SAVE_DIR, 'fmd_model_best.pth')
            torch.save(best_model_state, model_path)
            print(f'✓ Saved best model (Val Acc: {val_acc:.4f})')
        else:
            epochs_without_improvement += 1
            print(f'No improvement for {epochs_without_improvement}/{patience} epochs')
        
        # Early stopping check
        if epochs_without_improvement >= patience:
            print(f'\n{"=" * 80}')
            print('EARLY STOPPING TRIGGERED')
            print("=" * 80)
            print(f'No improvement in validation accuracy for {patience} consecutive epochs.')
            print(f'Stopping training at epoch {epoch + 1}')
            print(f'Best validation accuracy: {best_val_acc:.4f} at epoch {best_epoch}')
            
            # Restore best model weights
            if best_model_state is not None:
                model.load_state_dict(best_model_state['model_state_dict'])
                print('✓ Restored best model weights')
            break
    
    print(f'\n{"=" * 80}')
    print('TRAINING COMPLETE')
    print("=" * 80)
    print(f'Total epochs trained: {len(history["train_loss"])}')
    print(f'Best validation accuracy: {best_val_acc:.4f} at epoch {best_epoch}')
    print(f'Best model saved to: {os.path.join(MODEL_SAVE_DIR, "fmd_model_best.pth")}')
    
    # 8. Plot training history
    print("\n" + "=" * 80)
    print("STEP 7: TRAINING HISTORY VISUALIZATION")
    print("=" * 80)
    plot_training_history(history, best_epoch, best_val_acc)
    
    # 9. Evaluate on test set
    print("\n" + "=" * 80)
    print("STEP 8: TEST SET EVALUATION")
    print("=" * 80)
    checkpoint_path = os.path.join(MODEL_SAVE_DIR, 'fmd_model_best.pth')
    if os.path.exists(checkpoint_path):
        checkpoint = torch.load(checkpoint_path, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        print(f"✓ Loaded best model from epoch {checkpoint['epoch']}")
    
    evaluate_model(model, test_loader, device)
    
    return model, history, best_epoch, best_val_acc


# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    """Main function with command-line interface"""
    parser = argparse.ArgumentParser(description='FMD Model Training Script')
    parser.add_argument('--mode', type=str, default='all',
                       choices=['train', 'evaluate', 'export', 'all'],
                       help='Mode: train, evaluate, export, or all')
    parser.add_argument('--model-path', type=str, default=None,
                       help='Path to model checkpoint for evaluation/export')
    
    args = parser.parse_args()
    
    if args.mode == 'train' or args.mode == 'all':
        model, history, best_epoch, best_val_acc = train_model()
    
    if args.mode == 'evaluate' or args.mode == 'all':
        print("\n" + "=" * 80)
        print("EVALUATION MODE")
        print("=" * 80)
        
        # Load model
        model_path = args.model_path or os.path.join(MODEL_SAVE_DIR, 'fmd_model_best.pth')
        if not os.path.exists(model_path):
            print(f"✗ Model not found: {model_path}")
            print("Please train the model first or provide a valid model path.")
            return
        
        checkpoint = torch.load(model_path, map_location=device)
        model = create_fmd_model(
            checkpoint['config']['model_name'],
            checkpoint['config']['num_classes'],
            True
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        
        # Create test dataloader
        val_transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        test_dataset = FMDDataset(TEST_DIR, transform=val_transform)
        test_loader = DataLoader(test_dataset, batch_size=HYPERPARAMS['batch_size'], shuffle=False)
        
        evaluate_model(model, test_loader, device)
    
    if args.mode == 'export' or args.mode == 'all':
        print("\n" + "=" * 80)
        print("EXPORT MODE")
        print("=" * 80)
        
        # Load model
        model_path = args.model_path or os.path.join(MODEL_SAVE_DIR, 'fmd_model_best.pth')
        if not os.path.exists(model_path):
            print(f"✗ Model not found: {model_path}")
            print("Please train the model first or provide a valid model path.")
            return
        
        checkpoint = torch.load(model_path, map_location=device)
        model = create_fmd_model(
            checkpoint['config']['model_name'],
            checkpoint['config']['num_classes'],
            True
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        
        export_model(model, device, IMAGE_SIZE)
    
    print("\n" + "=" * 80)
    print("COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()
