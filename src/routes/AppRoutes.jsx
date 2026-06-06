import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import Spinner from '../components/common/Spinner';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

const EventsList = lazy(() => import('../pages/events/EventsList'));
const EventDetails = lazy(() => import('../pages/events/EventDetails'));
const ContributorsPage = lazy(() => import('../pages/contributors/ContributorsPage'));
const CardsPage = lazy(() => import('../pages/cards/CardsPage'));
const PublicCard = lazy(() => import('../pages/cards/PublicCard'));
const Reports = lazy(() => import('../pages/Reports'));
const Templates = lazy(() => import('../pages/Templates'));
const Settings = lazy(() => import('../pages/Settings'));

function RouteFallback() {
  return (
    <div className="route-fallback">
      <Spinner size={36} label="Loading…" />
    </div>
  );
}

function Lazy({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route
        path="/card/:cardId"
        element={
          <Lazy>
            <PublicCard />
          </Lazy>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/events"
            element={
              <Lazy>
                <EventsList />
              </Lazy>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <Lazy>
                <EventDetails />
              </Lazy>
            }
          />
          <Route
            path="/contributors"
            element={
              <Lazy>
                <ContributorsPage />
              </Lazy>
            }
          />
          <Route
            path="/cards"
            element={
              <Lazy>
                <CardsPage />
              </Lazy>
            }
          />
          <Route
            path="/reports"
            element={
              <Lazy>
                <Reports />
              </Lazy>
            }
          />
          <Route
            path="/templates"
            element={
              <Lazy>
                <Templates />
              </Lazy>
            }
          />
          <Route
            path="/settings"
            element={
              <Lazy>
                <Settings />
              </Lazy>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
