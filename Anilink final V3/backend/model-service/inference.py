"""
ONNX inference for cattle + FMD detection.
Reference: Updated_detection_Models/app_onnx.py
- Same preprocessing (224x224, ImageNet mean/std, CHW)
- Same softmax (numerically stable)
- Stage 1: cattle gate; Stage 2: FMD (Healthy vs Infected)
- Threshold: default 0.5; special rule if non_cattle_prob > 0.4
"""

import os
import time
from typing import Optional

import numpy as np

from utils import load_and_preprocess

# Module-level cached sessions
_cattle_session = None
_fmd_session = None
_cattle_input_name = None
_cattle_output_name = None
_fmd_input_name = None
_fmd_output_name = None


def _softmax(logits: np.ndarray) -> np.ndarray:
    """Numerically stable softmax. Matches app_onnx.py."""
    exp_logits = np.exp(logits - np.max(logits))
    return exp_logits / np.sum(exp_logits)


def _load_sessions(cattle_path: str, fmd_path: str) -> None:
    """Load ONNX sessions at module level (load once)."""
    global _cattle_session, _fmd_session
    global _cattle_input_name, _cattle_output_name
    global _fmd_input_name, _fmd_output_name

    import onnxruntime as ort

    if _cattle_session is not None:
        return

    t0 = time.perf_counter()
    _cattle_session = ort.InferenceSession(
        cattle_path, providers=["CPUExecutionProvider"]
    )
    _cattle_input_name = _cattle_session.get_inputs()[0].name
    _cattle_output_name = _cattle_session.get_outputs()[0].name
    elapsed = (time.perf_counter() - t0) * 1000
    print(f"[MODEL-SERVICE] Cattle model loaded in {elapsed:.0f}ms")

    t0 = time.perf_counter()
    _fmd_session = ort.InferenceSession(
        fmd_path, providers=["CPUExecutionProvider"]
    )
    _fmd_input_name = _fmd_session.get_inputs()[0].name
    _fmd_output_name = _fmd_session.get_outputs()[0].name
    elapsed = (time.perf_counter() - t0) * 1000
    print(f"[MODEL-SERVICE] FMD model loaded in {elapsed:.0f}ms")


def run_inference(
    image_bytes: bytes,
    threshold: float = 0.5,
    cattle_path: str = "",
    fmd_path: str = "",
) -> dict:
    """
    Full pipeline: cattle gate then FMD.
    Returns dict matching POST /infer response schema.
    """
    _load_sessions(cattle_path, fmd_path)

    input_tensor = load_and_preprocess(image_bytes)

    # Stage 1: Cattle detection
    t0 = time.perf_counter()
    cattle_out = _cattle_session.run(
        [_cattle_output_name], {_cattle_input_name: input_tensor}
    )
    cattle_logits = cattle_out[0][0]
    cattle_probs = _softmax(cattle_logits)
    cattle_prob = float(cattle_probs[0])
    non_cattle_prob = float(cattle_probs[1])
    cattle_elapsed = (time.perf_counter() - t0) * 1000
    print(f"[MODEL-SERVICE] Cattle inference: {cattle_elapsed:.0f}ms")

    # Gate logic (matches app_onnx.py)
    is_cattle = cattle_prob > non_cattle_prob and cattle_prob >= threshold
    if non_cattle_prob > 0.4:
        is_cattle = is_cattle and cattle_prob >= max(threshold, 0.8)

    gate_rule = (
        "passed"
        if is_cattle
        else f"cattle_prob={cattle_prob:.3f} < threshold or non_cattle_prob={non_cattle_prob:.3f} > 0.4"
    )

    if not is_cattle:
        return {
            "ok": True,
            "threshold": threshold,
            "cattle_prob": cattle_prob,
            "non_cattle_prob": non_cattle_prob,
            "passed_gate": False,
            "gate_rule": gate_rule,
            "fmd": None,
        }

    # Stage 2: FMD detection
    t0 = time.perf_counter()
    fmd_out = _fmd_session.run(
        [_fmd_output_name], {_fmd_input_name: input_tensor}
    )
    fmd_logits = fmd_out[0][0]
    fmd_probs = _softmax(fmd_logits)
    healthy_prob = float(fmd_probs[0])
    infected_prob = float(fmd_probs[1])
    fmd_elapsed = (time.perf_counter() - t0) * 1000
    print(f"[MODEL-SERVICE] FMD inference: {fmd_elapsed:.0f}ms")

    label = "INFECTED" if infected_prob > healthy_prob else "HEALTHY"
    confidence = max(healthy_prob, infected_prob)

    return {
        "ok": True,
        "threshold": threshold,
        "cattle_prob": cattle_prob,
        "non_cattle_prob": non_cattle_prob,
        "passed_gate": True,
        "gate_rule": gate_rule,
        "fmd": {
            "label": label,
            "confidence": confidence,
            "probs": {"healthy": healthy_prob, "infected": infected_prob},
        },
    }
