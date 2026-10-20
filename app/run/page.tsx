import type { Metadata } from "next";
import { RunBackground } from "@/components/run/RunBackground";
import { RunPanel } from "@/components/run/RunPanel";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: `Knell — ${strings.run.title}`,
  description: strings.run.subtitle,
};

export default function RunPage() {
  return (
    <main className="relative min-h-screen">
      <RunBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-5">
        <RunPanel />
      </div>
    </main>
  );
}
