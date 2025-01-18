import numpy as np
from PIL import Image
from moviepy import VideoFileClip
from scipy.ndimage import gaussian_filter
from moviepy import VideoFileClip

from flask import Flask, send_file, jsonify, request

app = Flask(__name__)


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

# def fisheye_warp(image, h, w, strength=0.00001):
#     """
#     Applies a fisheye warp effect to an image.
    
#     Parameters:
#         image (np.ndarray): Input image array (H x W x C).
#         h (int): Height of the image.
#         w (int): Width of the image.
#         strength (float): Strength of the fisheye effect.

#     Returns:
#         np.ndarray: The fisheye-warped image.
#     """
#     # Image dimensions
#     height, width = image.shape[:2]
    
#     # Default focal point is the image center
#     if focal_point is None:
#         focal_point = (width // 2, height // 2)
    
#     # Create a distance map from each pixel to the focal point
#     y_indices, x_indices = np.indices((height, width))
#     distances = np.sqrt((x_indices - focal_point[0])**2 + (y_indices - focal_point[1])**2)
    
#     # Normalize distances to [0, 1]
#     max_distance = np.sqrt((width // 2) ** 2 + (height // 2) ** 2)
#     normalized_distances = distances / max_distance
    
#     # Prepare an output copy
#     blurred_image = image.copy()
    
#     # For each blur level i in [1..max_blur_radius]
#     for i in range(1, max_blur_radius + 1):
#         # Determine which pixels belong to the "band" for this blur level
#         mask = (normalized_distances >= (i - 1) / max_blur_radius) & \
#                (normalized_distances < i / max_blur_radius)
        
#         # Generate a blurred version with current "radius" i
#         # Note: `sigma=i` does not perfectly match OpenCV's (2*i+1) kernel size,
#         # but is generally similar. Adjust sigma if you want a closer match.
#         blurred_layer = np.zeros_like(image)
        
#         # Apply gaussian_filter to each channel
#         for c in range(3):
#             blurred_layer[..., c] = gaussian_filter(image[..., c], sigma=i)
        
#         # Blend the blurred layer into the output using the mask
#         for c in range(3):
#             blurred_image[..., c][mask] = blurred_layer[..., c][mask]
    
#     return blurred_image


# def warp_fisheye_flat(pixels, h, w, distortion_strength=0.3):
#     """
#     Applies a simple 'fisheye'/barrel distortion to an image stored in a (N, 3) array.

#     :param pixels: Input flattened image of shape (N, 3) in [R, G, B] order.
#     :param h: Height of the image (so N = h*w).
#     :param w: Width of the image.
#     :param distortion_strength: Controls how strongly edges are warped outward.
#     :return: A new flattened array of shape (N, 3) with the fisheye warp applied.
#     """

#     # Create an output array (same shape, initialized to black)
#     out = np.zeros_like(pixels, dtype=pixels.dtype)

#     # Precompute center and max radius
#     cx, cy = w / 2.0, h / 2.0
#     max_r = np.sqrt(cx**2 + cy**2)

#     for y in range(h):
#         for x in range(w):
#             # Index of this pixel in the flat array
#             i_in = y * w + x

#             # Shift to center
#             dx = x - cx
#             dy = y - cy
#             r = np.sqrt(dx * dx + dy * dy)
            
#             # Angle
#             if r == 0:
#                 theta = 0.0
#             else:
#                 theta = np.arctan2(dy, dx)
            
#             # Normalize radius to [0..1]
#             r_norm = r / max_r

#             # Apply a barrel distortion function, e.g. r^(1 + k)
#             new_r_norm = r_norm ** (1 + distortion_strength)
#             new_r = new_r_norm * max_r

#             # Convert polar -> Cartesian
#             new_x = cx + new_r * np.cos(theta)
#             new_y = cy + new_r * np.sin(theta)

#             # Round to nearest integer pixel
#             new_xi = int(round(new_x))
#             new_yi = int(round(new_y))

#             # Place the original pixel's color into new location if valid
#             if 0 <= new_xi < w and 0 <= new_yi < h:
#                 i_out = new_yi * w + new_xi
#                 out[i_out] = pixels[i_in]

#     return out


def dog_vision_array_transform(frame):
    """
    Applies a rough 'deuteranopia-like' transform to an RGB frame (NumPy array).
    
    returns an array of the same shape/dtype
    """
    frame_float = frame.astype(np.float32) / 255.0

    h, w, c = frame_float.shape
    pixels = frame_float.reshape(-1, c)

    transformed = colour_change(pixels, DOG_TRANSFORMATION_MATRIX)
    # transformed = luminance(10, 0.1, transformed)

    transformed = transformed.reshape(h, w, c)  # Reshape back to H x W x C for spatial operations
    for channel in range(3):  # Apply blur channel-wise
        transformed[..., channel] = gaussian_filter(transformed[..., channel], sigma=1)
    
    # # Apply fisheye warp
    # transformed = fisheye_warp(transformed, h, w, strength=1.5)

    # get back to output format
    transformed = transformed.reshape(h, w, c)
    transformed = np.clip(transformed, 0, 1)
    transformed_uint8 = (transformed * 255).astype(np.uint8)

    return transformed_uint8


def cat_vision_array_transform(frame):
    """
    Applies a rough 'deuteranopia-like' transform to an RGB frame (NumPy array).
    
    returns an array of the same shape/dtype
    """
    frame_float = frame.astype(np.float32) / 255.0

    h, w, c = frame_float.shape
    pixels = frame_float.reshape(-1, c)

    transformed = colour_change(pixels, CAT_TRANSFORMATION_MATRIX)
    transformed = luminance(80, 0.1, transformed)

    transformed = transformed.reshape(h, w, c)  # Reshape back to H x W x C for spatial operations
    for channel in range(3):  # Apply blur channel-wise
        transformed[..., channel] = gaussian_filter(transformed[..., channel], sigma=1)
    
    # # Apply fisheye warp
    # transformed = fisheye_warp(transformed, h, w, strength=1.5)

    # get back to output format
    transformed = transformed.reshape(h, w, c)
    transformed = np.clip(transformed, 0, 1)
    transformed_uint8 = (transformed * 255).astype(np.uint8)

    return transformed_uint8



def cat_vision_array_transform(frame):

    frame_float = frame.astype(np.float32) / 255.0

    h, w, c = frame_float.shape
    pixels = frame_float.reshape(-1, c)

    transformed = colour_change(pixels, CAT_TRANSFORMATION_MATRIX)
    transformed = luminance(10, 0.1, transformed)

    transformed = transformed.reshape(h, w, c)  # Reshape back to H x W x C for spatial operations
    for channel in range(3):  # Apply blur channel-wise
        transformed[..., channel] = gaussian_filter(transformed[..., channel], sigma=1)

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


def simulate_cat_vision_video(input_video_path, output_video_path):
    """
    Reads a video, applies the dog-vision color transform to each frame,
    and writes out a new video.
    """
    # Load the video
    clip = VideoFileClip(input_video_path)
    
    # Apply frame-by-frame transform using fl_image
    dog_vision_clip = clip.fl_image(cat_vision_array_transform)
    
    # Write the transformed clip to a file
    dog_vision_clip.write_videofile(output_video_path, codec="libx264")

simulate_dog_vision_video("testvid.mp4", "dogvid.mp4")

simulate_cat_vision_video("testvid.mp4", "catvid.mp4")
