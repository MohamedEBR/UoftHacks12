import numpy as np
import matplotlib.pyplot as plt
import cv2

# Load the image
img_path = "./test_images/comparison.jpeg"
original_img = plt.imread(img_path)

# Custom color transformation matrix
cat_matrix = np.array([
    [0.2, 0.5, 0.3],
    [0.2, 0.7, 0.1],
    [0.1, 0.1, 0.8]
])

# Apply matrix transformation
def apply_matrix(img, A):
    """Apply the color transformation matrix."""
    trans_img = img / 256  # Normalize to [0, 1]
    trans_img = trans_img.dot(A.T)  # Matrix multiplication
    trans_img /= trans_img.max()  # Normalize to [0, 1]
    trans_img *= 255  # Scale back to [0, 255]
    return trans_img.astype('uint8')

# Apply luminance transformation
def luminance_transformation(y_channel):
    """Apply the luminance function: Y' = 80 * log(1 + 0.1 * X)."""
    y_transformed = 80 * np.log(1 + 0.1 * y_channel)
    y_transformed = np.clip(y_transformed, 0, 255)  # Ensure valid range
    return y_transformed.astype('uint8')

# Apply field of view transformation (barrel distortion)
def barrel_distortion(image, k=0.3):
    """Apply barrel distortion to simulate a wider field of view."""
    h, w = image.shape[:2]
    fx = w / 2.0  # Focal length approximation
    fy = h / 2.0
    cx, cy = w / 2.0, h / 2.0

    # Camera matrix
    camera_matrix = np.array([[fx, 0, cx],
                               [0, fy, cy],
                               [0,  0,  1]], dtype=np.float32)

    # Distortion coefficients (k1, k2, p1, p2, k3)
    dist_coeffs = np.array([k, k, 0, 0, 0], dtype=np.float32)

    # Generate distortion map
    new_camera_matrix, roi = cv2.getOptimalNewCameraMatrix(camera_matrix, dist_coeffs, (w, h), 1, (w, h))
    map1, map2 = cv2.initUndistortRectifyMap(camera_matrix, dist_coeffs, None, new_camera_matrix, (w, h), 5)

    # Apply the distortion
    distorted_image = cv2.remap(image, map1, map2, interpolation=cv2.INTER_LINEAR)
    return distorted_image

# Process the image
# Step 1: Apply color transformation
transformed_img = apply_matrix(original_img, cat_matrix)

# Step 2: Convert to YUV color space for luminance transformation
yuv_image = cv2.cvtColor(transformed_img, cv2.COLOR_RGB2YUV)
y_channel = yuv_image[:, :, 0]

# Step 3: Apply luminance transformation
y_channel_transformed = luminance_transformation(y_channel)

# Step 4: Replace the transformed luminance channel
yuv_image[:, :, 0] = y_channel_transformed
transformed_img = cv2.cvtColor(yuv_image, cv2.COLOR_YUV2RGB)

# Step 5: Apply field of view transformation (barrel distortion)
final_img = barrel_distortion(transformed_img, k=0.3)

# Display the result
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
plt.title("Original Image")
plt.imshow(original_img)
plt.axis("off")

plt.subplot(1, 2, 2)
plt.title("Transformed Image with FoV")
plt.imshow(final_img)
plt.axis("off")

plt.show()

# Save the output
output_path = 'transformed_with_fov.jpg'
plt.imsave(output_path, final_img)
