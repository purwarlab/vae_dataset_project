import os
import torch
import numpy as np
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader
from torchvision import transforms
from sklearn.preprocessing import LabelEncoder

from dataset import SingleDataset  # Assuming your dataset is defined in dataset.py
from vae import VAE  # Assuming your VAE model is defined in vae.py

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the pre-trained model
latent_dim = 2
checkpoint_path = f"./weights/lat_{latent_dim}.ckpt"
checkpoint = torch.load(checkpoint_path)

model = VAE(latent_dim)
model.load_state_dict(checkpoint['state_dict'])
model = model.to(device)
model.eval()

dataset = SingleDataset(transform=transforms.Compose([transforms.ToTensor(), ]))

# DataLoader
dataloader = DataLoader(dataset, batch_size=1024, shuffle=False)

# Collect latent representations and labels
latent_representations = []
labels = []

with torch.no_grad():
    for data, label in dataloader:
        data = data.to(device)
        
        # Encode data
        x = model.encoder(data)
        mean, logvar = x[:, :latent_dim], x[:, latent_dim:]
        z = model.reparameterize(mean, logvar)
        
        latent_representations.append(z.cpu().numpy())
        labels.extend(label)

# Convert to numpy arrays
latent_representations = np.concatenate(latent_representations, axis=0)
labels = np.array(labels)

# Encode labels
label_encoder = LabelEncoder()
encoded_labels = label_encoder.fit_transform(labels)

# Plotting
plt.figure(figsize=(10, 10))
scatter = plt.scatter(
    latent_representations[:, 0], latent_representations[:, 1], 
    c=encoded_labels, cmap='viridis', alpha=0.5
)
plt.title('2D Latent Space of VAE')
plt.xlabel('Latent Dimension 1')
plt.ylabel('Latent Dimension 2')
plt.colorbar(scatter, label='Encoded Labels')
plt.savefig('latent_space.png')
plt.show()
