import { b58cencode, hex2buf } from '@taquito/utils';
import axios from 'axios';
import { Operation } from './operations/Operation';
import { Blake2bOperation } from './operations/types/Blake2bOperation';
import { JoinOperation } from './operations/types/JoinOperation';
import AbstractProof, { ProofOptions } from './Proof';

export interface TezosBlockHeaderProofOptions extends ProofOptions {
  timestamp: Date;
  network: string;
}

export interface SerializedTezosBlockHeaderProof {
  hash: string;
  operations: any[];
  version: number;
  timestamp: string;
  network: string;
}

export default class TezosBlockHeaderProof extends AbstractProof {
  public timestamp: Date;
  public network: string;

  constructor({ hash, operations, timestamp, network }: TezosBlockHeaderProofOptions) {
    super(hash, operations);
    this.timestamp = timestamp;
    this.network = network;
  }

  prependProof(proof: AbstractProof): TezosBlockHeaderProof {
    return new TezosBlockHeaderProof({
      timestamp: this.timestamp,
      network: this.network,
      hash: proof.hash,
      operations: [...proof.operations, ...this.operations]
    });
  }

  toJSON(): SerializedTezosBlockHeaderProof {
    const json = super.toJSON();
    return {
      network: this.network,
      timestamp: this.timestamp.toISOString(),
      ...json
    };
  }

  static fromJSON({ hash, operations, timestamp, network }: SerializedTezosBlockHeaderProof): TezosBlockHeaderProof {
    return new TezosBlockHeaderProof({
      hash: new Uint8Array(hex2buf(hash)),
      operations: operations.map((serializedOperation): Operation => {
        switch (serializedOperation.type) {
          case 'blake2b':
            return new Blake2bOperation();
          case 'join':
            return new JoinOperation({
              prepend: serializedOperation.prepend ? hex2buf(serializedOperation.prepend) : undefined,
              append: serializedOperation.append ? hex2buf(serializedOperation.append) : undefined
            });
          default:
            throw 'VERIFIER_ERROR.UNKNOWN_OPERATION';
        }
      }),
      timestamp: new Date(timestamp),
      network: network
    });
  }

  async verify(rpcUrl: string): Promise<boolean> {
    const blockHash = this.operations.reduce<Uint8Array>((previousHash, currentOperation) => {
      return currentOperation.commit(previousHash);
    }, this.hash);

    const b58cEncodedBlockHash = b58cencode(blockHash, new Uint8Array([1, 52]));

    try {
      const { data: blockData } = await axios.get(`${rpcUrl}/chains/${this.network}/blocks/${b58cEncodedBlockHash}/header`);

      if (new Date(blockData.timestamp).getTime() !== new Date(this.timestamp).getTime()) {
        throw 'VERIFIER_ERROR.TIMESTAMP_MISMATCH';
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw `VERIFIER_ERROR.BLOCK_HEADER_NOT_FOUND`;
        }

        throw error;
      }
    }

    return true;
  }
}
