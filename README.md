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
├── dataset.py                              # Contains the SingleDataset class
├── vae.py                                  # Contains the VAE model definition
├── train.py                                # Script for training the VAE
├── plotting_2D_latent_space.py             # Script for visualizing latent space
├── weights/                                # Directory to save/load model checkpoints
│   └── lat_1.ckpt                          # 1D VAE checkpoint file
│   └── lat_2.ckpt                          # 2D VAE checkpoint file
│   └── lat_5.ckpt                          # 4D VAE checkpoint file
│   └── lat_10.ckpt                         # 10D VAE checkpoint file
│   └── lat_25.ckpt                         # 25D VAE checkpoint file
│   └── lat_50.ckpt                         # 50D VAE checkpoint file
├── requirements.txt                        # Required Python packages
├── image-to-z-4bar.ipynb                   # Converting 4-bar CC images to their latent representation
├── image-to-z-6bar.ipynb                   # Converting 6-bar CC images to their latent representation
├── image-to-z-8bar.ipynb                   # Converting 8-bar CC images to their latent representation
├── BSIdict_468.json                        # File that contains the information about the kinematic structure of our mechs
├── KV_468.json                             # File carrying info about our mechs and their enumeration
├── VK_468.json                             # File carrying info about our mechs and their enumeration
├── metrics.py                              # Metric calculation of Chamfer and Ordered distances
├── normalize.py                            # Script for normalization process
├── path_decomposition.py                   # Simulation file
├── server.py                               # Headless server file
├── simulator/                              # Headless server folder
├── headless_main_accuracy.py               # Calculating accuracy results for the test dataset
├── headless_main_novelty.py                # Calculating novelty results for the test dataset
└── README.md                               # Project readme file

## Results

