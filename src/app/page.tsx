import ASCIIViewer from '@/components/ASCIIViewer';
import ControlsPanel from '@/components/ControlsPanel';
import CapturePanel from '@/components/CapturePanel';

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-black text-green-500 font-mono selection:bg-green-500/30">
      <ControlsPanel />
      
      <div className="flex-1 relative p-6 flex flex-col items-center justify-center">
        <header className="absolute top-6 left-6 z-10 flex flex-col pointer-events-none">
          <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-shadow-neon">A S C I I _ V I S I O N</h1>
          <p className="text-xs text-green-600 mt-1">v2.0.1 // NEURAL RENDER PIPELINE</p>
        </header>

        <div className="w-full h-full relative group">
          <ASCIIViewer />
          <CapturePanel />
        </div>
      </div>
    </main>
  );
}
