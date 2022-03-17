const config: { [x: string]: string | undefined } = {
  NetXdQprcVkpaWU: 'https://rpc.tzkt.io/mainnet', // mainnet
  NetXZSsxBpMQeAT: 'https://rpc.tzkt.io/hangzhou2net' // hangzhounet
};

class TezosNetworkConfig {
  static supports(chainId: string) {
    return config[chainId] !== undefined;
  }

  static rpc(chainId: string) {
    if (TezosNetworkConfig.supports(chainId)) {
      return config[chainId]!;
    }

    throw `network ${chainId} not supported`;
  }
}

export { TezosNetworkConfig };
