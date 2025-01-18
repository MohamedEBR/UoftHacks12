import numpy as np
from PIL import Image

def simulate_dog_vision(image_path, output_path):
    """
    Approximate dog vision by applying a color-blind simulation transform
    (matrix-based). This uses a rough 'deuteranopia-like' transform.
    """

    img = Image.open(image_path).convert("RGB")
    img_arr = np.array(img, dtype=float) / 255.0  

    h, w, c = img_arr.shape
    pixels = img_arr.reshape(-1, c)

    transformation_matrix = np.array([
        [0.625, 0.375, 0.0],
        [0.700, 0.300, 0.0],
        [0.000, 0.300, 0.700]
    ])

    print(pixels)
    print(pixels.shape)

    transformed_pixels = pixels @ transformation_matrix.T

    print(transformed_pixels)
    print(transformed_pixels.shape)

    transformed_img = transformed_pixels.reshape(h, w, c)

    transformed_img = np.clip(transformed_img, 0, 1)

    out_img = Image.fromarray((transformed_img * 255).astype(np.uint8))
    out_img.save(output_path)


simulate_dog_vision("/Users/darma/Downloads/testingimg.jpeg", "dog_vision.jpeg")