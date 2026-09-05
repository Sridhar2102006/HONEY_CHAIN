import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";
import ConsumerLayout from "../layouts/ConsumerLayout.jsx";

import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import RegistrationPending from "../pages/RegistrationPending.jsx";
import Verify from "../pages/Verify.jsx";
import Profile from "../pages/Profile.jsx";
import Settings from "../pages/Settings.jsx";
import Traceability from "../pages/Traceability.jsx";

import BeekeeperDashboard from "../pages/beekeeper/Dashboard.jsx";
import MyHives from "../pages/beekeeper/MyHives.jsx";
import HiveDetail from "../pages/beekeeper/HiveDetail.jsx";
import LiveMonitoring from "../pages/beekeeper/LiveMonitoring.jsx";
import AIHiveHealth from "../pages/beekeeper/AIHiveHealth.jsx";
import BeekeeperAlerts from "../pages/beekeeper/Alerts.jsx";
import HoneyExtraction from "../pages/beekeeper/HoneyExtraction.jsx";

import ProcessorDashboard from "../pages/processor/Dashboard.jsx";
import HoneyBatches from "../pages/processor/HoneyBatches.jsx";
import Processing from "../pages/processor/Processing.jsx";
import FindLaboratories from "../pages/processor/FindLaboratories.jsx";
import ProcessorCertifications from "../pages/processor/Certifications.jsx";

import LaboratoryDashboard from "../pages/laboratory/Dashboard.jsx";
import TestRequests from "../pages/laboratory/TestRequests.jsx";
import PurityAnalysis from "../pages/laboratory/PurityAnalysis.jsx";
import LabCertificates from "../pages/laboratory/Certificates.jsx";

import KvicDashboard from "../pages/kvic/Dashboard.jsx";
import UserVerification from "../pages/kvic/UserVerification.jsx";
import Beekeepers from "../pages/kvic/Beekeepers.jsx";
import Processors from "../pages/kvic/Processors.jsx";
import KvicLaboratories from "../pages/kvic/Laboratories.jsx";
import KvicHives from "../pages/kvic/Hives.jsx";
import KvicHoneyBatches from "../pages/kvic/HoneyBatches.jsx";
import KvicCertifications from "../pages/kvic/Certifications.jsx";
import KvicAlerts from "../pages/kvic/Alerts.jsx";
import Analytics from "../pages/kvic/Analytics.jsx";
import BlockchainReadiness from "../pages/kvic/BlockchainReadiness.jsx";

import { useAuth } from "../hooks/useAuth.js";

// Sends the person to their active workspace's dashboard, or to their
// first approved role if no workspace is set yet (e.g. right after login).
function WorkspaceHome() {
  const { currentUser, workspace } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={`/app/${workspace || currentUser.roles[0]}`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/registration-pending" element={<RegistrationPending />} />
      </Route>

      <Route element={<ConsumerLayout />}>
        <Route path="/verify/:batchId" element={<Verify />} />
      </Route>

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<WorkspaceHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="traceability" element={<Traceability />} />

        <Route path="beekeeper">
          <Route index element={<BeekeeperDashboard />} />
          <Route path="hives" element={<MyHives />} />
          <Route path="hives/:hiveId" element={<HiveDetail />} />
          <Route path="monitoring" element={<LiveMonitoring />} />
          <Route path="ai-health" element={<AIHiveHealth />} />
          <Route path="alerts" element={<BeekeeperAlerts />} />
          <Route path="extraction" element={<HoneyExtraction />} />
        </Route>

        <Route path="processor">
          <Route index element={<ProcessorDashboard />} />
          <Route path="batches" element={<HoneyBatches />} />
          <Route path="processing" element={<Processing />} />
          <Route path="laboratories" element={<FindLaboratories />} />
          <Route path="certifications" element={<ProcessorCertifications />} />
        </Route>

        <Route path="laboratory">
          <Route index element={<LaboratoryDashboard />} />
          <Route path="requests" element={<TestRequests />} />
          <Route path="purity" element={<PurityAnalysis />} />
          <Route path="certificates" element={<LabCertificates />} />
        </Route>

        <Route path="kvic">
          <Route index element={<KvicDashboard />} />
          <Route path="verification" element={<UserVerification />} />
          <Route path="beekeepers" element={<Beekeepers />} />
          <Route path="processors" element={<Processors />} />
          <Route path="laboratories" element={<KvicLaboratories />} />
          <Route path="hives" element={<KvicHives />} />
          <Route path="batches" element={<KvicHoneyBatches />} />
          <Route path="certifications" element={<KvicCertifications />} />
          <Route path="alerts" element={<KvicAlerts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="readiness" element={<BlockchainReadiness />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
