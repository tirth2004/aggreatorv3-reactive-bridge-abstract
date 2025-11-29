import { useState } from 'react';
import { ORIGIN_CHAINS } from '../config/origins'
import type { OriginChainOption } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (params: {
    originChain: OriginChainOption;
    originFeedAddress: string;
  }) => Promise<void>;
}

export function CreateBridgeModal({ open, onClose, onCreate }: Props) {
  const [selectedChainId, setSelectedChainId] = useState<number>(ORIGIN_CHAINS[0]?.id ?? 0);
  const [selectedFeed, setSelectedFeed] = useState<string>(
    ORIGIN_CHAINS[0]?.feeds[0]?.address ?? ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  if (!open) return null;

  const chain = ORIGIN_CHAINS.find((c) => c.id === selectedChainId)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLastResponse(null);
    setLoading(true);
    try {
      await onCreate({ originChain: chain, originFeedAddress: selectedFeed });
      setLastResponse('Success! Bridge created.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to create bridge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-md rounded-2xl border border-cardOutline bg-card px-6 py-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between modal">
          <h2 className="text-lg font-semibold uppercase tracking-[0.25em] text-slate-200 card-text">
            Create New Oracle
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 modal">
          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-slate-300">
              Origin Chain
            </label>
            <select
              className="w-full rounded-xl border border-cardOutline bg-bg px-4 py-3 text-base"
              value={selectedChainId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedChainId(id);
                const chain = ORIGIN_CHAINS.find((c) => c.id === id)!;
                setSelectedFeed(chain.feeds[0]?.address ?? '');
              }}
            >
              {ORIGIN_CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm uppercase tracking-[0.2em] text-slate-300">
              Price Feed
            </label>
            <select
              className="w-full rounded-xl border border-cardOutline bg-bg px-4 py-3 text-base"
              value={selectedFeed}
              onChange={(e) => setSelectedFeed(e.target.value)}
            >
              {chain.feeds.map((f) => (
                <option key={f.address} value={f.address}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-md bg-accent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:opacity-90 disabled:opacity-60 create-button"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/60 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {lastResponse && !error && (
          <div className="mt-4 rounded-xl border border-emerald-500/60 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200 resp">
            <div className="mb-1 font-semibold">Success!</div>
            <pre className="whitespace-pre-wrap break-all text-[11px]">
              {lastResponse}
            </pre>
          </div>
        )}
    </div>
  );
}