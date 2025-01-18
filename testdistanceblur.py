import numpy as np
import matplotlib.pyplot as plt
import cv2

def apply_matrix(img, A):
    # Apply the transformation matrix
    trans_img = img / 256  # Normalize to [0, 1]
    trans_img = trans_img.dot(A.T)  # Matrix multiplication with transpose
    trans_img /= trans_img.max()  # Normalize to [0, 1]
    trans_img *= 255  # Scale to [0, 255]
    return trans_img.astype('uint8')

def luminance_transformation(y_channel):
    # Apply the luminance function: Y' = 80 * log(1 + 0.1 * X)
    y_transformed = 80 * np.log(1 + 0.1 * y_channel)
    y_transformed = np.clip(y_transformed, 0, 255) 
    return y_transformed.astype('uint8')

def distance_blur(image, max_blur_radius, focal_point=None):
    """
    Apply a distance-based blur effect to an image.

    Parameters:
        image (np.ndarray): Input image array.
        max_blur_radius (int): Maximum radius for the Gaussian blur.
        focal_point (tuple): Coordinates of the focal point (x, y). If None, the center of the image is used.

    Returns:
        np.ndarray: The resulting image with distance-based blur applied.
    """
    # Get image dimensions
    height, width = image.shape[:2]

    # Determine the focal point (default is the center of the image)
    if focal_point is None:
        focal_point = (width // 2, height // 2)

    # Create a distance map
    y_indices, x_indices = np.indices((height, width))
    distances = np.sqrt((x_indices - focal_point[0]) ** 2 + (y_indices - focal_point[1]) ** 2)

    # Normalize distances to the range [0, 1]
    max_distance = np.sqrt((width // 2) ** 2 + (height // 2) ** 2)
    normalized_distances = distances / max_distance

    # Initialize the output image
    blurred_image = image.copy()

    # Apply blur based on distance
    for i in range(1, max_blur_radius + 1):
        # Create a mask for the current blur level
        mask = (normalized_distances >= (i - 1) / max_blur_radius) & (normalized_distances < i / max_blur_radius)
        
        # Apply Gaussian blur with the current radius
        blurred_layer = cv2.GaussianBlur(image, (2 * i + 1, 2 * i + 1), 0)

        # Blend the blurred layer into the output image using the mask
        for c in range(3):  # Iterate over color channels
            blurred_image[..., c][mask] = blurred_layer[..., c][mask]

    return blurred_image

# Main script
img_path = "./test_images/c5.jpeg"
original_img = plt.imread(img_path)

cat_matrix = np.array([
    [0.2, 0.5, 0.3],
    [0.2, 0.7, 0.1],
    [0.1, 0.1, 0.8]
])

# Apply the color transformation
img = apply_matrix(original_img, cat_matrix)

# Convert to YUV and apply luminance transformation
yuv_image = cv2.cvtColor(img, cv2.COLOR_RGB2YUV)
y_channel = yuv_image[:, :, 0]

# Apply luminance transformation
y_channel_transformed = luminance_transformation(y_channel)

# Replace the luminance channel back into the YUV image
yuv_image[:, :, 0] = y_channel_transformed
transformed_img = cv2.cvtColor(yuv_image, cv2.COLOR_YUV2RGB)

# Apply distance blur
blurred_img = distance_blur(transformed_img, max_blur_radius=15)

# Display the final result
plt.figure(figsize=(6, 6))
plt.imshow(blurred_img)
plt.show()

# Save the output
output_path = 'transformed_with_luminance_and_blur.jpg'
plt.imsave(output_path, blurred_img)


