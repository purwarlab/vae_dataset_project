import numpy as np
import copy
import json
import math
from glob import glob
import scipy.spatial.distance as sciDist
from tqdm import tqdm
import requests
import time
import itertools
import random
import os
import matplotlib.pyplot as plt
# %matplotlib inline
# %config InlineBackend.figure_format = 'svg'
from itertools import islice
from PIL import Image
import re
from path_decomposition import computeSolSteps, linkMajor
from normalize import normalize_data_122223

# Headless simulator version
index = 0 # local server index 
API_ENDPOINT = 'http://localhost:4001/simulation' # NOT THE LS VERSION
API_ENDPOINT_8BAR = 'http://localhost:4001/simulation-8bar' # NOT THE LS VERSION
HEADERS = {"Content-Type": "application/json"}
batchCount = 25 # Send this number of samples to MotionGen each time 
speedscale = 1
steps = 360
minsteps = int(steps*20/360)

# def rotate_curve(curve, phi):
#     infunction_scale = 100
#     # curve is scaled 100 times for numerical accuracy 
#     # incoming curve shape: (n,2)
#     x = curve[:, 0] * infunction_scale
#     y = curve[:, 1] * infunction_scale
#     # Compute the rotated coordinates
#     x_rotated = x * np.cos(phi) - y * np.sin(phi)
#     y_rotated = x * np.sin(phi) + y * np.cos(phi)
#     # Combine the rotated coordinates into a new curve
#     rotated_curve = np.column_stack((x_rotated, y_rotated))
#     return rotated_curve/infunction_scale

def B2T(Bextend):
    n = len(Bextend[0])
    Textend = np.zeros((n,n))

    for i in range(n):
        if Bextend[0][i]:
            Textend[i][i] = 1

    for B in Bextend:
        for i in range(n):
            for j in range(i+1,n):
                if B[i] and B[j]:
                    Textend[i][j] = 1
                    Textend[j][i] = 1
    return Textend.astype(int).tolist()

# Digitization 
def digitize_seq(nums, minlim, maxlim, bin_size=64):
    bins = np.linspace(minlim, maxlim, bin_size-1)
    nums_indices = np.digitize(nums, bins)
    return nums_indices


def get_image_from_point_cloud(points, xylim, im_size, inverted = True, label=None):
    mat = np.zeros((im_size, im_size, 1), dtype=np.uint8)
    x = digitize_seq(points[:,0], -xylim, xylim, im_size)
    if inverted:
        y = digitize_seq(points[:,1]*-1, -xylim, xylim, im_size)
        mat[y, x, 0] = 1
    else:
        y = digitize_seq(points[:,1], -xylim, xylim, im_size)
        mat[x, y, 0] = 1
    return mat

def matmul_jd(jd, mat):
    # input should be (..., ,2)
    # the operation: 
    jd = np.array(jd)
    oldshape = jd.shape
    njd= np.reshape(jd, (-1, 2))
    hc1= np.ones((njd.shape[0], 1))
    njd=np.matrix(np.concatenate([njd, hc1], axis = 1)).transpose()
    njd=np.array((mat*njd).transpose())[:,0:2].reshape(oldshape)
    return njd

def process_mech_051524(jointData, ref_ind, im_size = 64, xylim = 3.5, inverted = True):
    # New JD shape is always (states, joints, dimensions)
    paras = None
    # get matrices according to curve. 
    nc, mat, success = normalize_data_122223(jointData[:,ref_ind,:], scaling = 3.5)
    NR_MG = mat # transform original position to normalized position # NR_MG * jointData = normalized joint data
    MG_NR = np.linalg.inv(NR_MG) 
    

    if success:
        # get binaryImage 
        paras = NR_MG
        matImg = get_image_from_point_cloud(nc, xylim=xylim, im_size=im_size, inverted=inverted)
        return matImg, nc, success
    else: 
        return None, None, success

    
def main(x, mechType, coupIndex):

    coord = np.round(x, 3)

    if 'P' in mechType:
        exampleData = {
            'params': coord.tolist()[:5], 
            'type': mechType, # 'RRRR'
            'speedScale':speedscale, # 1 
            'steps':steps, # 360 
            'relativeTolerance':0.1 
        }
    else:
        exampleData = {
            'params': coord.tolist(), 
            'type': mechType, # 'RRRR'
            'speedScale':speedscale, # 1 
            'steps':steps, # 360 
            'relativeTolerance':0.1 
        }

    errCtr = 0
    batch = []
    from pprint import pprint
    batch.append(exampleData)

    temp = None

    try:
        temp = requests.post(url = API_ENDPOINT, headers=HEADERS, data = json.dumps(batch)).json()
        time.sleep(0.02)
    except ValueError as v:
        for i in range(3):
            time.sleep(2)
            try:
                temp = requests.post(url = API_ENDPOINT, headers=HEADERS, data = json.dumps(batch)).json()
                break
            except ValueError as v2:
                errCtr += 1

    if temp:

        for i in range(len(temp)):
            P = np.array(temp[i]['poses']) 
            
            try:
                # print(P.shape)
                if len(P.shape) >= 1:
                    if P.shape[0] >= minsteps:
                        # do normalization, also get the transformation parameters. 
                        # also the paras are saved instead of MP (M: tranformation matrix, P: points in the matrix)
                        # This is just to avoid decimal difference problem 
                        return process_mech_051524(P, coupIndex)
            except ValueError as v:
                print(v)
            except FileNotFoundError as f:
                print(f)

    else:
        print('HELLLOOOO')

    return None, None, False


def main_8bar(x, B):

    coord = np.round(x, 3)
    _, solSteps, _ = computeSolSteps(linkMajor(B))
    
    exampleData = {
        'T': B2T(B), 
        'solSteps': solSteps, 
        'params': coord.tolist(),
        'speedScale':speedscale, # 1 
        'steps':steps, # 360 
        'relativeTolerance':0.1 
    }

    errCtr = 0
    batch = []
    
    batch.append(exampleData)

    temp = None

    try:
        temp = requests.post(url = API_ENDPOINT_8BAR, headers=HEADERS, data = json.dumps(batch)).json()
        time.sleep(0.02)
    except ValueError as v:
        for i in range(3):
            time.sleep(2)
            try:
                temp = requests.post(url = API_ENDPOINT_8BAR, headers=HEADERS, data = json.dumps(batch)).json()
                break
            except ValueError as v2:
                print(v2)
                errCtr += 1

    if temp:

        for i in range(len(temp)):
            P = np.array(temp[i]['poses']) 
            
            try:
                if len(P.shape) >= 1:
                    if P.shape[0] >= minsteps:
                        # do normalization, also get the transformation parameters. 
                        # also the paras are saved instead of MP (M: tranformation matrix, P: points in the matrix)
                        # This is just to avoid decimal difference problem 
                        return process_mech_051524(P, 10)
            except ValueError as v:
                print(v)
            except FileNotFoundError as f:
                print(f)

    # print(exampleData)
    # print(B)
    # print('Temp is none')

    return None, None, False
