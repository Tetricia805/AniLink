"""
Cattle Detection Model Training: Complete Python Script
AniLink: AI-Powered Health Intelligence Platform for Veterinary Services

This script trains a binary classification model to detect cattle vs non-cattle images.
Similar structure to FMD model training for consistency.

Usage:
    python train_cattle_detection_model.py --mode train
    python train_cattle_detection_model.py --mode evaluate
    python train_cattle_detection_model.py --mode export
    python train_cattle_detection_model.py --mode all
"""

import os
import sys
import argparse
import numpy as np
from pathlib import Path
from collections import Counter
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
TRAIN_DIR = 'cattle_detection_data/processed_data/train'
VAL_DIR = 'cattle_detection_data/processed_data/validation'
TEST_DIR = 'cattle_detection_data/processed_data/test'

# Model configuration
MODEL_SAVE_DIR = './models'
IMAGE_SIZE = 224
MODEL_NAME = 'mobilenet_v2'  # Mobile-optimized for farmer's phone
NUM_CLASSES = 2  # cattle (0) vs non_cattle (1)
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
    
    cattle_dir = Path(data_dir) / 'cattle'
    non_cattle_dir = Path(data_dir) / 'non_cattle'
    
    cattle_count = 0
    non_cattle_count = 0
    
    if cattle_dir.exists():
        cattle_count = len(list(cattle_dir.glob('*.jpg'))) + len(list(cattle_dir.glob('*.png'))) + len(list(cattle_dir.glob('*.jpeg')))
    
    if non_cattle_dir.exists():
        non_cattle_count = len(list(non_cattle_dir.glob('*.jpg'))) + len(list(non_cattle_dir.glob('*.png'))) + len(list(non_cattle_dir.glob('*.jpeg')))
    
    total = cattle_count + non_cattle_count
    
    print(f"  Cattle: {cattle_count:,} images")
    print(f"  Non-cattle: {non_cattle_count:,} images")
    print(f"  Total: {total:,} images")
    
    if total > 0:
        cattle_pct = (cattle_count / total) * 100
        non_cattle_pct = (non_cattle_count / total) * 100
        print(f"  Distribution: Cattle {cattle_pct:.1f}% | Non-cattle {non_cattle_pct:.1f}%")
    
    return {'cattle': cattle_count, 'non_cattle': non_cattle_count}, total


def visualize_dataset_distribution(train_counts, val_counts, test_counts):
    """Visualize dataset distribution"""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Counts by split
    splits = ['Train', 'Validation', 'Test']
    cattle_counts = [train_counts['cattle'], val_counts['cattle'], test_counts['cattle']]
    non_cattle_counts = [train_counts['non_cattle'], val_counts['non_cattle'], test_counts['non_cattle']]
    
    x = np.arange(len(splits))
    width = 0.35
    
    axes[0].bar(x - width/2, cattle_counts, width, label='Cattle', color='#2ecc71')
    axes[0].bar(x + width/2, non_cattle_counts, width, label='Non-cattle', color='#e74c3c')
    axes[0].set_xlabel('Dataset Split')
    axes[0].set_ylabel('Number of Images')
    axes[0].set_title('Dataset Distribution by Split')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(splits)
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # Overall distribution
    total_cattle = sum(cattle_counts)
    total_non_cattle = sum(non_cattle_counts)
    axes[1].pie([total_cattle, total_non_cattle], 
                labels=['Cattle', 'Non-cattle'],
                autopct='%1.1f%%',
                colors=['#2ecc71', '#e74c3c'],
                startangle=90)
    axes[1].set_title('Overall Class Distribution')
    
    plt.tight_layout()
    plt.savefig('cattle_detection_dataset_distribution.png', dpi=300, bbox_inches='tight')
    print("\n[OK] Dataset distribution visualization saved: cattle_detection_dataset_distribution.png")
    plt.close()


# ============================================================================
# DATASET CLASS
# ============================================================================

