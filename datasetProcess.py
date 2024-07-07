import json
import numpy as np
from transformation import matchJD2toJD1
import os

# Open the JSON file in read mode
with open('BSIdict_468.json', 'r') as file:
    # Load the JSON data into a Python dictionary
    BSIdict_468 = json.load(file)

with open('KV_468.json', 'r') as file2:
    # Load the JSON data into a Python dictionary
    mechStackKV = json.load(file2)

with open('VK_468.json', 'r') as file3:
    # Load the JSON data into a Python dictionary
    mechStackVK = json.load(file3)


four_bar = ['RRRR', 'RRRP', 'RRPR', 'PRPR'] 

six_bar  = ['Watt1T1A1', 'Watt1T2A1', 'Watt1T3A1', 'Watt1T1A2', 'Watt1T2A2', 'Watt1T3A2', 
            'Watt2T1A1', 'Watt2T2A1', 'Watt2T1A2', 'Watt2T2A2', 'Steph1T1', 'Steph1T2',
            'Steph1T3', 'Steph2T1A1', 'Steph2T2A1', 'Steph2T2A2', 'Steph3T1A1', 'Steph3T2A1', 
            'Steph3T1A2', 'Steph3T2A2', 'Steph2T1A2']

eight_bar = ['Type824-0', 'Type822-13', 'Type814-18', 'Type824-9', 'Type812-2', 'Type817-6', 'Type821-5', 'Type812-6', 'Type821-4', 'Type822-19', 'Type816-4', 'Type823-0', 'Type825-5', 'Type824-8', 'Type817-5', 'Type815-5', 'Type831-3', 'Type814-12', 'Type814-3', 'Type817-8', 'Type822-11', 'Type823-14', 'Type823-2', 'Type822-10', 'Type821-8', 'Type824-3', 'Type814-17', 'Type814-19', 'Type824-2', 'Type821-6', 'Type814-7', 'Type823-12', 'Type823-8', 'Type822-15', 'Type824-5', 'Type817-3', 'Type815-4', 'Type825-0', 'Type811-3', 'Type822-18', 'Type814-9', 'Type814-6', 'Type824-12', 'Type817-2', 'Type822-1', 'Type814-1', 'Type823-4', 'Type813-0', 'Type816-6', 'Type817-9', 'Type824-13', 'Type822-14', 'Type811-1', 'Type811-4', 'Type819-0', 'Type819-1', 'Type824-1', 'Type825-4', 'Type812-1', 'Type815-7', 'Type822-5', 'Type824-4', 'Type821-3', 'Type815-8', 'Type817-4', 'Type814-5', 'Type814-13', 'Type818-3', 'Type815-2', 'Type815-6', 'Type832-2', 'Type816-5', 'Type817-1', 'Type814-16', 'Type825-2', 'Type814-15', 'Type824-11', 'Type831-1', 'Type824-15', 'Type823-9', 'Type812-5', 'Type815-0', 'Type821-7', 'Type817-7', 'Type812-7', 'Type821-9', 'Type819-2', 'Type816-10', 'Type821-0', 'Type812-3', 'Type823-15', 'Type814-0', 'Type825-1', 'Type823-13', 'Type816-2', 'Type817-10', 'Type825-3', 'Type813-2', 'Type822-4', 'Type822-17', 'Type823-6', 'Type822-6', 'Type823-5', 'Type814-11', 'Type821-1', 'Type816-8', 'Type818-2', 'Type822-0', 'Type816-0', 'Type814-4', 'Type822-8', 'Type822-9', 'Type823-7', 'Type822-2', 'Type816-9', 'Type815-3', 'Type824-6', 'Type816-7', 'Type815-9', 'Type823-10', 'Type818-0', 'Type823-1', 'Type814-10', 'Type832-3', 'Type812-0', 'Type832-1', 'Type811-2', 'Type814-14', 'Type831-0', 'Type822-16', 'Type822-7', 'Type824-14', 'Type831-2', 'Type813-1', 'Type822-12', 'Type832-4', 'Type816-11', 'Type832-0', 'Type811-0', 'Type822-3', 'Type814-2', 'Type824-10', 'Type812-4', 'Type818-1', 'Type816-3', 'Type824-7', 'Type814-8', 'Type823-3', 'Type817-0', 'Type815-1', 'Type821-2', 'Type816-1', 'Type823-11']

