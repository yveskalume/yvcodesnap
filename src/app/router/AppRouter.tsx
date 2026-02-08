import { Navigate, Route, Routes } from 'react-router-dom';
import LandingLayout from '../../layouts/LandingLayout';
import LandingPage from '../../pages/LandingPage';
import Editor from '../../pages/Editor';
import AuthPage from '../../pages/auth/AuthPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<AuthPage mode="login" />} />
      <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
      <Route path="/auth/forgot-password" element={<AuthPage mode="forgot-password" />} />
      <Route path="/editor" element={<Editor />} />
    </Routes>
  );
}
