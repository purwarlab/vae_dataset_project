#!/usr/bin/env python
# coding: utf-8

import numpy as np 
from itertools import combinations


def linkMajor(B, collectionsType = list):
    B = np.array(B)
    if collectionsType == list:
        jointCollections = []
        for linkID in range(B.shape[0]):
            jointCollections.append(np.where(B[linkID] == 1)[0])
        return jointCollections
    elif collectionsType == dict:
        jointCollections = {}
        for linkID in range(B.shape[0]):
            jointCollections[linkID] = np.where(B[linkID] == 1)[0]
        return jointCollections
    else:
        return None


def linkMajor2B(jointCollections):
    if type(jointCollections) == list:
        m = len(jointCollections) # list cannot tell linkID 
        n = 0
        for link in jointCollections:
            n = np.max([np.max(link) + 1, n])
        B = np.zeros((m, n))
        for linkID in range(len(jointCollections)):
            for jID in jointCollections[linkID]:
                B[linkID, jID] = 1
        return np.array(B, dtype= int)
    elif type(jointCollections) == dict:
        m = np.max(list(jointCollections.keys())) + 1
        n = 0
        for linkID in jointCollections:
            n = np.max([np.max(jointCollections[linkID]) + 1, n])
        B = np.zeros((m, n))
        for linkID in jointCollections:
            for jID in jointCollections[linkID]:
                B[linkID, jID] = 1
        return np.array(B, dtype= int)
    else:
        return None


def cgbCriteria(jointCollections):
    if type(jointCollections) == list:
        n = len(jointCollections)
        l = 0 
        computationList = []
        for link in jointCollections:
            computationList = np.concatenate([computationList, link])
        unique_values, counts = np.unique(np.array(computationList, dtype= int), return_counts = True)
        for numAppeared in counts:
            if numAppeared > 1: 
                l += (numAppeared - 1)
        return (n-1)*3 - l*2
    elif type(jointCollections) == dict:
        n = len(jointCollections)
        l = 0 
        computationList = []
        for linkID in jointCollections:
            computationList = np.concatenate([computationList, jointCollections[linkID]])
        unique_values, counts = np.unique(np.array(computationList, dtype= int), return_counts = True)
        for numAppeared in counts:
            if numAppeared > 1:
                l += (numAppeared - 1)
        return (n-1)*3 - l*2
    else:
        return None
    

def mergeLink(jointCollections, mergeIndices):
    mergeIndices.sort()
    if mergeIndices[0] == 0: 
        # merge and add at the front 
        if type(jointCollections) == list:
            newCollections = []
            computationList = []
            for linkID in range(0, len(jointCollections)):
                if linkID in mergeIndices:
                    computationList = np.concatenate([computationList, jointCollections[linkID]])
                else:
                    newCollections.append(jointCollections[linkID])
            newCollections.insert(0, np.unique(computationList))
            return newCollections
        elif type(jointCollections) == dict:
            newCollections = {}
            computationList = []
            for linkID in jointCollections:
                if linkID in mergeIndices:
                    computationList = np.concatenate([computationList, jointCollections[linkID]])
                else:
                    newCollections[linkID] = jointCollections[linkID]
            newCollections[0] = np.unique(computationList)
            return newCollections
        else:
            return None
    else:
        # always merge to the last link
        if type(jointCollections) == list:
            newCollections = []
            computationList = []
            for linkID in range(0, len(jointCollections)):
                if linkID in mergeIndices:
                    computationList = np.concatenate([computationList, jointCollections[linkID]])
                else:
                    newCollections.append(jointCollections[linkID])
            newCollections.append(np.unique(np.array(computationList, dtype= int)))
            return newCollections
        elif type(jointCollections) == dict:
            newCollections = {}
            computationList = []
            for linkID in jointCollections:
                if linkID in mergeIndices:
                    computationList = np.concatenate([computationList, jointCollections[linkID]])
                else:
                    newCollections[linkID] = jointCollections[linkID]
            newLinkID = np.max(list(jointCollections.keys())) + 1
            newCollections[newLinkID] = np.unique(np.array(computationList, dtype= int))
            return newCollections
        else:
            return None
        

