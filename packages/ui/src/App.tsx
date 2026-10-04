import { useEffect } from 'react';
import { useImpositionStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { PagePreview } from './components/PagePreview';
import './App.css';

export interface AppProps {
  /** Extra classes for the app root. Defaults to a standalone full-viewport frame. */
  className?: string;
}

export function App({ className = 'h-screen w-screen' }: AppProps = {}) {
  const selectFirst = useImpositionStore((s) => s.selectFirst);
  const items = useImpositionStore((s) => s.items);

  useEffect(() => {
    selectFirst();
  }, [items.length]);

  return (
    <div className={`flex overflow-hidden bg-background text-foreground ${className}`}>
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <Toolbar />
        <PagePreview />
      </main>
    </div>
  );
}
