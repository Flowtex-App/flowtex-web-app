import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, type ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';

const SignInPage      = lazy(() => import('@/iam/interfaces/pages/SignIn.page'));
const SignUpPage      = lazy(() => import('@/iam/interfaces/pages/SignUp.page'));
const DashboardPage   = lazy(() => import('@/form-builder/interfaces/pages/Dashboard.page'));
const FormListPage    = lazy(() => import('@/form-builder/interfaces/pages/FormList.page'));
const FormBuilderPage = lazy(() => import('@/form-builder/interfaces/pages/FormBuilder.page'));

const guarded = (element: ReactNode) => <AuthGuard>{element}</AuthGuard>;

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
  { path: '/dashboard', element: guarded(<DashboardPage />) },
  { path: '/forms', element: guarded(<FormListPage />) },
  { path: '/forms/new', element: guarded(<FormBuilderPage />) },
  { path: '/forms/:id', element: guarded(<FormBuilderPage />) },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
