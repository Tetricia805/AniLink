"""Image loading and preprocessing for ONNX models. Matches app_onnx.py."""

import numpy as np
from PIL import Image

IMAGE_SIZE = 224
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def load_and_preprocess(image_bytes: bytes) -> np.ndarray:
    """
    Load image from bytes and preprocess for ONNX.
    - Resize to 224x224
    - ImageNet mean/std normalization
    - CHW format [1, 3, 224, 224]
    """
    img = Image.open(__import__("io").BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
    img_array = np.array(img).astype(np.float32) / 255.0
    img_array = (img_array - MEAN) / STD
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0)
    return img_array.astype(np.float32)
