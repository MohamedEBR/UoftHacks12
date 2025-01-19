import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip, ImageSequenceClip
from scipy.ndimage import gaussian_filter

from flask import Flask, send_file, jsonify, request

# 1. Linearize
# 2. Apply a rodent-dichromacy matrix
# 3. Scale brightness
# 4. Re-gamma.

TRANSFORMATION_MATRIX = np.array([
    [0.60, 0.40, 0.0],
    [0.25, 0.75, 0.0],
    [0.0, 0.0, 1.0]
])

BRIGHTNESS_SCALE = 1.0


def predator_vision_effect(frames):
    """Apply Predator Vision effect with motion highlight."""
    processed_frames = []
    previous_frame = None

    for frame in frames:
        # Convert frame to grayscale for motion detection
        grayscale = np.dot(frame[..., :3], [0.2989, 0.5870, 0.1140]).astype(np.float32)

        # Calculate motion (difference between frames)
        if previous_frame is None:
            motion = np.zeros_like(grayscale)
        else:
            motion = np.abs(grayscale - previous_frame)

        # Normalize motion values to [0, 255]
        motion = (motion / np.max(motion) * 255).astype(np.uint8) if np.max(motion) != 0 else motion

        # Create motion-highlighted frame
        motion_highlight = np.stack([motion, np.zeros_like(motion), 255 - motion], axis=-1).astype(np.uint8)

        # Blend original frame with motion highlight for Predator Vision
        predator_frame = (0.5 * frame + 0.5 * motion_highlight).astype(np.uint8)

        processed_frames.append(predator_frame)
        previous_frame = grayscale

    return processed_frames


def simulate_predator_vision_video(input_video_path, output_video_path):

    clip = VideoFileClip(input_video_path)

    # Process frames to apply Predator Vision effect
    frames = list(clip.iter_frames(fps=clip.fps, dtype="uint8"))
    processed_frames = predator_vision_effect(frames)

    # Create a new video with the processed frames
    output_clip = ImageSequenceClip(processed_frames, fps=clip.fps)
    output_clip.write_videofile(output_video_path, codec="libx264", audio=False) 

def ultraviolet_effect(frame):
    """Apply a UV vision effect to a single frame."""
    # Convert frame to float32 for processing
    frame_float = frame.astype(np.float32) / 255.0

    # Enhance the blue and purple channels
    blue = frame_float[..., 2] * 1.5
    purple = (frame_float[..., 0] + frame_float[..., 2]) * 0.5

    # Reduce the red channel
    red = frame_float[..., 0] * 0.2

    # Stack the channels back together
    uv_frame = np.stack([red, purple, blue], axis=-1)

    # Clip values to [0, 1] and convert back to uint8
    uv_frame = np.clip(uv_frame, 0, 1)
    uv_frame = (uv_frame * 255).astype(np.uint8)

    return uv_frame

def vision_array_transform(frame):
    """
    Applies transformation
    """
    frame_float = frame.astype(np.float32) / 255.0

    h, w, c = frame_float.shape
    transformed = frame_float.reshape(-1, c)

    transformed = transformed ** 2.2
    transformed = transformed @ TRANSFORMATION_MATRIX.T
    transformed = BRIGHTNESS_SCALE * transformed
    transformed = transformed ** (1 / 2.2)
    
    transformed = transformed.reshape(h, w, c)
    transformed = np.clip(transformed, 0, 1)
    transformed_uint8 = (transformed * 255).astype(np.uint8)

    return ultraviolet_effect(transformed_uint8)

def simulate_fish_vision_video(input_video_path, output_video_path):
    """
    Reads a video, applies the dog-vision color transform to each frame,
    and writes out a new video.
    """
    clip = VideoFileClip(input_video_path)
    vision_clip = clip.fl_image(vision_array_transform)
    vision_clip.write_videofile(output_video_path, codec="libx264")