import { useEffect, useMemo, useState } from "react";
import { VizCore } from "@vizcore/core";

export function Welcome() {
  const core = useMemo(() => VizCore.create(), []);
  const [memoryUsed, setMemoryUsed] = useState<number | null>(null);

  useEffect(() => {
    const stats = core.getMemoryStats();
    setMemoryUsed(stats.used);
  }, [core]);

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            VizCore ready • Memory used: {memoryUsed ?? 0} bytes
          </div>
        </header>
      </div>
    </main>
  );
}
