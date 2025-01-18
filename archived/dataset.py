import pandas as pd
from torch.utils.data import Dataset
from PIL import Image
import os

class VIPDataset(Dataset):
    def __init__(self, csv_file, root_dir, transform=None):
        self.annotations = pd.read_csv(csv_file)
        self.root_dir = root_dir
        self.transform = transform

    def __len__(self):
        return len(self.annotations)

    def __getitem__(self, idx):
        video_path = os.path.join(self.root_dir, self.annotations.iloc[idx]['video_path'])
        label = self.annotations.iloc[idx]['interacting_object']  # Replace with appropriate column
        image = Image.open(video_path).convert("RGB")  # Placeholder, adapt for video frames

        if self.transform:
            image = self.transform(image)

        return image, label
