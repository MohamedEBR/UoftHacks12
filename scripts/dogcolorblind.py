import sys
import os
import numpy as np
from PIL import Image, UnidentifiedImageError
from moviepy.editor import VideoFileClip
from scipy.ndimage import gaussian_filter

# Dog transformation matrix
DOG_TRANSFORMATION_MATRIX = np.array([
    [0.625, 0.375, 0.0],
    [0.700, 0.300, 0.0],
    [0.000, 0.300, 0.700]
])

def colour_change(pixels, transformation_matrix):
    return pixels @ transformation_matrix.T

def dog_vision_array_transform(frame):
    frame_float = frame.astype(np.float32) / 255.0
    h, w, c = frame_float.shape
    pixels = frame_float.reshape(-1, c)
    transformed = colour_change(pixels, DOG_TRANSFORMATION_MATRIX)
    transformed = transformed.reshape(h, w, c)
    for channel in range(3):
        transformed[..., channel] = gaussian_filter(transformed[..., channel], sigma=1)
    transformed = np.clip(transformed, 0, 1)
    transformed_uint8 = (transformed * 255).astype(np.uint8)
    return transformed_uint8

def simulate_dog_vision_image(image_path, output_path):
    print(f"Processing image: {image_path}")
    print(f"Saving output to: {output_path}")
    img = Image.open(image_path).convert("RGB")
    img_arr = np.array(img, dtype=float) / 255.0
    h, w, c = img_arr.shape
    pixels = img_arr.reshape(-1, c)
    transformed_pixels = pixels @ DOG_TRANSFORMATION_MATRIX.T
    transformed_img = transformed_pixels.reshape(h, w, c)
    transformed_img = np.clip(transformed_img, 0, 1)
    out_img = Image.fromarray((transformed_img * 255).astype(np.uint8))
    out_img.save(output_path)

def simulate_dog_vision_video(input_video_path, output_video_path):
    print(f"Processing video: {input_video_path}")
    print(f"Saving output to: {output_video_path}")
    clip = VideoFileClip(input_video_path)
    dog_vision_clip = clip.fl_image(dog_vision_array_transform)
    dog_vision_clip.write_videofile(output_video_path, codec="libx264")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python dogcolorblind.py <input_file_path> <output_file_path>")
        sys.exit(1)

    input_file_path = sys.argv[1]
    output_file_path = sys.argv[2]

    try:
        if input_file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            simulate_dog_vision_image(input_file_path, output_file_path)
        elif input_file_path.lower().endswith(('.mp4', '.avi', '.mkv', '.mov')):
            simulate_dog_vision_video(input_file_path, output_file_path)
        else:
            print(f"Unsupported file type: {input_file_path}")
            sys.exit(1)
    except UnidentifiedImageError:
        print(f"Error: {input_file_path} is not a valid image file.")
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)