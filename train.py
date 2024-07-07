import torch
from torch.utils.data import  DataLoader, random_split
import pytorch_lightning as pl
from pytorch_lightning.callbacks import ModelCheckpoint
from pytorch_lightning.loggers import WandbLogger
from dataset import SingleDataset
import torchvision.transforms as transforms
from vae import VAE

torch.set_float32_matmul_precision('medium')

batch_size = 1024
latent_dim = 2

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

dataset = SingleDataset(transform=transforms.Compose([transforms.ToTensor(), ]))

dataset_size = len(dataset)
train_size = int(0.8 * dataset_size)
val_size = int(0.1 * dataset_size)
test_size = dataset_size - train_size - val_size

train_dataset, val_dataset, test_dataset = random_split(dataset, [train_size, val_size, test_size])

train_loader = DataLoader(train_dataset, shuffle=True, num_workers=15, batch_size=batch_size)
val_loader = DataLoader(val_dataset, num_workers=15, batch_size=batch_size)
test_loader = DataLoader(test_dataset, num_workers=15, batch_size=batch_size)

model = VAE(latent_dim=latent_dim, batch_size=batch_size)

checkpoint_callback = ModelCheckpoint(
    save_weights_only=True,
    dirpath='weights/',
    monitor='val_loss',
    filename='{epoch}', 
    save_top_k=1)  

wandb_logger = WandbLogger(project='coupler_curve_vae')

if torch.cuda.device_count() == 1: 
    trainer = pl.Trainer(logger=wandb_logger, accelerator="gpu", max_epochs=-1, callbacks=[checkpoint_callback])
elif torch.cuda.device_count() > 1:
    trainer = pl.Trainer(logger=wandb_logger, accelerator="gpu", devices=-1, max_epochs=100, strategy="ddp", callbacks=[checkpoint_callback])
else:
    trainer = pl.Trainer(logger=wandb_logger, accelerator="cpu", callbacks=[checkpoint_callback])
    
# Train the model
trainer.fit(model, train_loader, val_loader)

# Test the model
trainer.test(model, dataloaders=test_loader)