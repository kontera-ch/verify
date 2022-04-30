import { b58cencode, hex2buf, prefix, Prefix } from '@taquito/utils';
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

  get blockHeaderHash(): string {
    return b58cencode(this.derivation, prefix[Prefix.B]);
  }

  async verify(rpcUrl: string): Promise<boolean> {
    const { data: blockData } = await axios.get(`${rpcUrl}/chains/${this.network}/blocks/${this.blockHeaderHash}/header`);

    if (new Date(blockData.timestamp).getTime() !== new Date(this.timestamp).getTime()) {
      throw new Error('timestamp mismatch');
    }

    return true;
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
}
