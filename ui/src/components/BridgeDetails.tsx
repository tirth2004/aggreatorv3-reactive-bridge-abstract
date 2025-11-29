import { useState } from 'react';
import type { Bridge } from '../types';
import { fundReactive, fundDestination } from '../api';

interface Props {
  bridge: Bridge | null;
}

export function BridgeDetails({ bridge }: Props) {
  const [fundingRc, setFundingRc] = useState(false);
  const [fundRcError, setFundRcError] = useState<string | null>(null);
  const [fundingDestination, setFundingDestination] = useState(false);
  const [fundDestinationError, setFundDestinationError] = useState<string | null>(null);

  if (!bridge) {
    return (
      <div className="mt-8 rounded-2xl border border-cardOutline bg-bg px-7 py-7 text-xs text-slate-400">
        Select a bridge to view details.
      </div>
    );
  }

  const copy = (value: string | null) => {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => {
      // ignore copy errors
    });
  };

  const handleFundRc = async () => {
    if (!bridge.reactiveAddress) {
      setFundRcError('No reactive address available');
      return;
    }

    setFundRcError(null);
    setFundingRc(true);
    try {
      await fundReactive({
        rcAddress: bridge.reactiveAddress,
        amountEth: '0.01',
      });
      // Success - could show a toast here
    } catch (err: unknown) {
      setFundRcError(err instanceof Error ? err.message : 'Failed to fund RC');
    } finally {
      setFundingRc(false);
    }
  };

  const handleFundDestination = async () => {
    if (!bridge.destinationFeed) {
      setFundDestinationError('No destination feed address available');
      return;
    }

    setFundDestinationError(null);
    setFundingDestination(true);
    try {
      await fundDestination({
        feedAddress: bridge.destinationFeed,
        amountEth: '0.001',
      });
      // Success - could show a toast here
    } catch (err: unknown) {
      setFundDestinationError(err instanceof Error ? err.message : 'Failed to fund destination callback proxy');
    } finally {
      setFundingDestination(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-cardOutline bg-bg px-7 py-6 space-y-5 bridge-details">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-200 card-text">
        Bridge Details
      </h2>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Origin Address:</span>
          <button
            type="button"
            onClick={() => copy(bridge.originFeed)}
            className="max-w-[70%] break-all text-right font-medium hover:text-accent transition-colors detail-card"
          >
            {bridge.originFeed.toUpperCase()}
          </button>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Destination Address:</span>
          <button
            type="button"
            onClick={() => copy(bridge.destinationFeed)}
            className="max-w-[70%] break-all text-right font-medium hover:text-accent transition-colors detail-card"
          >
            {bridge.destinationFeed.toUpperCase()}
          </button>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-400">Reactive Contract:</span>
          {bridge.reactiveAddress ? (
            <button
              type="button"
              onClick={() => copy(bridge.reactiveAddress)}
              className="max-w-[70%] break-all text-right font-medium hover:text-accent transition-colors detail-card"
            >
              {bridge.reactiveAddress.toUpperCase()}
            </button>
          ) : (
            <span className="max-w-[70%] break-all text-right font-medium">—</span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={handleFundRc}
          disabled={fundingRc || !bridge.reactiveAddress}
          className="w-full rounded-md bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:opacity-90 disabled:opacity-60 detail-button"
        >
          {fundingRc ? 'Funding...' : 'Fund RC'}
        </button>
        {fundRcError && (
          <div className="text-[10px] text-red-400">{fundRcError}</div>
        )}
        <button
          type="button"
          onClick={handleFundDestination}
          disabled={fundingDestination || !bridge.destinationFeed}
          className="w-full rounded-md bg-accentSoft px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 hover:bg-accentSoft/80 disabled:opacity-60 detail-button"
        >
          {fundingDestination ? 'Funding...' : 'Fund Destination Callback Proxy'}
        </button>
        {fundDestinationError && (
          <div className="text-[10px] text-red-400">{fundDestinationError}</div>
        )}
      </div>
    </div>
  );
}