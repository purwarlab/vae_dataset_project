# Variational Autoencoder (VAE) Project

This repository contains the implementation of a Variational Autoencoder (VAE) for learning latent representations of data. The project includes data preprocessing, model training, and visualization of the latent space.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Results](#results)

## Introduction

Variational Autoencoders (VAEs) are generative models that learn the underlying distribution of data in a latent space. This project demonstrates the use of VAEs to encode data into a lower-dimensional latent space and visualize the learned representations.

## Prerequisites

- Python 3.7 or higher
- PyTorch
- torchvision
- matplotlib
- scikit-learn
- numpy

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/vae-project.git
   cd vae-project

2. Install dependencies:

    pip install -r requirements.txt

## Usage

## Project Structure

vae-project/
│
├── dataset.py # Defines SingleDataset class
├── vae.py # Defines VAE model
├── train.py # VAE training script
├── plotting_2D_latent_space.py # Visualizes 2D latent space
├── weights/ # Directory for model checkpoints
│ ├── lat_1.ckpt # Checkpoint for 1D VAE
│ ├── lat_2.ckpt # Checkpoint for 2D VAE
│ ├── lat_5.ckpt # Checkpoint for 4D VAE
│ ├── lat_10.ckpt # Checkpoint for 10D VAE
│ ├── lat_25.ckpt # Checkpoint for 25D VAE
│ └── lat_50.ckpt # Checkpoint for 50D VAE
├── requirements.txt # Python package dependencies
├── image-to-z-4bar.ipynb # Converts 4-bar CC images to latent representation
├── image-to-z-6bar.ipynb # Converts 6-bar CC images to latent representation
├── image-to-z-8bar.ipynb # Converts 8-bar CC images to latent representation
├── BSIdict_468.json # Kinematic structure information for mechs
├── KV_468.json # Mech information with enumeration
├── VK_468.json # Mech information with enumeration
├── metrics.py # Calculates Chamfer and Ordered distances
├── normalize.py # Normalization script
├── path_decomposition.py # Simulation file for path decomposition
├── server.py # Headless server script
├── simulator/ # Headless server folder
│ └── headless_main_accuracy.py # Calculates accuracy for test dataset
│ └── headless_main_novelty.py # Calculates novelty for test dataset
└── README.md # Project readme file

## Results

