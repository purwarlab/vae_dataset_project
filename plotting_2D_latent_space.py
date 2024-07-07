import torch
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader
from torchvision import transforms
from dataset import SingleDataset
from model import VAE
import numpy as np
from sklearn.preprocessing import LabelEncoder

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Assuming you have a trained model saved, load the model
checkpoint_path = "./weights/lat_2.ckpt"
checkpoint = torch.load(checkpoint_path)

model = VAE(2)
model.load_state_dict(checkpoint['state_dict'])
model = model.to(device)
model.eval()

# DataLoader
transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
dataset = SingleDataset(transform=transform)
print(len(dataset))
dataloader = DataLoader(dataset, batch_size=1024, shuffle=False)

# Collect latent representations
latent_representations = []
labels = []

with torch.no_grad():
    for batch in dataloader:
        data, label = batch
        data = data.to(device)
        x = model.encoder(data)
        mean, logvar = x[:, :model.latent_dim], x[:, model.latent_dim:]
        z = model.reparameterize(mean, logvar)
        latent_representations.append(z.cpu().numpy())
        labels.extend(label)

latent_representations = np.concatenate(latent_representations, axis=0)
print(latent_representations.shape)

# Convert labels to numpy array for encoding
labels = np.array(labels)

# Encode labels into integers
label_encoder = LabelEncoder()
encoded_labels = label_encoder.fit_transform(labels)

# Plotting
plt.figure(figsize=(10, 10))
scatter = plt.scatter(latent_representations[:, 0], latent_representations[:, 1], c=encoded_labels, cmap='viridis', alpha=0.5)
plt.title('2D Latent Space of VAE')
plt.xlabel('Latent Dimension 1')
plt.ylabel('Latent Dimension 2')
plt.savefig('latent_space.png')
