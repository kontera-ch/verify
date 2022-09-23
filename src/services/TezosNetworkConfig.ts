enum NetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  GHOSTNET = 'ghostnet',
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
        name: 'Tezos Ghostnet',
        rpc: 'https://rpc.ghostnet.teztnets.xyz', // ghostnet
        type: NetworkType.GHOSTNET
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
