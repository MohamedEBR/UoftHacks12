import numpy as np
import matplotlib.pyplot as plt
import cv2

img_path = "./test_images/comparison.jpeg"
original_img = plt.imread(img_path)

cat_matrix = np.array([
    [0.2, 0.5, 0.3],
    [0.2, 0.7, 0.1],
    [0.1, 0.1, 0.8]
])

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


img = apply_matrix(original_img, cat_matrix)

yuv_image = cv2.cvtColor(img, cv2.COLOR_RGB2YUV)
y_channel = yuv_image[:, :, 0]

# Apply luminance transformation
y_channel_transformed = luminance_transformation(y_channel)

# Replace the luminance channel back into the YUV image
yuv_image[:, :, 0] = y_channel_transformed

transformed_img = cv2.cvtColor(yuv_image, cv2.COLOR_YUV2RGB)

plt.figure(figsize=(6, 6))
plt.imshow(transformed_img)
plt.show()

output_path = 'transformed_with_luminance.jpg'
plt.imsave(output_path, transformed_img)
