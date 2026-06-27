import { createRoot } from 'react-dom/client';
import { App } from '@imposition/ui';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
