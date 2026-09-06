import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import ConsumerLayout from "../layouts/ConsumerLayout.jsx";

// ── Auth & Onboarding: eagerly loaded — critical path, small files ────────────
import Welcome from "../pages/auth/Welcome.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/Signup.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import VerifyOtp from "../pages/auth/VerifyOtp.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import RegistrationPending from "../pages/RegistrationPending.jsx";
import Landing from "../pages/Landing.jsx";

// ── Onboarding steps (eagerly loaded — used in sequential flow immediately) ───
import Step1Welcome    from "../pages/onboarding/Step1Welcome.jsx";
import Step2Role       from "../pages/onboarding/Step2Role.jsx";
import Step3Personal   from "../pages/onboarding/Step3Personal.jsx";
import Step4Org        from "../pages/onboarding/Step4Organization.jsx";
import Step5Security   from "../pages/onboarding/Step5Security.jsx";
import Step6Review     from "../pages/onboarding/Step6Review.jsx";
import { OnboardingProvider } from "../context/OnboardingContext.jsx";

// ── Public consumer route ─────────────────────────────────────────────────────
const Verify = lazy(() => import("../pages/Verify.jsx"));

// ── Shared authenticated pages ────────────────────────────────────────────────
const Profile      = lazy(() => import("../pages/Profile.jsx"));
const Settings     = lazy(() => import("../pages/Settings.jsx"));
const Traceability = lazy(() => import("../pages/Traceability.jsx"));

// ── Beekeeper workspace ───────────────────────────────────────────────────────
const BeekeeperDashboard = lazy(() => import("../pages/beekeeper/Dashboard.jsx"));
const MyHives            = lazy(() => import("../pages/beekeeper/MyHives.jsx"));
const HiveManagement     = lazy(() => import("../pages/beekeeper/HiveManagement.jsx"));
const HiveDetail         = lazy(() => import("../pages/beekeeper/HiveDetail.jsx"));
const LiveMonitoring     = lazy(() => import("../pages/beekeeper/LiveMonitoring.jsx"));
const AIHiveHealth       = lazy(() => import("../pages/beekeeper/AIHiveHealth.jsx"));
const BeekeeperAlerts    = lazy(() => import("../pages/beekeeper/Alerts.jsx"));
const HoneyExtraction    = lazy(() => import("../pages/beekeeper/HoneyExtraction.jsx"));

// ── Processor workspace ───────────────────────────────────────────────────────
const ProcessorDashboard     = lazy(() => import("../pages/processor/Dashboard.jsx"));
const HoneyBatches           = lazy(() => import("../pages/processor/HoneyBatches.jsx"));
const Processing             = lazy(() => import("../pages/processor/Processing.jsx"));
const FindLaboratories       = lazy(() => import("../pages/processor/FindLaboratories.jsx"));
const ProcessorCertifications= lazy(() => import("../pages/processor/Certifications.jsx"));

// ── Laboratory workspace ──────────────────────────────────────────────────────
const LaboratoryDashboard = lazy(() => import("../pages/laboratory/Dashboard.jsx"));
const TestRequests        = lazy(() => import("../pages/laboratory/TestRequests.jsx"));
const PurityAnalysis      = lazy(() => import("../pages/laboratory/PurityAnalysis.jsx"));
const LabCertificates     = lazy(() => import("../pages/laboratory/Certificates.jsx"));

// ── Retailer workspace ────────────────────────────────────────────────────────
const RetailerDashboard    = lazy(() => import("../pages/retailer/Dashboard.jsx"));
const RetailerInventory    = lazy(() => import("../pages/retailer/Inventory.jsx"));
const RetailerVerifyIntake = lazy(() => import("../pages/retailer/VerifyIntake.jsx"));

