import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import UploadResumePage from './pages/student/UploadResumePage';
import ResumeHistoryPage from './pages/student/ResumeHistoryPage';
import ATSResultPage from './pages/student/ATSResultPage';
import SkillGapPage from './pages/student/SkillGapPage';
import SkillGapRedirectPage from './pages/student/SkillGapRedirectPage';
import LearningRoadmapPage from './pages/student/LearningRoadmapPage';
import CapstonePage from './pages/student/CapstonePage';
import ProjectWorkspacePage from './pages/student/ProjectWorkspacePage';
import CareerPathwaysPage from './pages/student/CareerPathwaysPage';
import AnalysisHistoryPage from './pages/student/AnalysisHistoryPage';
import ProfilePage from './pages/student/ProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import JobManagementPage from './pages/recruiter/JobManagementPage';
import CandidateScreeningPage from './pages/recruiter/CandidateScreeningPage';

// T&P pages
import TPDashboard from './pages/tp/TPDashboard';
import StudentReadinessPage from './pages/tp/StudentReadinessPage';
import SkillGapAnalyticsPage from './pages/tp/SkillGapAnalyticsPage';
import TrainingPrioritiesPage from './pages/tp/TrainingPrioritiesPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import SkillManagementPage from './pages/admin/SkillManagementPage';

// Shared
import NotFoundPage from './pages/shared/NotFoundPage';

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">
            Loading SkillBridge AI...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const RedirectIfAuth = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === 'recruiter') {
      return <Navigate to="/recruiter" replace />;
    }

    if (user?.role === 'tp_admin' || user?.role === 'super_admin') {
      return <Navigate to="/tp" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>


      {/* =========================
          AUTH ROUTES
      ========================= */}
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />

      <Route
        path="/register"
        element={
          <RedirectIfAuth>
            <RegisterPage />
          </RedirectIfAuth>
        }
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />


      {/* =========================
          STUDENT ROUTES
      ========================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />

        <Route
          path="upload"
          element={<UploadResumePage />}
        />

        <Route
          path="resumes"
          element={<ResumeHistoryPage />}
        />

        <Route
          path="analysis/:id"
          element={<ATSResultPage />}
        />

        {/* 
          Sidebar opens /dashboard/skill-gap.
          This route finds the latest analysis and redirects
          to /dashboard/skill-gap/:id.
        */}
        <Route
          path="skill-gap"
          element={<SkillGapRedirectPage />}
        />

        {/* Actual Skill Gap Analysis page */}
        <Route
          path="skill-gap/:id"
          element={<SkillGapPage />}
        />

        <Route
          path="roadmap"
          element={<LearningRoadmapPage />}
        />

        <Route
          path="projects"
          element={<CapstonePage />}
        />

        <Route
          path="projects/:id"
          element={<ProjectWorkspacePage />}
        />

        <Route
          path="careers"
          element={<CareerPathwaysPage />}
        />

        <Route
          path="history"
          element={<AnalysisHistoryPage />}
        />

        <Route
          path="profile"
          element={<ProfilePage />}
        />

        <Route
          path="notifications"
          element={<NotificationsPage />}
        />
      </Route>


      {/* =========================
          RECRUITER ROUTES
      ========================= */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute
            allowedRoles={['recruiter', 'super_admin']}
          >
            <DashboardLayout role="recruiter" />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<RecruiterDashboard />}
        />

        <Route
          path="create-job"
          element={<CreateJobPage />}
        />

        <Route
          path="jobs"
          element={<JobManagementPage />}
        />

        <Route
          path="jobs/:jobId/candidates"
          element={<CandidateScreeningPage />}
        />

        <Route
          path="notifications"
          element={<NotificationsPage />}
        />
      </Route>


      {/* =========================
          T&P ROUTES
      ========================= */}
      <Route
        path="/tp"
        element={
          <ProtectedRoute
            allowedRoles={['tp_admin', 'super_admin']}
          >
            <DashboardLayout role="tp_admin" />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<TPDashboard />}
        />

        <Route
          path="students"
          element={<StudentReadinessPage />}
        />

        <Route
          path="skill-gaps"
          element={<SkillGapAnalyticsPage />}
        />

        <Route
          path="training"
          element={<TrainingPrioritiesPage />}
        />

        <Route
          path="notifications"
          element={<NotificationsPage />}
        />
      </Route>


      {/* =========================
          ADMIN ROUTES
      ========================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={['super_admin']}
          >
            <DashboardLayout role="super_admin" />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<AdminDashboard />}
        />

        <Route
          path="users"
          element={<UserManagementPage />}
        />

        <Route
          path="skills"
          element={<SkillManagementPage />}
        />

        <Route
          path="notifications"
          element={<NotificationsPage />}
        />
      </Route>


      {/* =========================
          FALLBACK / 404
      ========================= */}
      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>

        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

          <AppRoutes />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,

              style: {
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },

              success: {
                style: {
                  background: '#052e16',
                  color: '#bbf7d0',
                  border: '1px solid #166534',
                },

                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#052e16',
                },
              },

              error: {
                style: {
                  background: '#1c0a09',
                  color: '#fecaca',
                  border: '1px solid #991b1b',
                },

                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1c0a09',
                },
              },
            }}
          />

        </BrowserRouter>

      </AuthProvider>
    </ThemeProvider>
  );
}