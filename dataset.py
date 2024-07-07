import torch
from torch.utils.data import Dataset
import glob
import os 
import cv2
import numpy as np 
import matplotlib.pyplot as plt

class SingleDataset(Dataset):
    def __init__(self, transform):
        self.imgs_path = 'mechanisms/'
        file_list = glob.glob(self.imgs_path + "*")
        self.data = []
        self.transform = transform
        
        for class_path in file_list:
            class_name = class_path.split("/")[-1]
            img_paths = os.listdir(class_path)
            
            for img_path in img_paths:
                img_path = class_path + '/' + img_path
                self.data.append([img_path, class_name])

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        img_path, class_name = self.data[idx]

        img = cv2.imread(img_path, 0)
        img_tensor = self.transform(img)        

        return img_tensor, img_path[:-4]
