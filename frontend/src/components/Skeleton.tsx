export function SkeletonResultPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 animate-pulse">
      <div className="rounded-2xl p-8 mb-6" style={{ background: '#16162A', border: '1px solid #21213A' }}>
        <div className="h-8 rounded-full bg-[#21213A] w-40 mx-auto mb-4" />
        <div className="h-12 rounded-full bg-[#21213A] w-48 mx-auto mb-6" />
        <div className="h-3 rounded-full bg-[#21213A] w-64 mx-auto" />
      </div>
      <div className="rounded-xl p-6 mb-6" style={{ background: '#16162A', border: '1px solid #21213A' }}>
        <div className="h-4 rounded-full bg-[#21213A] w-48 mb-5" />
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5].map(i => <div key={i} className="h-8 rounded-full bg-[#21213A] w-20" />)}
        </div>
      </div>
    </div>
  );
}
