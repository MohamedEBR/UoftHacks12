import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip
from scipy.ndimage import gaussian_filter
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter

# cat transformation matrix
CAT_TRANSFORMATION_MATRIX = np.array([
    [0.2, 0.5, 0.3],
    [0.2, 0.7, 0.1],
    [0.1, 0.1, 0.8]
])

# dog transformation matrix
DOG_TRANSFORMATION_MATRIX = np.array([
    [0.625, 0.375, 0.0],
    [0.700, 0.300, 0.0],
    [0.000, 0.300, 0.700]
])

# s = c log (1 + ar)
# c is an overall scaling factor
# a is a secondary scale on the original intensity
# log (1 + ar) to avoid log(0)
def luminance(c, a, r):
    return c * np.log(1 + a * r)

# input * transformation matrix (matrix mul)
def colour_change(pixels, transformation_matrix):
    return pixels @ transformation_matrix.T

def fisheye_warp(image, h, w, strength=0.00001):
    """
    Applies a fisheye warp effect to an image.
    
    Parameters:
        image (np.ndarray): Input image array (H x W x C).
        h (int): Height of the image.
        w (int): Width of the image.
        strength (float): Strength of the fisheye effect.

    Returns:
        np.ndarray: The fisheye-warped image.
    """
    # Generate a mesh grid of coordinates
    y_indices, x_indices = np.indices((h, w))
    x_center, y_center = w / 2, h / 2

    # Normalize coordinates to [-1, 1]
    x_norm = (x_indices - x_center) / x_center
    y_norm = (y_indices - y_center) / y_center

    # Compute the distance from the center
    r = np.sqrt(x_norm**2 + y_norm**2)

    # Apply fisheye distortion formula
    theta = np.arctan(r)
    r_fisheye = np.tan(theta * strength) / r
    r_fisheye[np.isnan(r_fisheye)] = 0  # Handle divide-by-zero for r=0 (center of the image)

    x_distorted = x_norm * r_fisheye * x_center + x_center
    y_distorted = y_norm * r_fisheye * y_center + y_center

    # Map coordinates back to pixel indices
    x_distorted = np.clip(x_distorted, 0, w - 1).astype(np.float32)
    y_distorted = np.clip(y_distorted, 0, h - 1).astype(np.float32)

    # Create the fisheye-warped image by remapping pixels
    warped_image = np.zeros_like(image)
    for c in range(3):  # Apply for each channel
        warped_image[..., c] = image[y_distorted.astype(np.int32), x_distorted.astype(np.int32), c]

    return warped_image

def dog_vision_array_transform(frame):
    """
    Applies a rough 'deuteranopia-like' transform to an RGB frame (NumPy array).
    
    returns an array of the same shape/dtype
    """
    frame_float = frame.astype(np.float32) / 255.0

    h, w, c = frame_float.shape
    pixels = frame_float.reshape(-1, c)

    transformed = colour_change(pixels, DOG_TRANSFORMATION_MATRIX)
    transformed = luminance(10, 0.1, transformed)

    transformed = transformed.reshape(h, w, c)  # Reshape back to H x W x C for spatial operations
    for channel in range(3):  # Apply blur channel-wise
        transformed[..., channel] = gaussian_filter(transformed[..., channel], sigma=1)
    
    # Apply fisheye warp
    transformed = fisheye_warp(transformed, h, w, strength=1.5)


    # transformed = warp_fisheye_flat(transformed, h, w)

    # print(transformed)
    # print(transformed.shape)
    # transformed = warp(transformed)

    # get back to output format
    transformed = transformed.reshape(h, w, c)
    transformed = np.clip(transformed, 0, 1)
    transformed_uint8 = (transformed * 255).astype(np.uint8)

    return transformed_uint8


def simulate_dog_vision_video(input_video_path, output_video_path):
    """
    Reads a video, applies the dog-vision color transform to each frame,
    and writes out a new video.
    """
    # Load the video
    clip = VideoFileClip(input_video_path)
    
    # Apply frame-by-frame transform using fl_image
    dog_vision_clip = clip.fl_image(dog_vision_array_transform)
    
    # Write the transformed clip to a file
    dog_vision_clip.write_videofile(output_video_path, codec="libx264")
    
    # Note: you can specify fps=..., audio=..., preset=... etc. in write_videofile()

simulate_dog_vision_video("testvid.mp4", "outputvid.mp4")
