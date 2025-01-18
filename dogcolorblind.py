import numpy as np
from PIL import Image
from moviepy.editor import VideoFileClip

TRANSFORMATION_MATRIX = np.array([
    [0.625, 0.375, 0.0],
    [0.700, 0.300, 0.0],
    [0.000, 0.300, 0.700]
])

def dog_vision_array_transform(frame):
    """
    Applies a rough 'deuteranopia-like' transform to an RGB frame (NumPy array).
    
    frame shape: (H, W, 3), dtype typically uint8
    returns an array of the same shape/dtype
    """
    # Convert from uint8 [0..255] to float [0..1]
    frame_float = frame.astype(np.float32) / 255.0

    # Flatten H*W x 3 for matrix multiplication
    h, w, c = frame_float.shape
    pixels = frame_float.reshape(-1, c)

    # Apply color matrix
    transformed = pixels @ TRANSFORMATION_MATRIX.T

    # Reshape back
    transformed = transformed.reshape(h, w, c)

    # Clip to [0,1], then convert back to uint8
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

def fisheye_warp_pillow(input_path, output_path, k=0.00005):
    """
    Applies a simple radial 'fisheye' (barrel) distortion to an image using Pillow + NumPy.
    
    :param input_path:  Path to the input image (any format Pillow supports).
    :param output_path: Path to the output distorted image.
    :param k:           Distortion coefficient. Positive => barrel/fisheye,
                        the larger the value, the stronger the effect.
    """
    img_pil = Image.open(input_path).convert("RGB")
    img_arr = np.array(img_pil)
    
    h, w = img_arr.shape[:2]
    cx, cy = w / 2, h / 2  # image center
    
    output_arr = np.zeros_like(img_arr)
    
    r_max = np.sqrt(cx*cx + cy*cy)
    
    for y_out in range(h):
        for x_out in range(w):

            x = x_out - cx
            y = y_out - cy
            
            r = np.sqrt(x*x + y*y)
            r_norm = r / r_max  # in [0..1]
            
            r_distorted_norm = r_norm * (1 + k * (r_norm**2))
            
            r_distorted = r_distorted_norm * r_max
            
            if r != 0:
                scale = r_distorted / r
            else:
                scale = 1.0 
            
            x_in = cx + x * scale
            y_in = cy + y * scale
            
            if 0 <= x_in < w and 0 <= y_in < h:
                xi = int(round(x_in))
                yi = int(round(y_in))
                output_arr[y_out, x_out] = img_arr[yi, xi]
            else:
                pass
    
    out_pil = Image.fromarray(output_arr)
    out_pil.save(output_path)

# --- Example usage ---
if __name__ == "__main__":
    input_file = "apple.jpg"
    output_file = "fisheye_out.jpg"
    fisheye_warp_pillow(input_file, output_file, k=0.05)
    print(f"Saved fisheye-distorted image to {output_file}")
