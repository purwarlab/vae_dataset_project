import torch
import torch.nn as nn
import pytorch_lightning as pl

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class Flatten(nn.Module):
    def __init__(self):
        super(Flatten, self).__init__()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: torch.Tensor of shape (batch_size, *, *, *) - input tensor with any number of additional dimensions.
        Returns a torch.Tensor of shape (batch_size, -1) - output tensor with the same batch size but flattened dimensions.
        """
        return x.view(x.size(0), -1)
    
class UnFlatten(nn.Module):
    def __init__(self):
        super(UnFlatten, self).__init__()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: torch.Tensor of shape (batch_size, 1024) - input tensor.
        Returns a torch.Tensor of shape (batch_size, 16, 8, 8) - output tensor reshaped to 16 channels, 8x8 spatial dimensions.
        """
        return x.view(x.size(0), 16, 8, 8)

class Encoder(nn.Module):
    def __init__(self, latent_dim: int):
        super(Encoder, self).__init__()
        
        self.conv_stack = nn.Sequential(
            nn.Conv2d(in_channels=1, out_channels=32, kernel_size=11, stride=1, padding="same"),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(in_channels=32, out_channels=64, kernel_size=5, stride=1, padding="same"),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=1, padding="same"),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            Flatten(),
            nn.Linear(8192, latent_dim*2))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: torch.Tensor of shape (batch_size, 1, 64, 64) - input tensor with 1 channel, 64x64 spatial dimensions.
        Returns a torch.Tensor of shape (batch_size, latent_dim*2) - encoded representation.
        """
        return self.conv_stack(x)
    
class Decoder(nn.Module):
    def __init__(self, latent_dim: int):
        super(Decoder, self).__init__()
        
        self.inverse_conv_stack = nn.Sequential(
            nn.Linear(latent_dim, 1024),
            nn.ReLU(),
            UnFlatten(),
            nn.ConvTranspose2d(in_channels=16, out_channels=128, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(in_channels=128, out_channels=64, kernel_size=5, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(in_channels=64, out_channels=32, kernel_size=11, stride=2, padding=1),
            nn.ReLU(),
            nn.ConvTranspose2d(in_channels=32, out_channels=1, kernel_size=2, stride=1, padding=3))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: torch.Tensor of shape (batch_size, latent_dim) - latent representation.
        Returns a torch.Tensor of shape (batch_size, 1, 64, 64) - reconstructed image.
        """
        return self.inverse_conv_stack(x)

class VAE(pl.LightningModule):
    def __init__(self, latent_dim: int, batch_size: int):
        super().__init__()
        self.latent_dim = latent_dim
        self.batch_size = batch_size

        self.encoder = Encoder(self.latent_dim)
        self.decoder = Decoder(self.latent_dim)
        
    def reparameterize(self, mean: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
        """
        mean: torch.Tensor of shape (batch_size, latent_dim) - mean of the latent distribution.
        logvar: torch.Tensor of shape (batch_size, latent_dim) - log variance of the latent distribution.
        Returns a torch.Tensor of shape (batch_size, latent_dim) - sampled latent vector.
        """
        eps = torch.randn(mean.shape).to(device)
        return eps * torch.exp(logvar * .5) + mean

    def forward(self, x: torch.Tensor) -> tuple:
        """
        x: torch.Tensor of shape (batch_size, 1, 64, 64) - input tensor.
        Returns a tuple of torch.Tensor: 
            - (reconstructed images, mean of the latent distribution, log variance of the latent distribution)
        """
        x = self.encoder(x)
        mean, logvar = x[:, :self.latent_dim], x[:, self.latent_dim:]
        z = self.reparameterize(mean, logvar)
        x = self.decoder(z)
        return x, mean, logvar
    
    def loss_fn(self, recon_x: torch.Tensor, x: torch.Tensor, mu: torch.Tensor, logvar: torch.Tensor) -> tuple:
        """
        recon_x: torch.Tensor of shape (batch_size, 1, 64, 64) - reconstructed images.
        x: torch.Tensor of shape (batch_size, 1, 64, 64) - original images.
        mu: torch.Tensor of shape (batch_size, latent_dim) - mean of the latent distribution.
        logvar: torch.Tensor of shape (batch_size, latent_dim) - log variance of the latent distribution.
        Returns a tuple of torch.Tensor: (total loss, mse loss, kld loss)
        """
        KLD = -0.5 * torch.mean(1 + logvar - mu.pow(2) - logvar.exp())
        mse_loss = nn.MSELoss(reduction='sum')(recon_x, x)
        return mse_loss + KLD, mse_loss, KLD
        
    def training_step(self, batch: tuple, batch_idx: int) -> torch.Tensor:            
        """
        batch: tuple containing (input tensor, target tensor) - training data batch.
        batch_idx: int - index of the batch.
        Returns a torch.Tensor - training loss.
        """
        data, _ = batch
        recon_data, mu, logvar = self.forward(data)

        loss, mse, kld = self.loss_fn(recon_data, data, mu, logvar)       

        self.log('train_loss', loss, batch_size=self.batch_size)
        self.log('mse_loss', mse, batch_size=self.batch_size)
        self.log('kld_loss', kld, batch_size=self.batch_size)
         
        return loss 
    
    def validation_step(self, batch: tuple, batch_idx: int) -> torch.Tensor:
        """
        batch: tuple containing (input tensor, target tensor) - validation data batch.
        batch_idx: int - index of the batch.
        Returns a torch.Tensor - validation loss.
        """
        data, _ = batch
        recon_data, mu, logvar = self.forward(data)

        loss, mse, kld = self.loss_fn(recon_data, data, mu, logvar) 

        self.log('val_loss', loss, sync_dist=True, batch_size=self.batch_size)
        self.log('val_mse_loss', mse, sync_dist=True, batch_size=self.batch_size)
        self.log('val_kld_loss', kld, sync_dist=True, batch_size=self.batch_size)
        
        return loss

    def test_step(self, batch: tuple, batch_idx: int) -> torch.Tensor:
        """
        batch: tuple containing (input tensor, target tensor) - test data batch.
        batch_idx: int - index of the batch.
        Returns a torch.Tensor - test loss.
        """
        data, _ = batch
        recon_data, mu, logvar = self.forward(data)

        loss, mse, kld = self.loss_fn(recon_data, data, mu, logvar) 
        
        return loss
    
    def on_epoch_end(self):
        """
        Logs the validation losses at the end of each epoch.
        """
        val_losses = self.trainer.callback_metrics['val_loss']
        self.log('val_losses', val_losses, on_step=False, on_epoch=True, batch_size=self.batch_size)
        
    def configure_optimizers(self) -> torch.optim.Optimizer:
        """
        Configures the optimizer for the model.
        Returns a torch.optim.Optimizer.
        """
        return torch.optim.Adam(self.parameters(), lr=(0.001))

