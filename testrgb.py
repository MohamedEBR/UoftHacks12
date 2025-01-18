import numpy as np
import matplotlib.pyplot as plt


img_path = "./test_images/comparison.jpeg"


original_img = plt.imread(img_path)




cat_matrix = np.array([
    [0.2, 0.5, 0.3],
    [0.2, 0.7, 0.1],
    [0.1, 0.1, 0.8]
])

# cat_matrix = np.array([
#     [0.6, 0.3, 0.1],  # Increase red contribution, reduce blue
#     [0.4, 0.5, 0.1],  # Balance green with red, slightly less blue
#     [0.2, 0.3, 0.5]   # Reduce blue's self-influence, add green
# ])





def apply_matrix(img,A):
    trans_img = img/256
    trans_img = trans_img.dot(A.T)
    trans_img /= trans_img.max()
    trans_img *= 255
    trans_img = trans_img.astype('uint8')
    return(trans_img)



img = apply_matrix(original_img,cat_matrix)


# create figure to plot image to
plt.figure(figsize=(4,4))
plt.imshow(img)
plt.show()




path = 'transformed.jpg'
plt.imsave(path, img)