class CattleDetectionDataset(Dataset):
    """Custom dataset for cattle detection classification"""
    
    def __init__(self, data_dir, transform=None):
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.images = []
        self.labels = []
        
        # Load cattle images (label 0)
        cattle_dir = self.data_dir / 'cattle'
        if cattle_dir.exists():
            for img_path in cattle_dir.glob('*.jpg'):
                self.images.append(str(img_path))
                self.labels.append(0)
            for img_path in cattle_dir.glob('*.png'):
                self.images.append(str(img_path))
                self.labels.append(0)
            for img_path in cattle_dir.glob('*.jpeg'):
                self.images.append(str(img_path))
                self.labels.append(0)
        
        # Load non-cattle images (label 1)
        non_cattle_dir = self.data_dir / 'non_cattle'
        if non_cattle_dir.exists():
            for img_path in non_cattle_dir.glob('*.jpg'):
                self.images.append(str(img_path))
                self.labels.append(1)
            for img_path in non_cattle_dir.glob('*.png'):
                self.images.append(str(img_path))
                self.labels.append(1)
            for img_path in non_cattle_dir.glob('*.jpeg'):
                self.images.append(str(img_path))
                self.labels.append(1)
    
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

def create_cattle_detection_model(model_name='mobilenet_v2', num_classes=2, use_pretrained=True):
    """Create cattle detection model with transfer learning - optimized for mobile deployment"""
    
    if model_name == 'mobilenet_v2':
        # MobileNetV2: ~9MB, 3.4M parameters - Perfect for mobile phones
        model = models.mobilenet_v2(pretrained=use_pretrained)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, num_classes)
        print(f"Model: MobileNetV2 (pre-trained on ImageNet)")
        print(f"Model Size: ~9MB (mobile-optimized)")
        print(f"Parameters: ~3.4M")
        print(f"Feature Extractor: {num_features} features")
        print(f"Classifier: Linear({num_features} -> {num_classes})")
    elif model_name == 'efficientnet_b0':
        # EfficientNet-B0: ~5MB, 5.3M parameters - Even smaller
        model = models.efficientnet_b0(pretrained=use_pretrained)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, num_classes)
        print(f"Model: EfficientNet-B0 (pre-trained on ImageNet)")
        print(f"Model Size: ~5MB (ultra-lightweight)")
        print(f"Parameters: ~5.3M")
        print(f"Feature Extractor: {num_features} features")
        print(f"Classifier: Linear({num_features} -> {num_classes})")
    elif model_name == 'resnet50':
        # ResNet50: ~90MB, 25.6M parameters - Too heavy for mobile
        model = models.resnet50(pretrained=use_pretrained)
        num_features = model.fc.in_features
        model.fc = nn.Linear(num_features, num_classes)
        print(f"Model: ResNet50 (pre-trained on ImageNet)")
        print(f"⚠ WARNING: ResNet50 is ~90MB - too large for mobile deployment!")
        print(f"Feature Extractor: {num_features} features")
        print(f"Classifier: Linear({num_features} -> {num_classes})")
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


