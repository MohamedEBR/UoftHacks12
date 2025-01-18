import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip

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
    transformed = luminance(10, 0.1, transformed)
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

simulate_dog_vision_video("/Users/darma/downloads/testvid.mp4", "outputvid.mp4")