def isRigid(jointCollections, displayThreshold = 100000):
    ctr = 0
    # first remove joints that are only collected by one link for efficiency 
    B = linkMajor2B(jointCollections)
    testSet = linkMajor(B[:, np.sum(B, axis = 0) > 1], list) # make it a list 
    maxiter = 2**len(testSet)
    k = 2
    while ctr < maxiter: # set the limit according to upper bound 
        if len(testSet) == 1: # all links are merged into one 
            if ctr >= displayThreshold:
                print(ctr)
            return True
        N = len(testSet)
        for comb in combinations(range(N), k):
            dofSet = [testSet[linkID] for linkID in comb]
            dof = cgbCriteria(dofSet)
            ctr += 1
            if dof <= 0: # mergeable. 
                testSet = mergeLink(testSet, list(comb))
                k = 2 # resetting k once a merge operation has happened 
                break # break for loop as everything needs to be redone again 
        else: # no breaks detected 
            k = k + 1
        if k > N:
            return False
    print('Unexpected Error') # You should never come here because this exceeds temporal upper bound. 
    return False


def reduction(jointCollections, displayThreshold = 100000, maxiter = None):
    ctr = 0
    # first remove joints that are only collected by one link for efficiency 
    # a path finding algorithm for generally positioned joints  
    B = linkMajor2B(jointCollections)
    originalSet = linkMajor(B, list) # 
    B_test = B.copy()
    B_test[:, np.sum(B, axis = 0) < 2] = 0
    testSet = linkMajor(B_test, list) # make it a list 
    if maxiter == None:
        maxiter = 2**len(testSet)
    k = 2
    while ctr < maxiter: # set the limit according to upper bound 
        if len(testSet) == 1: # all links are merged into one 
            if ctr >= displayThreshold:
                print(ctr)
            return originalSet, True
        N = len(testSet)
        for comb in combinations(range(N), k):
            dofSet = [testSet[linkID] for linkID in comb]
            dof = cgbCriteria(dofSet)
            ctr += 1
            if dof <= 0: # mergeable. 
                testSet = mergeLink(testSet, list(comb))
                originalSet = mergeLink(originalSet, list(comb))
                k = 2 # resetting k once a merge operation has happened 
                break # break for loop as everything needs to be redone again 
        else: # no breaks detected 
            k = k + 1
        if k > N:
            return originalSet, False
    print('Error: exceeding max iteration') # You should never come here because this exceeds temporal upper bound. 
    return originalSet, False


def getSolStep(testSet, comb, jointsSolved):
    
    myTestSet = [testSet[linkID].astype(int) for linkID in comb]

    B_new = linkMajor2B(myTestSet)
    B_new[:, np.sum(B_new, axis = 0) < 2] = 0
    combSet = linkMajor(B_new, list)
    
    lastSolSteps = []
    for o, t in zip(myTestSet, combSet):
        diff = np.setdiff1d(o, t, assume_unique=True)
        
        if len(diff) == 0:
            continue
        
        inter = np.intersect1d(o, t, assume_unique=True)
        
        if len(inter) < 2:
            continue
                        
        for jointID in diff:
            if jointsSolved[jointID] == 0:
                lastSolSteps.append([int(jointID), 'arcSect', [int(inter[0]), int(inter[1])]])
    
    joints = np.unique(np.concatenate(combSet))
    
    joint2Solve = []
    for jointID in joints:
        if jointsSolved[int(jointID)] == 0:
            joint2Solve.append(int(jointID))
    
    
    if len(joint2Solve) == 0:    
        
        for step in lastSolSteps:
            jointsSolved[step[0]] = 1
            
        return lastSolSteps, jointsSolved
    elif len(joint2Solve) == 1:
        last_part = []
        for link in comb:
            if joint2Solve[0] in testSet[link]:
                surr = np.delete(testSet[link], np.where(testSet[link] == joint2Solve[0]))
                if len(last_part):
                    surr = np.delete(surr, np.where(testSet[link] == last_part[0]))
                if len(surr):
                    last_part.append(int(surr[0]))
                if len(last_part) == 2:
                    break
        
        jointsSolved[joint2Solve[0]] = 1
        
        for step in lastSolSteps:
            jointsSolved[step[0]] = 1
        
        return [[joint2Solve[0], 'arcSect', last_part]] + lastSolSteps, jointsSolved
    
    last_part = []
    
    for linkID in range(len(comb)):
        if len(combSet[linkID]) < 3 and (not jointsSolved[combSet[linkID][0]] or not jointsSolved[combSet[linkID][1]]):
            last_part.append(combSet[linkID].tolist())
        else:
            if not jointsSolved[combSet[linkID][0]] or not jointsSolved[combSet[linkID][1]]:
                last_part.append([int(combSet[linkID][0]), int(combSet[linkID][1])])
            for i in range(2, len(combSet[linkID])):
                if not jointsSolved[combSet[linkID][0]] or not jointsSolved[combSet[linkID][i]]:
                    last_part.append([int(combSet[linkID][0]), int(combSet[linkID][i])])
                if not jointsSolved[combSet[linkID][1]] or not jointsSolved[combSet[linkID][i]]:
                    last_part.append([int(combSet[linkID][1]), int(combSet[linkID][i])])
    
    for jointID in joint2Solve:
        jointsSolved[jointID] = 1
                
    for step in lastSolSteps:
        jointsSolved[step[0]] = 1
    
    return [[joint2Solve, 'optim', last_part]] + lastSolSteps, jointsSolved

