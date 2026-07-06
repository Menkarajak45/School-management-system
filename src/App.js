import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login      from './pages/Login';
import Signup     from './pages/Signup';
import Dashboard  from './pages/Dashboard';
import Students   from './pages/Students';
import Teachers   from './pages/Teachers';
import Classes    from './pages/Classes';
import Attendance from './pages/Attendance';
import './index.css';

const isAuth = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }) =>
  isAuth() ? children : <Navigate to="/login" replace />;

const PublicRoute = ({ children }) =>
  isAuth() ? <Navigate to="/dashboard" replace /> : children;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Navigate to={isAuth() ? '/dashboard' : '/login'} replace />} />
        <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"     element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students"   element={<PrivateRoute><Students /></PrivateRoute>} />
        <Route path="/teachers"   element={<PrivateRoute><Teachers /></PrivateRoute>} />
        <Route path="/classes"    element={<PrivateRoute><Classes /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
        <Route path="*"           element={<Navigate to={isAuth() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
