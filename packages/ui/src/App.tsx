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
    <div className="app-shell">
      <Sidebar />
      <main className="workspace">
        <Toolbar />
        <PagePreview />
      </main>
    </div>
  );
}