prefix = '06202024-' 
directory = './outputs-'

# These fixes should not appear at all. 
# Remove this after Wei's fix. (or not? The last number in S determines which link the slot is)
BSIdict_468['RRRP']['S'] = [[2, 5, 3, 3]] 
BSIdict_468['RRPR']['S'] = [[2, 5, 3, 3], [2, 6, 3, 3]] 
BSIdict_468['PRPR']['S'] = [[0, 1, 2, 0], [1, 3, 4, 1]] 


def getFileString(mechString, filetype = 'z', prefix = prefix, kv = mechStackKV, directory = directory):
    indexString = kv[mechString]
    return directory + filetype + '/' + prefix + filetype + '-' + str(indexString) + '.npy'


def stackMechs(selections):
    # Stack all necessary data
    selections = set(selections)
    if any('all' in tup for tup in selections):  # if that element is in selections 
        selections = set(list(selections) + four_bar + six_bar + eight_bar)
        selections.remove('all')
    if any('four_bar' in tup for tup in selections):  # if that element is in selections 
        selections = set(list(selections) + four_bar)
        selections.remove('four_bar')
    if any('six_bar' in tup for tup in selections):  # if that element is in selections 
        selections = set(list(selections) + six_bar)
        selections.remove('six_bar')
    if any('eight_bar' in tup for tup in selections):  # if that element is in selections 
        selections = set(list(selections) + eight_bar)
        selections.remove('eight_bar')
    fileStringsZ = []
    #print(selections)
    for mechString in selections: 
        #print(mechString)
        fileStringsZ.append(getFileString(mechString))
    
    bigZ = []
    list_indices = []
    original_indices = []

    for fileStringZ in fileStringsZ: 
        try:
            if os.path.exists(fileStringZ):
                data = np.load(fileStringZ).tolist()
                bigZ = bigZ + data
                list_indices = list_indices + [int(fileStringZ.split('-z-')[-1].split('.npy')[0])] * len(data)
                original_indices = original_indices + list(range(len(data)))
            else:
                print(f"File '{fileStringZ}' does not exist, skipping.")
        except Exception as e:
            print(f"An error occurred: {e}")

    return bigZ, list_indices, original_indices


localsave = True #if you want to test 
# Get the corresponding mechanism after query 
def getMech(bigZ_index, list_indices, original_indices, param1, BSIdict = BSIdict_468, vk = mechStackVK, saveToLocal = localsave): 
    mechString = vk[str(int(list_indices[bigZ_index]))]
    pos  = original_indices[bigZ_index]
    fileString = getFileString(mechString, filetype = 'encoded')
    pack = np.load(fileString)[pos, :]
    param2 = np.array(pack[-9:])
    mechKey = vk[str(int(pack[-10]))] # -10 because the transformation matrix size is 3x3 
    jd2 = np.array(pack[:-10]).reshape((-1, 2))
    pN = matchJD2toJD1(jd2, param1, param2)
    BSIpc = {
            "B": BSIdict[mechKey]['B'],
            "S": BSIdict[mechKey]["S"],
            "I": BSIdict[mechKey]["I"],
            "p": pN.tolist(),
            "c": BSIdict[mechKey]["c"],
            "mech": mechString
    }
    
    """
    #print(len(BSIpc['p']), len(BSIpc['B'][0]), mechKey)
    if saveToLocal:
        file_path = './sample.json'
        # Open the file in write mode and write the data
        with open(file_path, 'w') as file:
            json.dump(BSIpc, file)  # 'indent=4' makes the output pretty-printed
        localsave = False
    """
    return BSIpc

def getBSI(mechType):
    return BSIdict_468[mechType]