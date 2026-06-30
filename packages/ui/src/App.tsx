import { useEffect } from 'react';
import { useImpositionStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { PagePreview } from './components/PagePreview';
import './App.css';

export function App() {
  const selectFirst = useImpositionStore((s) => s.selectFirst);
  const items = useImpositionStore((s) => s.items);

  useEffect(() => {
    selectFirst();
  }, [items.length]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <Toolbar />
        <PagePreview />
      </main>
    </div>
  );
}
