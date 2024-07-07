import numpy as np
from datasetProcess import getMech, stackMechs, getBSI
from normalize import normalize_data_122223, matmul_jd
from sklearn.neighbors import KDTree
import json 
import torch
from vae import VAE
import cv2
from PIL import Image
import os
import bezier
from server import main as server_main
from server import main_8bar as server_main_8bar
from metrics import batch_chamfer_distance
import matplotlib.pyplot as plt
import os

def decode(mechErrors, bigZ_indices, list_indices, original_indices, param1):
    solutions = []
    ctr = 0
    for count, bigZ_index in enumerate(bigZ_indices):
        BSIpc = getMech(bigZ_index, list_indices, original_indices, param1)
        BSIpc["error"] = mechErrors[count]
        solutions.append(BSIpc)
        ctr += 1
    result = {"version": "1.1.0", "solutions": solutions} # 1.0.0 was using the entire set. 1.1 is using partially 
    return result

def bezier_curve(control_points, num_points=100):
    curve = bezier.Curve(control_points.T, degree=len(control_points) - 1)
    s_vals = np.linspace(0.0, 1.0, num_points)
    return curve.evaluate_multi(s_vals).T

indexPack = stackMechs(['all']) 
kdt = KDTree(np.array(indexPack[0]))

latent_dim = 10

# Initialization of Neural Network 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
checkpoint_path = f"./weights/lat_{latent_dim}.ckpt"
checkpoint = torch.load(checkpoint_path)
model = VAE(latent_dim)
model.load_state_dict(checkpoint['state_dict'])
model = model.to(device)
model.eval()
knn = 500

def query(img_name=None):
    # img_name = '2.011 5.802 -6.261 -7.036 -4.587 9.323 -1.316 7.382 -2.644 2.41 RRRR -0.315 0.649 -3.209 0.649 0.315 0.928 0. 0. 1. .jpg'

    matImg = cv2.imread(img_name, cv2.IMREAD_GRAYSCALE) / 255

    img_name = img_name.split('\\')[1]
    input_string = img_name.split('/')[-1].split('.j')[0] 
    parts = input_string.split()

    # output_dir = os.path.join('./query_outputs/', input_string)

    floats_before = []
    floats_after = []
    letter_string = None
    
    # Iterate over parts to separate floats and the letter string
    for part in parts:
        try:
            # Try to convert part to float
            num = float(part)
            # Add to floats_before if letter_string is not yet found
            if letter_string is None:
                floats_before.append(num)
            else:
                floats_after.append(num)
        except ValueError:
            # If conversion fails, this part is the letter string
            letter_string = part
    
    if len(floats_after) == 6:
            floats_after = floats_after + [0, 0, 1]
    
    floats_before = np.array(floats_before).reshape((-1, 2))
    param1 = np.matrix(floats_after).reshape((3, 3))
    mechType = letter_string.strip()
    ref_points = None

    bsi = getBSI(mechType)

    if mechType.startswith('Type'):
        _, ref_points, success = server_main_8bar(floats_before.tolist(), bsi['B'])
    else:
        _, ref_points, success = server_main(floats_before.tolist(), mechType, bsi['c'].index(1))
    
    mechs = {}
    mechs_count = {}

    if success: 
        ref_points = np.array(ref_points)
        
        # Get z of the path image
        images = (
            torch.from_numpy(np.array([[matImg]])).float().to(device)
        )

        x = model.encoder(images)
        mean, logvar = x[:, : model.latent_dim], x[:, model.latent_dim :]
        z = model.reparameterize(mean, logvar)
        z = z.cpu().detach().numpy()

        # Search and get mechanism indicies
        # kdt, package = selectTree(mechType) # types of mechanisms desired not implemented as Wei did not make UIs for this function 
        bigZdata, list_indices, original_indices = indexPack
        dist, ind = kdt.query(z.reshape((1, -1)), k=knn)
        mechErrors = dist[0]
        bigZ_indices = ind[0]
        result = decode(mechErrors, bigZ_indices, list_indices, original_indices, param1)
        
        try:
            ref_points, _, _ = normalize_data_122223(ref_points)
            ref_points_shape = ref_points.shape[0]

            for res in result['solutions']:
                if res['mech'].startswith('Type'):
                    _, p, success = server_main_8bar(res['p'], res['B'])
                else:
                    _, p, success = server_main(res['p'], res['mech'], res['c'].index(1))

                if success:
                    p, _, _ = normalize_data_122223(p)

                    if ref_points_shape != p.shape[0]:
                        if ref_points_shape > p.shape[0]:
                            p = bezier_curve(p, num_points=ref_points_shape)
                        else:
                            ref_points = bezier_curve(ref_points, num_points=p.shape[0])
                            ref_points_shape = p.shape[0]

                    ref_points_copy = np.reshape(ref_points, (1, ref_points_shape, ref_points.shape[1]))
                    p_array = np.array(p)  # Ensure p is a numpy array
                    ref_points_tensor = torch.tensor(ref_points_copy)  # Convert to tensor
                    p_tensor = torch.tensor(p_array)  # Convert to tensor

                    cd = batch_chamfer_distance(ref_points_tensor, p_tensor.unsqueeze(0))

                if cd is None:
                    continue

                if cd < 0.20:
                    if res['mech'] in mechs.keys():
                        mechs[res['mech']].append(res['p'])
                        mechs_count[res['mech']] += 1
                    else:
                        mechs[res['mech']] = [res['p']]
                        mechs_count[res['mech']] = 1

                else:
                    continue
        except:
            pass

    novel_mechs = {}

    for key in mechs:
        mechanisms = mechs[key]
        to_remove = set()
        n = len(mechanisms)

        for i in range(n):
            if i in to_remove:
                continue
            for j in range(i + 1, n):
                if j in to_remove:
                    continue
                diff = l2_difference(mechanisms[i], mechanisms[j])
                if diff < 10:
                    to_remove.add(j)

        filtered_mechanisms = [mech for idx, mech in enumerate(mechanisms) if idx not in to_remove]

        novel_mechs[key] = filtered_mechanisms
    
    for key in novel_mechs:
        if key in global_novel_mechs:
            global_novel_mechs[key] += len(novel_mechs[key])
        else:
            global_novel_mechs[key] = len(novel_mechs[key])

def l2_difference(joints1, joints2):
    return np.sqrt(np.sum((np.asarray(joints1) - np.asarray(joints2)) ** 2, axis=1)).mean()

global_novel_mechs = {}

for images in os.listdir('testing')[:100]:
    images = os.path.join('testing', images)
    query(images)

sorted_results = dict(sorted(global_novel_mechs.items(), key=lambda item: item[1]))

mechanisms = list(global_novel_mechs.keys())
frequencies = list(global_novel_mechs.values())

# Plotting the bar chart
plt.figure(figsize=(15, 10))
plt.bar(mechanisms, frequencies, color='skyblue')
plt.xlabel('Mechanism Types')
plt.ylabel('Frequencies')
plt.title('Frequency of Each Mechanism Type')
plt.xticks(rotation=90)  # Rotate x-axis labels for better readability
plt.tight_layout()  # Adjust layout to make room for the rotated x labels
plt.savefig('mechanism_frequencies.png')
plt.show()

print(sorted_results)
print(len(global_novel_mechs))
print(sum(global_novel_mechs.values()))