import numpy as np


def matmul_jd(jd, mat):
    # input should be (..., ,2)
    # the operation:
    jd = np.array(jd)
    oldshape = jd.shape
    njd = np.reshape(jd, (-1, 2))
    hc1 = np.ones((njd.shape[0], 1))
    njd = np.matrix(np.concatenate([njd, hc1], axis=1)).transpose()
    njd = np.array((mat * njd).transpose())[:, 0:2].reshape(oldshape)
    return njd


# Match curve through matrix multiplication.
def matchJD2toJD1(jd2, param1, param2):
    """
    # jd1 should be the input curve/mechanism, with a shape of (ang, j_num, 2).
    # For the image-based method, the shape of jd1 is [ang, 2].
    # Its refID1 is 0 (as there is only one curve)
    
    # jd2 should be the output curve/mechanism, with a shape of (ang, j_num, 2) or (j_num, 2)
    # For (ang, j_num, 2), we have the coupler curve.
    # For (j_num, 2), this is the initial state
    """
    # process: normalize jd2, then multiply it with inverse normlization of jd1.
    NR_MG = np.array(param2).reshape((3,3))
    MG_NR = np.linalg.inv(np.array(param1).reshape((3,3)))  
    njd = matmul_jd(jd2, np.matmul(MG_NR, NR_MG))
    return njd
