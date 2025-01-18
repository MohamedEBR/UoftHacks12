import numpy as np
from PIL import Image

def simulate_dog_vision(image_path, output_path):
    """
    Approximate dog vision by applying a color-blind simulation transform
    (matrix-based). This uses a rough 'deuteranopia-like' transform.
    """
    # Load the image
    img = Image.open(image_path).convert("RGB")
    img_arr = np.array(img, dtype=float) / 255.0  # Convert to [0,1] float

    # Flatten H x W x 3 into (H*W) x 3 for matrix multiplication
    h, w, c = img_arr.shape
    pixels = img_arr.reshape(-1, c)

    # Approximate matrix for 'deuteranopia-like' simulation
    # Source (one of several references):
    #     Machado et al., "A model for simulation of color vision deficiency and a 
    #     color contrast enhancement technique for dichromats" (2009)
    # This matrix is just an example and may not be a perfect dog vision simulation
    transformation_matrix = np.array([
        [0.625, 0.375, 0.0],
        [0.700, 0.300, 0.0],
        [0.000, 0.300, 0.700]
    ])

    print(pixels)
    print(pixels.shape)

    # Apply the matrix transform
    transformed_pixels = pixels @ transformation_matrix.T

    print(transformed_pixels)
    print(transformed_pixels.shape)

    # Reshape back to image dimensions
    transformed_img = transformed_pixels.reshape(h, w, c)

    # Clip values to [0, 1] just in case
    transformed_img = np.clip(transformed_img, 0, 1)

    # Convert to 8-bit and save
    out_img = Image.fromarray((transformed_img * 255).astype(np.uint8))
    out_img.save(output_path)


simulate_dog_vision("/Users/darma/Downloads/testingimg.jpeg", "dog_vision.jpeg")