// ── KVIC admin workspace (heaviest — benefits most from lazy loading) ─────────
const KvicDashboard       = lazy(() => import("../pages/kvic/Dashboard.jsx"));
const UserVerification    = lazy(() => import("../pages/kvic/UserVerification.jsx"));
const Beekeepers          = lazy(() => import("../pages/kvic/Beekeepers.jsx"));
const Processors          = lazy(() => import("../pages/kvic/Processors.jsx"));
const KvicLaboratories    = lazy(() => import("../pages/kvic/Laboratories.jsx"));
const KvicHives           = lazy(() => import("../pages/kvic/Hives.jsx"));
const KvicHoneyBatches    = lazy(() => import("../pages/kvic/HoneyBatches.jsx"));
const KvicCertifications  = lazy(() => import("../pages/kvic/Certifications.jsx"));
const KvicAlerts          = lazy(() => import("../pages/kvic/Alerts.jsx"));
const Analytics           = lazy(() => import("../pages/kvic/Analytics.jsx"));
const BlockchainReadiness = lazy(() => import("../pages/kvic/BlockchainReadiness.jsx"));

import { useAuth } from "../hooks/useAuth.js";
import { canEnterWorkspace, workspaceFromPath } from "../auth/permissions.js";

// Shared loading fallback — lightweight so it renders fast during chunk fetch
function PageLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        fontSize: "14px",
        color: "#8A9086",
        fontFamily: "sans-serif",
      }}
    >
      <span>Loading…</span>
    </div>
  );
}