def computeSolSteps(jointCollections, displayThreshold = 100000, maxiter = None, actuator_fixed=2, actuator_joint=0, chain=1):
    ctr = 0
    # first remove joints that are only collected by one link for efficiency 
    # a path finding algorithm for generally positioned joints  
    jointCollections.append(np.array([actuator_fixed, chain]))
    B = linkMajor2B(jointCollections)
    originalSet = linkMajor(B, list) # 
    groundLink = 0
    
    solsteps = []
    for jointID in originalSet[groundLink]:
        solsteps.append([int(jointID), 'fixed', int(jointID)])
    
    solsteps.append([int(chain), 'chain', int(actuator_joint)])
        
    B_test = B.copy()
    B_test[:, np.sum(B, axis = 0) < 2] = 0
    testSet = linkMajor(B_test, list) # make it a list 
    
    lastSolSteps = []
    for o, t in zip(originalSet, testSet):
        diff = np.setdiff1d(o, t, assume_unique=True)
        
        if len(diff) == 0:
            continue
        
        inter = np.intersect1d(o, t, assume_unique=True)
        
        if len(inter) < 2:
            continue
                        
        for jointID in diff:
            lastSolSteps.append([int(jointID), 'arcSect', [int(inter[0]), int(inter[1])]])
    
    if maxiter == None:
        maxiter = 2**len(testSet)
    k = 2
    
    jointSolved = np.zeros((len(B[0])))
    for jointID in testSet[groundLink]:
        jointSolved[jointID] = 1
    
    jointSolved[chain] = 1
    
    while ctr < maxiter: # set the limit according to upper bound 
        if len(testSet) == 1: # all links are merged into one 
            if ctr >= displayThreshold:
                print(ctr)
            return originalSet, solsteps + lastSolSteps, True
        N = len(testSet)
        for comb in combinations(range(1, N), k):
            dofSet = [testSet[linkID] for linkID in comb] + [testSet[0]]
            dof = cgbCriteria(dofSet)
            ctr += 1
            if dof <= 0: # mergeable. 
                solst, jointSolved = getSolStep(testSet, list(comb) + [0], jointSolved)
                if len(solst):
                    solsteps = solsteps + solst
                testSet = mergeLink(testSet, list(comb) + [0])
                originalSet = mergeLink(originalSet, list(comb) + [0])
                k = 2 # resetting k once a merge operation has happened 
                break # break for loop as everything needs to be redone again 
        else: # no breaks detected 
            k = k + 1
        if k > N:
            return originalSet, solsteps + lastSolSteps, False
    print('Error: exceeding max iteration') # You should never come here because this exceeds temporal upper bound. 
    return originalSet, solsteps + lastSolSteps, False
