import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
from dataset import VIPDataset  # Assuming this is the dataset class from the repo
from model import VisionTransformer  # Assuming this is the model class from the repo
import os

# Configurations
EGOPET_DIR = 'your_path/egopet/training_and_validation_test_set'
CSV_PATH = './csv/'
FINETUNE_PATH = './egopet_model.pth'
OUTPUT_DIR = './logs_dir/mvd_vit_base_with_vit_base_teacher_egopet/finetune_on_object_interaction'
BATCH_SIZE = 64
EPOCHS = 15
LEARNING_RATE = 5e-4
WEIGHT_DECAY = 0.05
INPUT_SIZE = 224
NUM_FRAMES = 8
NUM_SEC = 2
FPS = 4
OBJECT_INTERACTION_RATIO = 0.5
ALPHA = 1
NUM_WORKERS = 5
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Data Preprocessing
transform = transforms.Compose([
    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

train_dataset = VIPDataset(csv_file=os.path.join(CSV_PATH, 'object_interaction_train.csv'), root_dir=EGOPET_DIR, transform=transform)
val_dataset = VIPDataset(csv_file=os.path.join(CSV_PATH, 'object_interaction_validation.csv'), root_dir=EGOPET_DIR, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=NUM_WORKERS)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=NUM_WORKERS)

# Load Pretrained Model
model = VisionTransformer(num_classes=18)  # Adjust for the number of interaction classes
checkpoint = torch.load(FINETUNE_PATH, map_location=DEVICE)
model.load_state_dict(checkpoint, strict=False)  # Load the pretrained weights partially
model.to(DEVICE)

# Define Loss and Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)

# Training Function
def train_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for inputs, labels in loader:
        inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    return running_loss / total, 100.0 * correct / total

# Validation Function
def validate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * inputs.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return running_loss / total, 100.0 * correct / total

# Training Loop
for epoch in range(EPOCHS):
    train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer)
    val_loss, val_acc = validate(model, val_loader, criterion)

    print(f"Epoch {epoch+1}/{EPOCHS}")
    print(f"Train Loss: {train_loss:.4f}, Train Accuracy: {train_acc:.2f}%")
    print(f"Validation Loss: {val_loss:.4f}, Validation Accuracy: {val_acc:.2f}%")

    # Save the model after every epoch
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    torch.save(model.state_dict(), os.path.join(OUTPUT_DIR, f"vip_model_epoch_{epoch+1}.pth"))

print("Training Complete. Model saved to:", OUTPUT_DIR)



