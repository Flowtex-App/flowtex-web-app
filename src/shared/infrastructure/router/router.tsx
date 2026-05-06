import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';

const SignInPage = lazy(() => import('@/iam/interfaces/pages/SignIn.page'));
const SignUpPage = lazy(() => import('@/iam/interfaces/pages/SignUp.page'));

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/sign-in" replace /> },
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
]);
