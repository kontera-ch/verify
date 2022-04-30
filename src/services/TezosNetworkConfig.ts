enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  UNSUPPORTED = 'unsupported'
}

class TezosNetworkConfig {
  static get networks(): { [x: string]: { name: string; rpc: string; type: NetworkType } | undefined } {
    return {
      NetXdQprcVkpaWU: {
        name: 'Tezos Mainnet',
        rpc: 'https://rpc.tzkt.io/mainnet', // mainnet
        type: NetworkType.MAINNET
      },
      NetXZSsxBpMQeAT: {
        name: 'Tezos Hangzhou2net',
        rpc: 'https://rpc.tzkt.io/hangzhou2net', // hangzhounet
        type: NetworkType.TESTNET
      },
      NetXnHfVqm9iesp: {
        name: 'Tezos Ithacanet',
        rpc: 'https://rpc.tzkt.io/ithacanet', // ithacanet
        type: NetworkType.TESTNET
      }
    };
  }

  static supports(chainId: string) {
    return TezosNetworkConfig.networks[chainId] !== undefined;
  }

  static rpc(chainId: string) {
    if (TezosNetworkConfig.supports(chainId)) {
      return TezosNetworkConfig.networks[chainId]!;
    }

    throw `network ${chainId} not supported`;
  }
}

export { TezosNetworkConfig, NetworkType };
