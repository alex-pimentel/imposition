import { createRoot } from 'react-dom/client';
import { ServiceShell } from '@agenteresolve/ui';
import { App } from '@imposition/ui';
import './index.css';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <ServiceShell
    title="Imposição"
    description="Monte e organize imagens em páginas A4 e exporte um PDF pronto para impressão."
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
  >
    <App className="h-[calc(100vh-7rem)] min-h-[520px] w-full rounded-xl border border-border" />
  </ServiceShell>,
);
