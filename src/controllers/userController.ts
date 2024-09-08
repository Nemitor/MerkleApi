// src/controllers/userController.ts
import {Cell, beginCell, toNano, Dictionary} from 'ton-core';
import { Request, Response } from 'express';
import {bufferToInt, hashToInt, MerkleTree} from "../merkle"

const generateKeys = (seed: number, count: bigint): bigint[] => {
    const keys: bigint[] = [];
    const seedBuffer = Buffer.from(seed.toString());

    for (let i = 0n; i < count; i++) {
        // Создаем буфер, комбинируя seed и текущую итерацию
        const keyBuffer = Buffer.concat([seedBuffer, Buffer.from(i.toString())]);
        // Хэшируем буфер и преобразуем его в bigint
        const hashedKey = hashToInt(keyBuffer);
        // Обрезаем до 32 бит
        const truncatedKey = hashedKey & 0xFFFFFFn;
        keys.push(truncatedKey);
    }

    return keys;
};

// Укажите константу и количество ключей
const seed = 99999;
const keyCount = 2n ** 17n;
const keys = generateKeys(seed, keyCount);

// Используйте merkleHash и MerkleTree так же, как в вашем коде
const merkleHash = (a: bigint, b: bigint) => bufferToInt(beginCell().storeUint(a, 256).storeUint(b, 256).endCell().hash());
const merkle = MerkleTree.fromLeaves(keys, merkleHash);


const getRoot = (req: Request, res: Response): void => {
    const params = {
        root: merkle.root().toString(),
        depth: merkle.depth
    }
    res.json(params)
}

const getProof = (req: Request, res: Response): void => {
    const proof = merkle.proofForNode(merkle.leafIdxToNodeIdx(Number(req.params.id)));
    const array = proof.map( (proofItem) => String(proofItem));
    const leaf = merkle.leaf(Number(req.params.id)).toString();

    const params = {
        proof: array,
        leaf
    }
    res.json(params);
}
const getMessage = (req: Request, res: Response): void => {
    const address = 'EQDVIoSKKRIeG3AYCWiAoyQDhPP5FK5I7tzR5rATl4kbCKvN'
    const amount = toNano('0.07').toString()

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
        .storeUint(Number(req.params.id) , 32)
        .endCell().toBoc().toString("base64")

    const data = {
        address,
        amount,
        payload
    }
    res.json(data);
}

export {getProof, getRoot, getMessage};
