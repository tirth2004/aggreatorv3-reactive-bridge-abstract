import { useState } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorage';
import type { Bridge } from './types';
import { BridgeCard } from './components/BridgeCard';
import { BridgeDetails } from './components/BridgeDetails';
import { CreateBridgeModal } from './components/CreateBridgeModal';
import { createBridge } from './api';
import { ORIGIN_CHAINS } from './config/origins';

function App() {
  const [bridges, setBridges] = useLocalStorageState<Bridge[]>('echo-bridges', []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreateBridge = async ({
    originChain,
    originFeedAddress,
  }: {
    originChain: (typeof ORIGIN_CHAINS)[number];
    originFeedAddress: string;
  }) => {
    const res = await createBridge({
      originChainId: originChain.id,
      originFeed: originFeedAddress,
      originRpc: originChain.rpc,
    });

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const feedOption = originChain.feeds.find((f) => f.address === originFeedAddress);

    const newBridge: Bridge = {
      id,
      originChainId: res.originChainId,
      originChainName: originChain.name,
      originFeed: res.originFeed,
      originFeedLabel: feedOption?.label ?? res.feedDescription,
      originRpc: res.originRpc,
      destinationChainId: res.destinationChainId,
      destinationFeed: res.destinationFeed,
      reactiveAddress: res.reactiveAddress,
      feedDecimals: res.feedDecimals,
      feedDescription: res.feedDescription,
      status: res.reactiveAddress ? 'active' : 'deploying',
      createdAt: now,
    };

    setBridges((prev) => [newBridge, ...prev]);
    setSelectedId(id);
  };

  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="mx-auto max-w-6xl px-6 pb-14 pt-8 md:px-10">
        {/* Top bar */}
        <header className="flex items-center justify-between">
          <div className="text-[44px] font-semibold tracking-[0.08em] text-slate-100">Echo</div>

          <button
            onClick={() => setCreateOpen(true)}
            className=" bg-[#403eff] px-10 py-4 text-[18px] font-semibold tracking-[0.16em] text-white shadow-[0_0_28px_rgba(64,62,255,0.95)] hover:brightness-110"
          >
            Create New Oracle/Bridge
          </button>
        </header>

        <div className="mt-4 mb-8 h-px w-full bg-cardOutline/60" />

        {/* Create Oracle Panel - inline */}
        {createOpen && (
          <CreateBridgeModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreate={handleCreateBridge}
          />
        )}

        {/* Deployed bridges grid + details */}
        <section className="space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 card-text">
            // Deployed Bridges
          </h2>

          {bridges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cardOutline bg-card px-6 py-8 text-sm text-slate-400">
              No bridges yet. Click <span className="font-semibold">Create New Oracle/Bridge</span> to
              deploy your first one.
            </div>
          ) : (
            <div className="space-y-6">
              {bridges.map((b) => (
                <div key={b.id} className="space-y-4 rounded-2xl border border-cardOutline/40 p-1">
                  <BridgeCard
                    bridge={b}
                    selected={b.id === selectedId}
                    onSelect={() =>
                      setSelectedId((current) => (current === b.id ? null : b.id))
                    }
                  />
                  {selectedId === b.id && <BridgeDetails bridge={b} />}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;