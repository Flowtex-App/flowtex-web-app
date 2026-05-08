import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, type ReactNode } from 'react';
import { AuthGuard } from './AuthGuard';

const SignInPage             = lazy(() => import('@/iam/interfaces/pages/SignIn.page'));
const SignUpPage             = lazy(() => import('@/iam/interfaces/pages/SignUp.page'));
const UsersListPage          = lazy(() => import('@/iam/interfaces/pages/UsersList.page'));
const DashboardPage          = lazy(() => import('@/form-builder/interfaces/pages/Dashboard.page'));
const FormListPage           = lazy(() => import('@/form-builder/interfaces/pages/FormList.page'));
const FormBuilderPage        = lazy(() => import('@/form-builder/interfaces/pages/FormBuilder.page'));
const WorkflowListPage       = lazy(() => import('@/workflow/interfaces/pages/WorkflowList.page'));
const WorkflowEditorPage     = lazy(() => import('@/workflow/interfaces/pages/WorkflowEditor.page'));
const FillFormPage           = lazy(() => import('@/tracking/interfaces/pages/FillForm.page'));
const SubmissionsListPage    = lazy(() => import('@/tracking/interfaces/pages/SubmissionsList.page'));
const SubmissionDetailPage   = lazy(() => import('@/tracking/interfaces/pages/SubmissionDetail.page'));

const guarded = (element: ReactNode) => <AuthGuard>{element}</AuthGuard>;

export const router = createBrowserRouter([
  { path: '/',                    element: <Navigate to="/dashboard" replace /> },
  { path: '/sign-in',             element: <SignInPage /> },
  { path: '/sign-up',             element: <SignUpPage /> },
  { path: '/dashboard',           element: guarded(<DashboardPage />) },
  { path: '/forms',               element: guarded(<FormListPage />) },
  { path: '/forms/new',           element: guarded(<FormBuilderPage />) },
  { path: '/forms/:id',           element: guarded(<FormBuilderPage />) },
  { path: '/forms/:id/fill',      element: guarded(<FillFormPage />) },
  { path: '/workflows',           element: guarded(<WorkflowListPage />) },
  { path: '/workflows/new',       element: guarded(<WorkflowEditorPage />) },
  { path: '/workflows/:id',       element: guarded(<WorkflowEditorPage />) },
  { path: '/users',               element: guarded(<UsersListPage />) },
  { path: '/submissions',         element: guarded(<SubmissionsListPage />) },
  { path: '/submissions/:id',     element: guarded(<SubmissionDetailPage />) },
  { path: '*',                    element: <Navigate to="/dashboard" replace /> },
]);