// Sends the person to their active workspace's dashboard, or to their
// first approved role if no workspace is set yet (e.g. right after login).
function WorkspaceHome() {
  const { currentUser, workspace } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/app/${workspace || currentUser.roles[0]}`} replace />;
}

function AuthorizedWorkspace({ children }) {
  const { currentUser, workspace } = useAuth();
  const location = useLocation();
  const requestedWorkspace = workspaceFromPath(location.pathname);

  if (!currentUser) return <Navigate to="/login" replace />;
  if (requestedWorkspace && !canEnterWorkspace(currentUser, requestedWorkspace)) {
    return <Navigate to={`/app/${workspace || currentUser.roles[0]}`} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/registration-pending" element={<RegistrationPending />} />
        <Route path="/landing" element={<Landing />} />
      </Route>

      {/* ── Onboarding flow (wrapped in shared state provider) ─────────────── */}
      <Route
        path="/onboarding"
        element={
          <OnboardingProvider>
            <PublicLayout />
          </OnboardingProvider>
        }
      >
        <Route index           element={<Step1Welcome />} />
        <Route path="role"     element={<Step2Role />} />
        <Route path="personal" element={<Step3Personal />} />
        <Route path="organization" element={<Step4Org />} />
        <Route path="security" element={<Step5Security />} />
        <Route path="review"   element={<Step6Review />} />
      </Route>

      {/* ── Consumer public route ────────────────────────────────────────────── */}
      <Route element={<ConsumerLayout />}>
        <Route
          path="/verify/:batchId"
          element={
            <Suspense fallback={<PageLoading />}>
              <Verify />
            </Suspense>
          }
        />
      </Route>

      {/* ── Authenticated workspace routes ────────────────────────────────────── */}
      <Route path="/app" element={<AuthorizedWorkspace><AppLayout /></AuthorizedWorkspace>}>
        <Route index element={<WorkspaceHome />} />
        <Route
          path="profile"
          element={<Suspense fallback={<PageLoading />}><Profile /></Suspense>}
        />
        <Route
          path="settings"
          element={<Suspense fallback={<PageLoading />}><Settings /></Suspense>}
        />
        <Route
          path="traceability"
          element={<Suspense fallback={<PageLoading />}><Traceability /></Suspense>}
        />

        <Route path="beekeeper">
          <Route index element={<Suspense fallback={<PageLoading />}><BeekeeperDashboard /></Suspense>} />
          <Route path="hive-management" element={<Suspense fallback={<PageLoading />}><HiveManagement /></Suspense>} />
          <Route path="hive-history"    element={<Suspense fallback={<PageLoading />}><MyHives /></Suspense>} />
          <Route path="hives" element={<Navigate to="/app/beekeeper/hive-history" replace />} />
          <Route path="hives/:hiveId"   element={<Suspense fallback={<PageLoading />}><HiveDetail /></Suspense>} />
          <Route path="monitoring"      element={<Suspense fallback={<PageLoading />}><LiveMonitoring /></Suspense>} />
          <Route path="live-monitoring" element={<Navigate to="/app/beekeeper/monitoring" replace />} />
          <Route path="ai-health"       element={<Suspense fallback={<PageLoading />}><AIHiveHealth /></Suspense>} />
          <Route path="alerts"          element={<Suspense fallback={<PageLoading />}><BeekeeperAlerts /></Suspense>} />
          <Route path="extraction"      element={<Suspense fallback={<PageLoading />}><HoneyExtraction /></Suspense>} />
        </Route>

        <Route path="processor">
          <Route index            element={<Suspense fallback={<PageLoading />}><ProcessorDashboard /></Suspense>} />
          <Route path="batches"   element={<Suspense fallback={<PageLoading />}><HoneyBatches /></Suspense>} />
          <Route path="processing" element={<Suspense fallback={<PageLoading />}><Processing /></Suspense>} />
          <Route path="laboratories" element={<Suspense fallback={<PageLoading />}><FindLaboratories /></Suspense>} />
          <Route path="certifications" element={<Suspense fallback={<PageLoading />}><ProcessorCertifications /></Suspense>} />
        </Route>

        <Route path="laboratory">
          <Route index              element={<Suspense fallback={<PageLoading />}><LaboratoryDashboard /></Suspense>} />
          <Route path="requests"    element={<Suspense fallback={<PageLoading />}><TestRequests /></Suspense>} />
          <Route path="purity"      element={<Suspense fallback={<PageLoading />}><PurityAnalysis /></Suspense>} />
          <Route path="certificates" element={<Suspense fallback={<PageLoading />}><LabCertificates /></Suspense>} />
        </Route>

        <Route path="verifier" element={<Navigate to="/app/laboratory" replace />} />

        <Route path="retailer">
          <Route index            element={<Suspense fallback={<PageLoading />}><RetailerDashboard /></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<PageLoading />}><RetailerInventory /></Suspense>} />
          <Route path="verify"    element={<Suspense fallback={<PageLoading />}><RetailerVerifyIntake /></Suspense>} />
        </Route>

        <Route path="kvic">
          <Route index                   element={<Suspense fallback={<PageLoading />}><KvicDashboard /></Suspense>} />
          <Route path="verification"     element={<Suspense fallback={<PageLoading />}><UserVerification /></Suspense>} />
          <Route path="beekeepers"       element={<Suspense fallback={<PageLoading />}><Beekeepers /></Suspense>} />
          <Route path="processors"       element={<Suspense fallback={<PageLoading />}><Processors /></Suspense>} />
          <Route path="laboratories"     element={<Suspense fallback={<PageLoading />}><KvicLaboratories /></Suspense>} />
          <Route path="hives"            element={<Suspense fallback={<PageLoading />}><KvicHives /></Suspense>} />
          <Route path="batches"          element={<Suspense fallback={<PageLoading />}><KvicHoneyBatches /></Suspense>} />
          <Route path="certifications"   element={<Suspense fallback={<PageLoading />}><KvicCertifications /></Suspense>} />
          <Route path="alerts"           element={<Suspense fallback={<PageLoading />}><KvicAlerts /></Suspense>} />
          <Route path="analytics"        element={<Suspense fallback={<PageLoading />}><Analytics /></Suspense>} />
          <Route path="readiness"        element={<Suspense fallback={<PageLoading />}><BlockchainReadiness /></Suspense>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
