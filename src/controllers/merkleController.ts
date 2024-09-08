import { beginCell, toNano, Dictionary } from 'ton-core';
import { Request, Response } from 'express';
import { bufferToInt, generateLeafHashKeys, MerkleTree } from '../merkle';
import dotenv from 'dotenv';

dotenv.config();
const seed = Number(process.env.SEED);

if (isNaN(seed)) {
    throw new Error('SEED must be a valid number in .env');
}

const keyCount = 2n ** 17n;
const keys = generateLeafHashKeys(seed, keyCount);

const merkleHash = (a: bigint, b: bigint) => bufferToInt(beginCell().storeUint(a, 256).storeUint(b, 256).endCell().hash());
const merkle = MerkleTree.fromLeaves(keys, merkleHash);

const getRoot = (req: Request, res: Response): void => {
    const params = {
        root: merkle.root().toString(),
        depth: merkle.depth,
    };
    res.json(params);
};

const getProof = (req: Request, res: Response): void => {
    const proof = merkle.proofForNode(merkle.leafIdxToNodeIdx(Number(req.params.id)));
    const array = proof.map((proofItem) => String(proofItem));
    const leaf = merkle.leaf(Number(req.params.id)).toString();

    const params = {
        proof: array,
        leaf,
    };
    res.json(params);
};
const getMessage = (req: Request, res: Response): void => {
    const address = 'EQDVIoSKKRIeG3AYCWiAoyQDhPP5FK5I7tzR5rATl4kbCKvN';
    const amount = toNano('0.07').toString();

    const proof = merkle.proofForNode(merkle.leafIdxToNodeIdx(Number(req.params.id)));
    const leaf = merkle.leaf(Number(req.params.id));
    const proofDict = Dictionary.empty(Dictionary.Keys.Uint(32), Dictionary.Values.BigUint(256));

    for (let i = 0; i < proof.length; i++) {
        proofDict.set(i, proof[i]);
    }

    const pdb = beginCell();
    proofDict.storeDirect(pdb);

    const payload = beginCell()
        .storeUint(0x8e8764cc, 32)
        .storeRef(pdb)
        .storeUint(leaf, 32)
        .storeUint(Number(req.params.id), 32)
        .endCell()
        .toBoc()
        .toString('base64');

    const data = {
        address,
        amount,
        payload,
    };
    res.json(data);
};

export { getProof, getRoot, getMessage };
