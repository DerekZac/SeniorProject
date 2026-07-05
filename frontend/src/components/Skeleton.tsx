export function SkeletonResultPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 animate-pulse">
      <div className="rounded-2xl p-8 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="h-8 rounded-full mx-auto mb-4" style={{ background: 'var(--border)', width: '10rem' }} />
        <div className="h-12 rounded-full mx-auto mb-6" style={{ background: 'var(--border)', width: '12rem' }} />
        <div className="h-3 rounded-full mx-auto" style={{ background: 'var(--border)', width: '16rem' }} />
      </div>
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="h-4 rounded-full mb-5" style={{ background: 'var(--border)', width: '12rem' }} />
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5].map(i => <div key={i} className="h-8 rounded-full" style={{ background: 'var(--border)', width: '5rem' }} />)}
        </div>
      </div>
    </div>
  );
}
