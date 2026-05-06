import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/shared/infrastructure/router/router';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
);