def plot_training_history(history, best_epoch, best_val_acc, save_path='cattle_detection_training_history.png'):
    """Plot training history"""
    if len(history['train_loss']) == 0:
        print("⚠ Training history is empty.")
        return
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    epochs = range(1, len(history['train_loss']) + 1)
    
    # Loss
    axes[0, 0].plot(epochs, history['train_loss'], 'b-', label='Training Loss', linewidth=2)
    axes[0, 0].plot(epochs, history['val_loss'], 'r-', label='Validation Loss', linewidth=2)
    axes[0, 0].axvline(x=best_epoch, color='g', linestyle='--', alpha=0.7, label=f'Best Epoch ({best_epoch})')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Loss')
    axes[0, 0].set_title('Training and Validation Loss')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # Accuracy
    axes[0, 1].plot(epochs, history['train_acc'], 'b-', label='Training Accuracy', linewidth=2)
    axes[0, 1].plot(epochs, history['val_acc'], 'r-', label='Validation Accuracy', linewidth=2)
    axes[0, 1].axvline(x=best_epoch, color='g', linestyle='--', alpha=0.7, label=f'Best Epoch ({best_epoch})')
    axes[0, 1].axhline(y=best_val_acc, color='g', linestyle=':', alpha=0.7, label=f'Best Val Acc ({best_val_acc:.4f})')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Accuracy')
    axes[0, 1].set_title('Training and Validation Accuracy')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # Precision, Recall, F1
    axes[1, 0].plot(epochs, history['val_precision'], 'g-', label='Precision', linewidth=2)
    axes[1, 0].plot(epochs, history['val_recall'], 'orange', label='Recall', linewidth=2)
    axes[1, 0].plot(epochs, history['val_f1'], 'purple', label='F1-Score', linewidth=2)
    axes[1, 0].axvline(x=best_epoch, color='g', linestyle='--', alpha=0.7)
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Score')
    axes[1, 0].set_title('Validation Metrics')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)
    
    # Learning rate (if available)
    if 'learning_rate' in history:
        axes[1, 1].plot(epochs, history['learning_rate'], 'b-', linewidth=2)
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Learning Rate')
        axes[1, 1].set_title('Learning Rate Schedule')
        axes[1, 1].set_yscale('log')
        axes[1, 1].grid(True, alpha=0.3)
    else:
        axes[1, 1].text(0.5, 0.5, 'Learning Rate\nNot Tracked', 
                        ha='center', va='center', transform=axes[1, 1].transAxes, fontsize=14)
        axes[1, 1].set_title('Learning Rate Schedule')
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"\n[OK] Training history saved: {save_path}")
    plt.close()


def evaluate_model(model, test_loader, device, save_path='cattle_detection_test_confusion_matrix.png'):
    """Evaluate model on test set"""
    model.eval()
    all_preds = []
    all_labels = []
    
    print("\nEvaluating on test set...")
    with torch.no_grad():
        for images, labels in tqdm(test_loader, desc='Testing'):
            images = images.to(device)
            labels = labels.to(device)
            
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    # Calculate metrics
    accuracy = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds, average='weighted', zero_division=0)
    recall = recall_score(all_labels, all_preds, average='weighted', zero_division=0)
    f1 = f1_score(all_labels, all_preds, average='weighted', zero_division=0)
    
    # Confusion matrix
    cm = confusion_matrix(all_labels, all_preds)
    
    # Classification report
    class_names = ['Cattle', 'Non-cattle']
    report = classification_report(all_labels, all_preds, target_names=class_names, zero_division=0)
    
    print("\n" + "=" * 80)
    print("TEST SET EVALUATION")
    print("=" * 80)
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1-Score: {f1:.4f}")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(report)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Cattle Detection - Test Set Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"\n[OK] Confusion matrix saved: {save_path}")
    plt.close()
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'confusion_matrix': cm.tolist(),
        'classification_report': report
    }


# ============================================================================
# MODEL EXPORT FUNCTIONS
# ============================================================================

def export_model(model, model_path, device):
    """Export model in various formats for mobile deployment"""
    print("\n" + "=" * 80)
    print("MODEL EXPORT")
    print("=" * 80)
    
    model.eval()
    
    # 1. PyTorch state dict (for Python inference)
    torch.save(model.state_dict(), model_path)
    file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
    print(f"[OK] PyTorch model saved: {model_path} ({file_size:.2f} MB)")
    
    # 2. TorchScript (for mobile deployment)
    try:
        example_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE).to(device)
        traced_model = torch.jit.trace(model, example_input)
        torchscript_path = model_path.replace('.pth', '_torchscript.pt')
        traced_model.save(torchscript_path)
        file_size = os.path.getsize(torchscript_path) / (1024 * 1024)
        print(f"[OK] TorchScript model saved: {torchscript_path} ({file_size:.2f} MB)")
    except Exception as e:
        print(f"[WARNING] TorchScript export failed: {e}")
    
    # 3. Quantized model (for even smaller size)
    try:
        quantized_model = torch.quantization.quantize_dynamic(
            model, {nn.Linear}, dtype=torch.qint8
        )
        quantized_path = model_path.replace('.pth', '_quantized.pth')
        torch.save(quantized_model.state_dict(), quantized_path)
        file_size = os.path.getsize(quantized_path) / (1024 * 1024)
        print(f"[OK] Quantized model saved: {quantized_path} ({file_size:.2f} MB)")
    except Exception as e:
        print(f"[WARNING] Quantization failed: {e}")
    
    print("\n[OK] Model export complete!")


