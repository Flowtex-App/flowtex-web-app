import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, type ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';

// MODO DEMO: las paginas SignIn.page / SignUp.page se conservan en el repo
// pero ya no se referencian; /sign-in y /sign-up redirigen a la app.
const UsersListPage          = lazy(() => import('@/iam/interfaces/pages/UsersList.page'));
const DashboardPage          = lazy(() => import('@/form-builder/interfaces/pages/Dashboard.page'));
const FormListPage           = lazy(() => import('@/form-builder/interfaces/pages/FormList.page'));
const FormBuilderPage        = lazy(() => import('@/form-builder/interfaces/pages/FormBuilder.page'));
const FillFormPage           = lazy(() => import('@/tracking/interfaces/pages/FillForm.page'));
const SubmissionsListPage    = lazy(() => import('@/tracking/interfaces/pages/SubmissionsList.page'));
const SubmissionDetailPage   = lazy(() => import('@/tracking/interfaces/pages/SubmissionDetail.page'));

const guarded = (element: ReactNode) => <AuthGuard>{element}</AuthGuard>;

export const router = createBrowserRouter([
  { path: '/',                    element: <Navigate to="/dashboard" replace /> },
  { path: '/sign-in',             element: <Navigate to="/dashboard" replace /> },
  { path: '/sign-up',             element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard',           element: guarded(<DashboardPage />) },
  { path: '/forms',               element: guarded(<FormListPage />) },
  { path: '/forms/new',           element: guarded(<FormBuilderPage />) },
  { path: '/forms/:id',           element: guarded(<FormBuilderPage />) },
  { path: '/forms/:id/fill',      element: guarded(<FillFormPage />) },
  { path: '/users',               element: guarded(<UsersListPage />) },
  { path: '/submissions',         element: guarded(<SubmissionsListPage />) },
  { path: '/submissions/:id',     element: guarded(<SubmissionDetailPage />) },
  { path: '*',                    element: <Navigate to="/dashboard" replace /> },
]);
