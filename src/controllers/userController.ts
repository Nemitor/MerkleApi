// src/controllers/userController.ts
import { Cell, beginCell, toNano } from 'ton-core';
import { Request, Response } from 'express';
import {bufferToInt, MerkleTree} from "../merkle"

const merkleHash = (a: bigint, b: bigint) => bufferToInt(beginCell().storeUint(a, 256).storeUint(b, 256).endCell().hash());

const merkle = MerkleTree.fromLeaves([1111n,2222n,3333n,4444n], merkleHash);

const getRoot = (req: Request, res: Response): void => {
    res.json(merkle.root().toString());
}

const getProof = (req: Request, res: Response): void => {
    const proof = merkle.proofForNode(merkle.leafIdxToNodeIdx(Number(req.params.id)));
    const array = proof.map( (proofItem) => String(proofItem));
    const leaf = merkle.leaf(Number(req.params.id)).toString();

    const params = {
        proof: array,
        depth: merkle.depth,
        leaf
    }
    res.json(params);
}

export {getProof, getRoot };