# ============================================================================
# MAIN TRAINING FUNCTION
# ============================================================================

def train_model():
    """Main training function"""
    print("=" * 80)
    print("CATTLE DETECTION MODEL TRAINING")
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
    train_counts, train_total = analyze_dataset(TRAIN_DIR, "Training Set")
    val_counts, val_total = analyze_dataset(VAL_DIR, "Validation Set")
    test_counts, test_total = analyze_dataset(TEST_DIR, "Test Set")
    visualize_dataset_distribution(train_counts, val_counts, test_counts)
    
    # 2. Create transforms
    print("\n" + "=" * 80)
    print("STEP 2: DATA PREPROCESSING & AUGMENTATION")
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
    print("[OK] Data preprocessing and augmentation transforms defined.")
    
    # 3. Create datasets and dataloaders
    print("\n" + "=" * 80)
    print("STEP 3: DATASET CREATION")
    print("=" * 80)
    train_dataset = CattleDetectionDataset(TRAIN_DIR, transform=train_transform)
    val_dataset = CattleDetectionDataset(VAL_DIR, transform=val_transform)
    test_dataset = CattleDetectionDataset(TEST_DIR, transform=val_transform)
    
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
    
    # 4. Create model
    print("\n" + "=" * 80)
    print("STEP 4: MODEL ARCHITECTURE")
    print("=" * 80)
    model = create_cattle_detection_model(MODEL_NAME, NUM_CLASSES, USE_PRETRAINED)
    model = model.to(device)
    
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"\nModel Parameters:")
    print(f"  Total: {total_params:,}")
    print(f"  Trainable: {trainable_params:,}")
    
    # 5. Setup optimizer and loss
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
    
    # 6. Training loop
    print("\n" + "=" * 80)
    print("STEP 5: MODEL TRAINING")
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
    
    model_path = os.path.join(MODEL_SAVE_DIR, 'cattle_detection_model_best.pth')
    
    for epoch in range(HYPERPARAMS['num_epochs']):
        print(f"\nEpoch {epoch + 1}/{HYPERPARAMS['num_epochs']}")
        print("-" * 80)
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        
        # Validate
        val_loss, val_acc, val_precision, val_recall, val_f1 = validate_epoch(
            model, val_loader, criterion, device
        )
        
        # Update learning rate
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
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}")
        print(f"Val Precision: {val_precision:.4f} | Val Recall: {val_recall:.4f} | Val F1: {val_f1:.4f}")
        print(f"Learning Rate: {current_lr:.6f}")
        
        # Early stopping and model saving
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch + 1
            epochs_without_improvement = 0
            best_model_state = {
                'epoch': epoch + 1,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'val_loss': val_loss,
            }
            torch.save(best_model_state, model_path)
            print(f"[OK] Saved best model (Val Acc: {val_acc:.4f})")
        else:
            epochs_without_improvement += 1
            print(f"No improvement for {epochs_without_improvement}/{patience} epochs")
        
        if epochs_without_improvement >= patience:
            print("\n" + "=" * 80)
            print("EARLY STOPPING TRIGGERED")
            print("=" * 80)
            print(f"Best validation accuracy: {best_val_acc:.4f} at epoch {best_epoch}")
            break
    
    # Restore best model
    if best_model_state:
        model.load_state_dict(best_model_state['model_state_dict'])
        print(f"\n[OK] Restored best model from epoch {best_epoch}")
    
    # Plot training history
    plot_training_history(history, best_epoch, best_val_acc)
    
    # Evaluate on test set
    print("\n" + "=" * 80)
    print("STEP 6: TEST SET EVALUATION")
    print("=" * 80)
    test_results = evaluate_model(model, test_loader, device)
    
    # Save training summary
    summary = {
        'best_epoch': best_epoch,
        'best_val_acc': float(best_val_acc),
        'test_accuracy': float(test_results['accuracy']),
        'test_precision': float(test_results['precision']),
        'test_recall': float(test_results['recall']),
        'test_f1': float(test_results['f1']),
        'total_epochs': len(history['train_loss']),
        'model_name': MODEL_NAME,
        'hyperparameters': HYPERPARAMS,
    }
    
    summary_path = os.path.join(MODEL_SAVE_DIR, 'cattle_detection_training_summary.json')
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"\n[OK] Training summary saved: {summary_path}")
    
    return model, test_results


