import torch

model_path = "./egopet_model.pth"


checkpoint = torch.load(model_path, map_location=torch.device('cpu'))

print(type(checkpoint))

# print(checkpoint)

for key in checkpoint.keys():
    print(key)

print(checkpoint['args'])



import torch
import torch.nn as nn
from timm.models.vision_transformer import VisionTransformer

class FullMaskedVideoModel(nn.Module):
    def __init__(self, img_size=224, patch_size=16, embed_dim=768, depth=12, num_heads=12, decoder_depth=2):
        super().__init__()

        # Vision Transformer Encoder (Backbone)
        self.encoder = VisionTransformer(
            img_size=img_size, patch_size=patch_size, embed_dim=embed_dim,
            depth=depth, num_heads=num_heads, mlp_ratio=4.0, qkv_bias=True
        )

        # Positional Embeddings
        self.pos_embed_img = nn.Parameter(torch.zeros(1, (img_size // patch_size) ** 2 + 1, embed_dim))
        self.pos_embed_vid = nn.Parameter(torch.zeros(1, (img_size // patch_size) ** 2 + 1, embed_dim))

        # Mask Tokens
        self.mask_token_img = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.mask_token_vid = nn.Parameter(torch.zeros(1, 1, embed_dim))

        # Separate Decoders for Images and Videos
        self.decoder_img = self._build_decoder(embed_dim, decoder_depth)
        self.decoder_vid = self._build_decoder(embed_dim, decoder_depth)

        # Down-sampling layers
        self.down_img = nn.Linear(embed_dim, embed_dim)
        self.down_vid = nn.Linear(embed_dim, embed_dim)

    def _build_decoder(self, embed_dim, decoder_depth):
        """Build a lightweight decoder with transformer blocks."""
        layers = []
        for _ in range(decoder_depth):
            layers.append(nn.TransformerEncoderLayer(d_model=embed_dim, nhead=12, dim_feedforward=4 * embed_dim))
        return nn.Sequential(*layers)

    def forward(self, x, mask=None, input_type="img"):
        """
        Args:
            x: Input tensor (B, N, C).
            mask: Mask tensor (B, N, 1) for masked tokens.
            input_type: "img" or "vid" to specify input type.
        """
        if input_type == "img":
            pos_embed = self.pos_embed_img
            mask_token = self.mask_token_img
            decoder = self.decoder_img
            down = self.down_img
        elif input_type == "vid":
            pos_embed = self.pos_embed_vid
            mask_token = self.mask_token_vid
            decoder = self.decoder_vid
            down = self.down_vid
        else:
            raise ValueError("Invalid input_type. Choose 'img' or 'vid'.")

        # Add positional embeddings
        x = x + pos_embed

        # Apply masking if provided
        if mask is not None:
            x = torch.where(mask, mask_token.expand_as(x), x)

        # Pass through the encoder
        features = self.encoder.patch_embed(x)  # Extract features
        features = self.encoder.blocks(features)  # Transformer blocks
        features = self.encoder.norm(features)  # Normalize

        # Down-sample and decode
        features = down(features)
        decoded = decoder(features)
        return decoded


model = FullMaskedVideoModel()


def resize_positional_embeddings(checkpoint, model):
    """
    Resize positional embeddings in the checkpoint to match the model's expected size.
    """
    def interpolate_embeddings(pos_embed_checkpoint, target_length):
        # Extract class token and spatial tokens
        cls_token = pos_embed_checkpoint[:, :1, :]  # [1, 1, 768]
        spatial_tokens = pos_embed_checkpoint[:, 1:, :]  # [1, N, 768]
        
        # Determine original size (sqrt for spatial tokens)
        num_patches = spatial_tokens.size(1)
        orig_size = int(num_patches ** 0.5)
        target_size = int((target_length - 1) ** 0.5)
        
        # Reshape to grid for interpolation
        spatial_tokens = spatial_tokens.reshape(1, orig_size, orig_size, -1).permute(0, 3, 1, 2)  # [1, 768, H, W]
        
        # Interpolate to target size
        spatial_tokens = torch.nn.functional.interpolate(spatial_tokens, size=(target_size, target_size), mode="bilinear", align_corners=False)
        
        # Flatten back to sequence
        spatial_tokens = spatial_tokens.permute(0, 2, 3, 1).reshape(1, -1, spatial_tokens.size(1))  # [1, N', 768]
        
        # Combine class token and resized spatial tokens
        return torch.cat((cls_token, spatial_tokens), dim=1)

    # Resize positional embeddings for images
    pos_embed_img = checkpoint["model"]["pos_embed_img"]
    checkpoint["model"]["pos_embed_img"] = interpolate_embeddings(pos_embed_img, model.pos_embed_img.size(1))
    
    # Resize positional embeddings for videos
    pos_embed_vid = checkpoint["model"]["pos_embed_vid"]
    checkpoint["model"]["pos_embed_vid"] = interpolate_embeddings(pos_embed_vid, model.pos_embed_vid.size(1))

    return checkpoint
# Load the checkpoint
checkpoint = resize_positional_embeddings(checkpoint, model)


# Load the model state_dict, ignoring missing/mismatched keys
model.load_state_dict(checkpoint["model"], strict=False)

print("Model successfully loaded with the following skipped keys:")
for key in checkpoint["model"]:
    if key not in model.state_dict():
        print(f" - {key}")






