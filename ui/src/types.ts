export type BridgeStatus = 'deploying' | 'active' | 'error';

export interface Bridge {
  id: string;
  originChainId: number;
  originChainName: string;
  originFeed: string;
  originFeedLabel: string; // "ETH / USD"
  originRpc: string;

  destinationChainId: number;
  destinationFeed: string;
  reactiveAddress: string | null;

  feedDecimals: number;
  feedDescription: string;

  status: BridgeStatus;
  createdAt: string;
}

export interface OriginFeedOption {
  label: string;   // "ETH / USD"
  address: string;
}

export interface OriginChainOption {
  id: number;
  name: string;    // "Base Sepolia"
  rpc: string;
  feeds: OriginFeedOption[];
}