def evaluate_only():
    """Evaluate existing model"""
    print("=" * 80)
    print("CATTLE DETECTION MODEL EVALUATION")
    print("=" * 80)
    
    # Load model
    model_path = os.path.join(MODEL_SAVE_DIR, 'cattle_detection_model_best.pth')
    if not os.path.exists(model_path):
        print(f"[ERROR] Model not found: {model_path}")
        print("Please train the model first.")
        return
    
    # Create model
    model = create_cattle_detection_model(MODEL_NAME, NUM_CLASSES, USE_PRETRAINED)
    model = model.to(device)
    
    # Load weights
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"[OK] Loaded model from epoch {checkpoint['epoch']}")
    val_acc = checkpoint.get('val_acc', checkpoint.get('best_val_acc', 0.0))
    print(f"Validation accuracy: {val_acc:.4f}")
    
    # Create test dataset
    val_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    test_dataset = CattleDetectionDataset(TEST_DIR, transform=val_transform)
    test_loader = DataLoader(
        test_dataset,
        batch_size=HYPERPARAMS['batch_size'],
        shuffle=False,
        num_workers=0
    )
    
    # Evaluate
    test_results = evaluate_model(model, test_loader, device)
    return test_results


def export_only():
    """Export existing model"""
    print("=" * 80)
    print("CATTLE DETECTION MODEL EXPORT")
    print("=" * 80)
    
    # Load model
    model_path = os.path.join(MODEL_SAVE_DIR, 'cattle_detection_model_best.pth')
    if not os.path.exists(model_path):
        print(f"[ERROR] Model not found: {model_path}")
        print("Please train the model first.")
        return
    
    # Create model
    model = create_cattle_detection_model(MODEL_NAME, NUM_CLASSES, USE_PRETRAINED)
    model = model.to(device)
    
    # Load weights
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    print(f"[OK] Loaded model from epoch {checkpoint['epoch']}")
    
    # Export
    export_path = os.path.join(MODEL_SAVE_DIR, 'cattle_detection_model.pth')
    export_model(model, export_path, device)


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Train Cattle Detection Model')
    parser.add_argument('--mode', type=str, default='all',
                       choices=['train', 'evaluate', 'export', 'all'],
                       help='Mode: train, evaluate, export, or all')
    
    args = parser.parse_args()
    
    if args.mode == 'train' or args.mode == 'all':
        train_model()
    
    if args.mode == 'evaluate' or args.mode == 'all':
        if args.mode == 'evaluate':
            evaluate_only()
        else:
            print("\n" + "=" * 80)
            print("Re-evaluating on test set...")
            print("=" * 80)
            evaluate_only()
    
    if args.mode == 'export' or args.mode == 'all':
        if args.mode == 'export':
            export_only()
        else:
            print("\n" + "=" * 80)
            print("Exporting model...")
            print("=" * 80)
            export_only()
    
    print("\n" + "=" * 80)
    print("COMPLETE!")
    print("=" * 80)


if __name__ == '__main__':
    main()
