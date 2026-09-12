import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/store';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 20, 40, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
    </Provider>
  </StrictMode>
);
