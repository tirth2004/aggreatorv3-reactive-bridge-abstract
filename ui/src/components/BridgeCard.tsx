import type { Bridge } from '../types';

interface Props {
  bridge: Bridge;
  selected: boolean;
  onSelect: () => void;
}

export function BridgeCard({ bridge, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left rounded-2xl border px-9 py-9 md:px-12 md:py-10 transition card-element',
        selected
          ? 'border-accent shadow-[0_0_0_1px_rgba(77,163,255,0.9),0_0_30px_rgba(77,163,255,0.6)]'
          : 'border-cardOutline hover:border-accent/60',
        // darker background so labels/values stand out
        'bg-bg'
      ].join(' ')}
      >
      {/* Make card text large and uniform for readability */}
      <div className="space-y-5 pt-4 pb-4 leading-relaxed text-[18px]">
        {/* Price feed */}
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="uppercase tracking-[0.25em] text-slate-400 card-text">
            Price Feed: 
          </div>
          <div className="text-slate-100">
            {bridge.feedDescription}
          </div>
        </div>

        {/* Origin chain */}
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="uppercase tracking-[0.18em] text-slate-400 card-text">
            Origin Chain ID: 
          </div>
          <div className="text-slate-100">
            {bridge.originChainId}{' '}
            <span className="text-slate-400">({bridge.originChainName})</span>
          </div>
        </div>

        {/* Destination chain */}
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="uppercase tracking-[0.18em] text-slate-400 card-text">
            Destination Chain ID: 
          </div>
          <div className="text-slate-100">
            {bridge.destinationChainId}{' '}
            <span className="text-slate-400">(Eth Sepolia)</span>
          </div>
        </div>

        {/* Status */}
        {/* <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="uppercase tracking-[0.18em] text-slate-300">
            Status
          </div>
          <div className="inline-flex items-center rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-semibold text-emerald-300">
            {bridge.status === 'active'
              ? 'ACTIVE'
              : bridge.status === 'deploying'
              ? 'DEPLOYING'
              : 'ERROR'}
            <span className="ml-1.5 text-[10px]">●</span>
          </div>
        </div> */}
      </div>
    </button>
  );
}