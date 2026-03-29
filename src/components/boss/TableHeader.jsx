export default function TableHeader() {
  return (
    <>
      {/* HEADER */}
      <div className="grid grid-cols-[1fr_180px_1fr] px-4 py-2 text-gray-400 text-sm border-t border-gray-800">
        <span className="text-left">Boss</span>
        <span className="text-center">Spawn</span>
        <span className="text-right">Countdown</span>
      </div>

      {/* LINE */}
      <div className="h-0.5 w-full bg-linear-to-r from-transparent via-red-500 to-transparent" />
    </>
  );
}