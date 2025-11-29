const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface CreateBridgeRequest {
  originChainId: number;
  originFeed: string;
  originRpc: string;
}

export interface CreateBridgeResponse {
  originChainId: number;
  originFeed: string;
  originRpc: string;
  destinationChainId: number;
  destinationFeed: string;
  reactiveAddress: string | null;
  feedDecimals: number;
  feedDescription: string;
}

export async function createBridge(
  body: CreateBridgeRequest
): Promise<CreateBridgeResponse> {
  const res = await fetch(`${BASE_URL}/api/bridges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create bridge');
  }

  return res.json();
}

// shape returned is the raw JSON from backend; we assemble a Bridge in App.tsx

export interface FundReactiveRequest {
  rcAddress: string;
  amountEth: string;
}

export async function fundReactive(
  body: FundReactiveRequest
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/fund/reactive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fund reactive contract');
  }
}

export interface FundDestinationRequest {
  feedAddress: string;
  amountEth: string;
}

export async function fundDestination(
  body: FundDestinationRequest
): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/fund/destination`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fund destination callback proxy');
  }
}