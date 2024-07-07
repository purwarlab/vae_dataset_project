import numpy as np
import torch


def batch_chamfer_distance(c1,c2):   
    with torch.no_grad():
        d = torch.cdist(c1,c2)

        id1 = d.argmin(1)
        id2 = d.argmin(2)
    
    d1 = torch.linalg.norm(c2 - c1.gather(1,id1.unsqueeze(-1).tile([1,1,2])),dim=-1).mean(1)
    d2 = torch.linalg.norm(c1 - c2.gather(1,id2.unsqueeze(-1).tile([1,1,2])),dim=-1).mean(1)

    return d1 + d2

def batch_ordered_distance(c1,c2):
    
    with torch.no_grad():
        C = torch.cdist(c2,c1)
    
    row_ind = np.arange(c2.shape[1])

    row_inds = row_ind[row_ind[:,None]-np.zeros_like(row_ind)].T
    col_inds = row_ind[row_ind[:,None]-row_ind].T 
    
    col_inds_ccw = np.copy(col_inds[:,::-1])
    
    row_inds = torch.tensor(row_inds).to(c1.device)
    col_inds = torch.tensor(col_inds).to(c1.device)
    col_inds_ccw = torch.tensor(col_inds_ccw).to(c1.device)

    argmin_cw = torch.argmin(C[:,row_inds, col_inds].sum(2),dim=1)
    argmin_ccw = torch.argmin(C[:,row_inds, col_inds_ccw].sum(2),dim=1)
    
    col_ind_cw = col_inds[argmin_cw, :]
    col_ind_ccw = col_inds_ccw[argmin_ccw, :]

    ds_cw = torch.square(torch.linalg.norm(c2 - torch.gather(c1,1,col_ind_cw.long().unsqueeze(-1).repeat([1,1,2])),dim=-1)).mean(1)
    ds_ccw = torch.square(torch.linalg.norm(c2 - torch.gather(c1,1,col_ind_ccw.long().unsqueeze(-1).repeat([1,1,2])),dim=-1)).mean(1)
    
    ds = torch.minimum(ds_cw,ds_ccw)
    
    return ds