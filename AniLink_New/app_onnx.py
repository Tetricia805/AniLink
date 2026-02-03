"""
AniLink: FMD Detection Model Testing Interface (ONNX Version)
Web UI using ONNX models for consistency with mobile deployment
"""

import streamlit as st
import numpy as np
from PIL import Image
import os
import matplotlib.pyplot as plt
from pathlib import Path

# Try to import ONNX Runtime
try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    st.error("⚠️ ONNX Runtime not installed. Install with: pip install onnxruntime")

# Page configuration
st.set_page_config(
    page_title="AniLink - FMD Detection (ONNX)",
    page_icon="🐄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .success-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        margin: 1rem 0;
    }
    .error-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        margin: 1rem 0;
    }
    .info-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        margin: 1rem 0;
    }
    </style>
""", unsafe_allow_html=True)

# Model paths (ONNX files)
MOBILE_APP_DIR = './mobile_app_models'
CATTLE_ONNX_PATH = os.path.join(MOBILE_APP_DIR, 'cattle_detection.onnx')
FMD_ONNX_PATH = os.path.join(MOBILE_APP_DIR, 'fmd_detection.onnx')

IMAGE_SIZE = 224
MEAN = np.array([0.485, 0.456, 0.406])
STD = np.array([0.229, 0.224, 0.225])

# Load ONNX models with caching
@st.cache_resource
def load_onnx_model(model_path, model_name):
    """Load ONNX model"""
    if not os.path.exists(model_path):
        return None, f"{model_name} ONNX model not found at {model_path}"
    
    try:
        # Create inference session
        session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        
        # Get model info
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        
        return {
            'session': session,
            'input_name': input_name,
            'output_name': output_name
        }, f"Loaded ONNX model"
    except Exception as e:
        return None, f"Error loading ONNX model: {str(e)}"

def preprocess_image(image):
    """Preprocess image for ONNX model input"""
    # Resize to 224x224
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))
    
    # Convert to numpy array and normalize
    img_array = np.array(image).astype(np.float32) / 255.0
    
    # Normalize with ImageNet stats
    img_array = (img_array - MEAN) / STD
    
    # Convert to CHW format (channels first)
    img_array = np.transpose(img_array, (2, 0, 1))
    
    # Add batch dimension: [1, 3, 224, 224]
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array.astype(np.float32)

def predict_cattle_onnx(image, model_info):
    """Predict if image contains cattle using ONNX model"""
    if model_info is None:
        return None
    
    # Preprocess image
    input_tensor = preprocess_image(image)
    
    # Run inference
    outputs = model_info['session'].run(
        [model_info['output_name']],
        {model_info['input_name']: input_tensor}
    )
    
    # Get logits
    logits = outputs[0][0]
    
    # Apply softmax
    exp_logits = np.exp(logits - np.max(logits))  # Numerical stability
    probabilities = exp_logits / np.sum(exp_logits)
    
    cattle_prob = probabilities[0]
    non_cattle_prob = probabilities[1]
    
    is_cattle = cattle_prob > non_cattle_prob
    confidence = max(cattle_prob, non_cattle_prob)
    
    return {
        'is_cattle': is_cattle,
        'confidence': float(confidence),
        'cattle_prob': float(cattle_prob),
        'non_cattle_prob': float(non_cattle_prob)
    }

def predict_fmd_onnx(image, model_info):
    """Predict FMD status using ONNX model"""
    if model_info is None:
        return None
    
    # Preprocess image
    input_tensor = preprocess_image(image)
    
    # Run inference
    outputs = model_info['session'].run(
        [model_info['output_name']],
        {model_info['input_name']: input_tensor}
    )
    
    # Get logits
    logits = outputs[0][0]
    
    # Apply softmax
    exp_logits = np.exp(logits - np.max(logits))  # Numerical stability
    probabilities = exp_logits / np.sum(exp_logits)
    
    healthy_prob = probabilities[0]
    infected_prob = probabilities[1]
    
    is_infected = infected_prob > healthy_prob
    confidence = max(healthy_prob, infected_prob)
    
    return {
        'prediction': 'Infected' if is_infected else 'Healthy',
        'confidence': float(confidence),
        'healthy_prob': float(healthy_prob),
        'infected_prob': float(infected_prob)
    }

# Main UI
def main():
    if not ONNX_AVAILABLE:
        st.error("""
        **ONNX Runtime not installed!**
        
        Please install it with:
        ```
        pip install onnxruntime
        ```
        
        Then restart the app.
        """)
        return
    
    # Header
    st.markdown('<p class="main-header">🐄 AniLink - FMD Detection System (ONNX)</p>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">AI-Powered Health Intelligence Platform - Using ONNX Models</p>', unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.header("📊 Model Status")
        
        # Load ONNX models
        cattle_model_info, cattle_status = load_onnx_model(CATTLE_ONNX_PATH, "Cattle Detection")
        fmd_model_info, fmd_status = load_onnx_model(FMD_ONNX_PATH, "FMD Detection")
        
        st.subheader("Cattle Detection Model (ONNX)")
        if cattle_model_info is not None:
            st.success(f"✓ {cattle_status}")
            st.info("Format: ONNX (same as mobile app)")
            st.info("Test Accuracy: 93.11% (IMPROVED)")
        else:
            st.error(f"✗ {cattle_status}")
        
        st.subheader("FMD Detection Model (ONNX)")
        if fmd_model_info is not None:
            st.success(f"✓ {fmd_status}")
            st.info("Format: ONNX (same as mobile app)")
            st.info("Validation Accuracy: 97.47%")
        else:
            st.error(f"✗ {fmd_status}")
        
        st.divider()
        
        st.subheader("ℹ️ Instructions")
        st.markdown("""
        1. Upload an image of cattle
        2. The system will first check if it's cattle
        3. If cattle is detected, FMD status will be analyzed
        4. Results will be displayed with confidence scores
        """)
        
        st.divider()
        
        st.subheader("📝 Model Information")
        st.markdown("""
        **Cattle Detection (ONNX):**
        - Binary classification (Cattle vs Non-cattle)
        - ONNX format (same as mobile app)
        - Test Accuracy: 93.11% (IMPROVED)
        - Better at rejecting dogs, pigs
        
        **FMD Detection (ONNX):**
        - Binary classification (Healthy vs Infected)
        - ONNX format (same as mobile app)
        - Validation Accuracy: 97.47%
        - Focuses on: muzzle, tongue, hooves, udder, mouth
        """)
        
        st.divider()
        
        st.subheader("🔍 Why ONNX?")
        st.markdown("""
        - **Same format as mobile app** - Test exactly what mobile uses
        - **Faster inference** - Optimized runtime
        - **Cross-platform** - Works everywhere
        - **Smaller memory** - More efficient
        """)
    
    # Main content
    if cattle_model_info is None or fmd_model_info is None:
        st.error("⚠️ Please ensure both ONNX models are exported and saved in the ./mobile_app_models directory")
        st.info("Required files:")
        st.code(f"""
        {CATTLE_ONNX_PATH}
        {FMD_ONNX_PATH}
        """)
        return
    
    # Image upload
    st.header("📤 Upload Image")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        uploaded_file = st.file_uploader(
            "Choose an image file",
            type=['jpg', 'jpeg', 'png'],
            help="Upload an image of cattle to test the ONNX models"
        )
    
    with col2:
        confidence_threshold = st.slider(
            "Cattle Detection Threshold",
            min_value=0.0,
            max_value=1.0,
            value=0.75,
            step=0.05,
            help="Minimum confidence to classify as cattle (higher = stricter)"
        )
        st.info("⚠️ **Note**: Higher threshold reduces false positives")
    
    if uploaded_file is not None:
        # Display uploaded image
        image = Image.open(uploaded_file).convert('RGB')
        
        # Create two columns for results
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📷 Uploaded Image")
            st.image(image, use_container_width=True)
        
        with col2:
            st.subheader("🔍 Analysis Results (ONNX)")
            
            # Step 1: Cattle Detection
            st.markdown("### Step 1: Cattle Detection")
            cattle_result = predict_cattle_onnx(image, cattle_model_info)
            
            if cattle_result is None:
                st.error("Error in cattle detection")
                return
            
            cattle_prob = cattle_result['cattle_prob']
            non_cattle_prob = cattle_result['non_cattle_prob']
            
            # Determine if cattle with threshold
            is_cattle_detected = cattle_result['is_cattle'] and cattle_result['confidence'] >= confidence_threshold
            
            # Additional check: if non-cattle probability is high, be more cautious
            if non_cattle_prob > 0.4:
                is_cattle_detected = is_cattle_detected and cattle_prob >= max(confidence_threshold, 0.8)
            
            if is_cattle_detected:
                st.markdown(f"""
                <div class="success-box">
                    <strong>✓ Cattle Detected</strong><br>
                    Confidence: {cattle_result['confidence']:.2%}<br>
                    Cattle Probability: {cattle_result['cattle_prob']:.2%}
                </div>
                """, unsafe_allow_html=True)
                
                # Step 2: FMD Detection
                st.markdown("### Step 2: FMD Detection")
                fmd_result = predict_fmd_onnx(image, fmd_model_info)
                
                if fmd_result is None:
                    st.error("Error in FMD detection")
                    return
                
                # Determine status color
                if fmd_result['prediction'] == 'Infected':
                    status_class = "error-box"
                    status_icon = "⚠️"
                else:
                    status_class = "success-box"
                    status_icon = "✓"
                
                st.markdown(f"""
                <div class="{status_class}">
                    <strong>{status_icon} Status: {fmd_result['prediction']}</strong><br>
                    Confidence: {fmd_result['confidence']:.2%}<br>
                    Healthy: {fmd_result['healthy_prob']:.2%}<br>
                    Infected: {fmd_result['infected_prob']:.2%}
                </div>
                """, unsafe_allow_html=True)
                
                # Visualization
                st.markdown("### 📊 Probability Distribution")
                
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
                
                # Cattle detection probabilities
                cattle_labels = ['Cattle', 'Non-Cattle']
                cattle_probs = [cattle_result['cattle_prob'], cattle_result['non_cattle_prob']]
                colors1 = ['#2ecc71', '#e74c3c']
                ax1.bar(cattle_labels, cattle_probs, color=colors1)
                ax1.set_ylim([0, 1])
                ax1.set_ylabel('Probability')
                ax1.set_title('Cattle Detection (ONNX)')
                ax1.grid(True, alpha=0.3)
                for i, v in enumerate(cattle_probs):
                    ax1.text(i, v + 0.02, f'{v:.2%}', ha='center', fontweight='bold')
                
                # FMD detection probabilities
                fmd_labels = ['Healthy', 'Infected']
                fmd_probs = [fmd_result['healthy_prob'], fmd_result['infected_prob']]
                colors2 = ['#2ecc71', '#e74c3c']
                ax2.bar(fmd_labels, fmd_probs, color=colors2)
                ax2.set_ylim([0, 1])
                ax2.set_ylabel('Probability')
                ax2.set_title('FMD Detection (ONNX)')
                ax2.grid(True, alpha=0.3)
                for i, v in enumerate(fmd_probs):
                    ax2.text(i, v + 0.02, f'{v:.2%}', ha='center', fontweight='bold')
                
                plt.tight_layout()
                st.pyplot(fig)
                
            else:
                # Determine reason for rejection
                if cattle_result['is_cattle']:
                    reason = f"Confidence ({cattle_result['confidence']:.2%}) below threshold ({confidence_threshold:.0%})"
                elif non_cattle_prob > 0.5:
                    reason = f"High non-cattle probability ({non_cattle_prob:.2%}) - likely not cattle"
                else:
                    reason = "Model classified as non-cattle"
                
                st.markdown(f"""
                <div class="error-box">
                    <strong>✗ Cattle Not Detected</strong><br>
                    Cattle Probability: {cattle_prob:.2%}<br>
                    Non-Cattle Probability: {non_cattle_prob:.2%}<br>
                    Confidence: {cattle_result['confidence']:.2%}<br><br>
                    <strong>Reason:</strong> {reason}<br><br>
                    <strong>Error:</strong> Image does not contain cattle. Please upload images of cattle focusing on muzzle, tongue, hooves, udder, or mouth.
                </div>
                """, unsafe_allow_html=True)
                
                st.info("⚠️ FMD detection will only proceed if cattle is detected in the image.")
                
                # Show cattle detection visualization
                st.markdown("### 📊 Cattle Detection Probabilities")
                fig, ax = plt.subplots(figsize=(6, 4))
                cattle_labels = ['Cattle', 'Non-Cattle']
                cattle_probs = [cattle_result['cattle_prob'], cattle_result['non_cattle_prob']]
                colors = ['#2ecc71', '#e74c3c']
                ax.bar(cattle_labels, cattle_probs, color=colors)
                ax.set_ylim([0, 1])
                ax.set_ylabel('Probability')
                ax.set_title('Cattle Detection Results (ONNX)')
                ax.grid(True, alpha=0.3)
                for i, v in enumerate(cattle_probs):
                    ax.text(i, v + 0.02, f'{v:.2%}', ha='center', fontweight='bold')
                plt.tight_layout()
                st.pyplot(fig)
        
        # Summary section
        st.divider()
        st.subheader("📋 Summary")
        
        summary_col1, summary_col2, summary_col3 = st.columns(3)
        
        with summary_col1:
            st.metric("Cattle Detected", "Yes" if is_cattle_detected else "No")
        
        with summary_col2:
            if is_cattle_detected:
                st.metric("FMD Status", fmd_result['prediction'])
            else:
                st.metric("FMD Status", "N/A")
        
        with summary_col3:
            if is_cattle_detected:
                st.metric("Confidence", f"{fmd_result['confidence']:.2%}")
            else:
                st.metric("Confidence", "N/A")
    
    else:
        st.info("👆 Please upload an image to test the ONNX models")
        
        with st.expander("📖 Why Use ONNX Models?"):
            st.markdown("""
            ### Benefits of ONNX:
            
            1. **Same as Mobile App** - Test exactly what React Native will use
            2. **Faster Inference** - ONNX Runtime is optimized
            3. **Cross-Platform** - Works on Windows, Mac, Linux, Mobile
            4. **Smaller Memory** - More efficient than PyTorch
            5. **Production Ready** - Same format deployed to mobile
            
            ### Comparison:
            - **.pth files**: PyTorch-specific, requires PyTorch
            - **.onnx files**: Universal format, works everywhere
            
            **Using ONNX in the UI ensures you're testing the exact same models that will run on mobile!**
            """)

if __name__ == '__main__':
    main()
