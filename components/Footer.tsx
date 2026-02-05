export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950/50 py-8 px-4">
      <div className="page-container max-w-5xl mx-auto text-center">
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto mb-3">
          KPSY LAB은 정답을 내리는 곳이 아니라, 당신의 복잡함을 질서 있게 배열해 주는 도구입니다.
        </p>
        <p className="text-gray-500 text-xs mb-4">
          심리 분석 · <span className="text-white font-semibold">KPSY LAB</span> · kpsylab.com
        </p>
        <p className="text-gray-600 text-[11px] font-mono">
          Built by a System Architect — 데이터로 연결하는 인간의 이해
        </p>
      </div>
    </footer>
  );
}
