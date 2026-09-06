import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import {
  HIVES,
  INITIAL_INSPECTIONS,
  INITIAL_BATCHES,
  INITIAL_BATCH_RELATIONSHIPS,
  INITIAL_PROVENANCE_EVENTS,
  INITIAL_TEST_REQUESTS,
  INITIAL_QUALITY_RESULTS,
  INITIAL_CERTIFICATES,
  INITIAL_PENDING_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from "../data/mockData.js";

import * as authService from "../services/authService.js";
import * as batchService from "../services/batchService.js";
import * as provenanceService from "../services/provenanceService.js";
import * as processorService from "../services/processorService.js";
import * as laboratoryService from "../services/laboratoryService.js";
import * as certificateService from "../services/certificateService.js";
import * as blockchainService from "../services/blockchainService.js";
import * as hiveService from "../services/hiveService.js";
import { canEnterWorkspace } from "../auth/permissions.js";

import hiveApi from "../api/hiveApi.js";
import batchApi from "../api/batchApi.js";
import eventApi from "../api/eventApi.js";
import inspectionApi from "../api/inspectionApi.js";
import labApi from "../api/labApi.js";
import kvicApi from "../api/kvicApi.js";
import notificationApi from "../api/notificationApi.js";
import authApi from "../api/authApi.js";
import sensorApi from "../api/sensorApi.js";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ---- Auth / workspace with localStorage persistence ----
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("beecrypt_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [workspace, setWorkspace] = useState(() => {
    try {
      return localStorage.getItem("beecrypt_workspace") || null;
    } catch {
      return null;
    }
  });

  const loadLocalState = (key, fallback) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  // ---- Shared domain state with localStorage persistence & fresh fallback ----
  const [hives, setHives] = useState(() => loadLocalState("beecrypt_hives", HIVES));
  const [inspections, setInspections] = useState(() => loadLocalState("beecrypt_inspections", INITIAL_INSPECTIONS));
  const [batches, setBatches] = useState(() => loadLocalState("beecrypt_batches", INITIAL_BATCHES));
  const [batchRelationships, setBatchRelationships] = useState(() => loadLocalState("beecrypt_batch_relationships", INITIAL_BATCH_RELATIONSHIPS));
  const [provenanceEvents, setProvenanceEvents] = useState(() => loadLocalState("beecrypt_events", INITIAL_PROVENANCE_EVENTS));
  const [testRequests, setTestRequests] = useState(() => loadLocalState("beecrypt_test_requests", INITIAL_TEST_REQUESTS));
  const [qualityResults, setQualityResults] = useState(() => loadLocalState("beecrypt_quality_results", INITIAL_QUALITY_RESULTS));
  const [certificates, setCertificates] = useState(() => loadLocalState("beecrypt_certificates", INITIAL_CERTIFICATES));
  const [pendingApplications, setPendingApplications] = useState(() => loadLocalState("beecrypt_pending_applications", INITIAL_PENDING_APPLICATIONS));
  const [notifications, setNotifications] = useState(() => loadLocalState("beecrypt_notifications", INITIAL_NOTIFICATIONS));

  // Keep list cards in sync with the same live telemetry stream used by detail views.
  const hiveTelemetryKeys = useMemo(
    () => hives.map((hive) => hive.hiveId).filter(Boolean).sort().join(","),
    [hives]
  );

  useEffect(() => {
    const hiveIds = hiveTelemetryKeys ? hiveTelemetryKeys.split(",") : [];
    if (!hiveIds.length) return undefined;

    let isMounted = true;
    const updateHiveTelemetry = (reading) => {
      if (!isMounted || !reading?.hiveId) return;

      const temperature = Number(reading.temperature);
      const humidity = Number(reading.humidity);
      const vibration = reading.vibrationValue !== undefined
        ? Number(reading.vibrationValue)
        : reading.vibration
        ? 1
        : 0;

      setHives((previous) => previous.map((hive) => (
        hive.hiveId === reading.hiveId
          ? {
              ...hive,
              ...(Number.isFinite(temperature) ? { temp: temperature } : {}),
              ...(Number.isFinite(humidity) ? { humidity } : {}),
              ...(Number.isFinite(vibration) ? { vibration } : {}),
              sensor: "online",
            }
          : hive
      )));
    };

    const unsubscribers = hiveIds.map((hiveId) => {
      sensorApi
        .getLatest({ hiveId })
        .then((response) => updateHiveTelemetry(response?.reading))
        .catch(() => {});

      return sensorApi.subscribeToStream({
        hiveId,
        onReading: updateHiveTelemetry,
      });
    });

    return () => {
      isMounted = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [hiveTelemetryKeys]);

  // Auto-sync domain state to localStorage for persistence across reloads
  useEffect(() => {
    try { localStorage.setItem("beecrypt_hives", JSON.stringify(hives)); } catch {}
  }, [hives]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_inspections", JSON.stringify(inspections)); } catch {}
  }, [inspections]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_batches", JSON.stringify(batches)); } catch {}
  }, [batches]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_batch_relationships", JSON.stringify(batchRelationships)); } catch {}
  }, [batchRelationships]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_events", JSON.stringify(provenanceEvents)); } catch {}
  }, [provenanceEvents]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_test_requests", JSON.stringify(testRequests)); } catch {}
  }, [testRequests]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_quality_results", JSON.stringify(qualityResults)); } catch {}
  }, [qualityResults]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_certificates", JSON.stringify(certificates)); } catch {}
  }, [certificates]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_pending_applications", JSON.stringify(pendingApplications)); } catch {}
  }, [pendingApplications]);
  useEffect(() => {
    try { localStorage.setItem("beecrypt_notifications", JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  // ---- Toast ----
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, tone = "success") => {
    setToast({ message, tone, key: Date.now() });
  }, []);

  // ---- Actor ID resolution for the active workspace ----
  const currentActorId = useMemo(() => {
    if (!currentUser || !workspace) return null;
    if (currentUser.multiActorIds) return currentUser.multiActorIds[workspace];
    return currentUser.actorId;
  }, [currentUser, workspace]);

  // ---- Reset all data for fresh manual testing ----
  const resetAllData = useCallback(async () => {
    setHives([]);
    setInspections([]);
    setBatches([]);
    setBatchRelationships([]);
    setProvenanceEvents([]);
    setTestRequests([]);
    setQualityResults([]);
    setCertificates([]);
    setPendingApplications([]);
    setNotifications([]);

    const keys = [
      "beecrypt_hives",
      "beecrypt_inspections",
      "beecrypt_batches",
      "beecrypt_batch_relationships",
      "beecrypt_events",
      "beecrypt_test_requests",
      "beecrypt_quality_results",
      "beecrypt_certificates",
      "beecrypt_pending_applications",
      "beecrypt_notifications",
    ];
    keys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    try {
      await fetch("http://localhost:3001/api/v1/health/clean", { method: "POST" });
    } catch {}

    showToast("All data wiped! Ready for fresh manual data entry.", "success");
  }, [showToast]);

  // ---- Fetch real backend state on mount or user change ----
  const refreshBackendData = useCallback(async () => {
    try {
      const [
        hivesData,
        batchesData,
        eventsData,
        inspectionsData,
        testReqsData,
        qualityData,
        certsData,
        notifsData,
      ] = await Promise.allSettled([
        hiveApi.listHives(),
        batchApi.listBatches(),
        eventApi.getBatchTimeline(),
        inspectionApi.listInspections(),
        labApi.listTestRequests(),
        labApi.listQualityResults(),
        labApi.listCertificates(),
        notificationApi.listNotifications(),
      ]);

      if (hivesData.status === "fulfilled" && Array.isArray(hivesData.value)) {
        setHives(hivesData.value);
      }
      if (batchesData.status === "fulfilled" && Array.isArray(batchesData.value)) {
        setBatches(batchesData.value);
      }
      if (eventsData.status === "fulfilled" && Array.isArray(eventsData.value)) {
        setProvenanceEvents(eventsData.value);
      }
      if (inspectionsData.status === "fulfilled" && Array.isArray(inspectionsData.value)) {
        setInspections(inspectionsData.value);
      }
      if (testReqsData.status === "fulfilled" && Array.isArray(testReqsData.value)) {
        setTestRequests(testReqsData.value);
      }
      if (qualityData.status === "fulfilled" && Array.isArray(qualityData.value)) {
        setQualityResults(qualityData.value);
      }
      if (certsData.status === "fulfilled" && Array.isArray(certsData.value)) {
        setCertificates(certsData.value);
      }
      if (notifsData.status === "fulfilled" && Array.isArray(notifsData.value)) {
        setNotifications(notifsData.value);
      }
    } catch (err) {
      console.warn("Could not sync live DB data, using local state:", err.message);
    }
  }, []);

  useEffect(() => {
    async function ensureAuthToken() {
      if (!currentUser?.email) return;
      const existingToken = localStorage.getItem("beecrypt_token");
      let isValid = false;
      if (existingToken) {
        try {
          await authApi.getMe();
          isValid = true;
        } catch {
          isValid = false;
        }
      }
      if (!isValid) {
        try {
          await authApi.login(currentUser.email, "demo123");
        } catch (err) {
          console.warn("Backend token synchronization:", err.message);
        }
      }
      await refreshBackendData();
    }
    ensureAuthToken();
  }, [currentUser, refreshBackendData]);

  // ---- Auth actions ----
  const login = useCallback(async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    const initialRole = user.roles?.[0] || "beekeeper";
    setWorkspace(initialRole);
    try {
      localStorage.setItem("beecrypt_user", JSON.stringify(user));
      localStorage.setItem("beecrypt_workspace", initialRole);
    } catch (e) {
      // ignore
    }
    return user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // Demo-only: simulates Google OAuth by resolving the beekeeper demo account.
    // In production, this should initiate a real OAuth2 PKCE flow.
    const user = await authService.loginWithGoogle();
    setCurrentUser(user);
    const initialRole = user.roles?.[0] || "beekeeper";
    setWorkspace(initialRole);
    try {
      localStorage.setItem("beecrypt_user", JSON.stringify(user));
      localStorage.setItem("beecrypt_workspace", initialRole);
    } catch (e) {
      // ignore
    }
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setWorkspace(null);
    try {
      localStorage.removeItem("beecrypt_user");
      localStorage.removeItem("beecrypt_workspace");
      localStorage.removeItem("beecrypt_token");
    } catch (e) {
      // ignore
    }
  }, []);

  const switchWorkspace = useCallback((role) => {
    if (!canEnterWorkspace(currentUser, role)) {
      showToast("That workspace is not assigned to this account.", "critical");
      return false;
    }
    setWorkspace(role);
    try {
      localStorage.setItem("beecrypt_workspace", role);
    } catch (e) {
      // ignore
    }
    return true;
  }, [currentUser, showToast]);

  const submitRegistration = useCallback(async (formData) => {
    try {
      const res = await authApi.register({
        name: formData.name,
        email: formData.email,
        roles: formData.roles || [formData.role || "beekeeper"],
        region: formData.region,
        docs: formData.docs || 1,
      });
      return res;
    } catch (e) {
      return authService.submitRegistration(formData);
    }
  }, []);

  // ---- Provenance helper: create + attach an event in one step ----
  const recordEvent = useCallback(async ({ batchId, eventType, actorId, occurredAt, payload }) => {
    const localEvent = provenanceService.createEvent({ batchId, eventType, actorId, occurredAt, payload });
    const prepared = blockchainService.prepareEvent(localEvent);

    try {
      const saved = await eventApi.recordEvent({
        batchId,
        eventType,
        actorId,
        occurredAt,
        payload,
      });
      setProvenanceEvents((prev) => [...prev, saved || prepared]);
      return saved || prepared;
    } catch (e) {
      setProvenanceEvents((prev) => [...prev, prepared]);
      return prepared;
    }
  }, []);

  // ---- Beekeeper actions ----
  const addHive = useCallback(
    async ({ hiveId, block, region }) => {
      const cleanId = (hiveId || "").trim().toUpperCase();
      if (!cleanId) {
        showToast("Hive ID is required.", "critical");
        return null;
      }
      if (hives.some((h) => h.hiveId === cleanId)) {
        showToast(`Hive ${cleanId} already exists.`, "critical");
        return null;
      }

      const assignedProducer = currentActorId || "BK-001";
      const newHiveData = {
        hiveId: cleanId,
        producerId: assignedProducer,
        region: region || currentUser?.region || "Erode",
        block: block || "Apiary A — Block 06",
        status: "healthy",
        temp: 34.6,
        humidity: 59,
        vibration: 0.30,
        sensor: "online",
        battery: 100,
        createdAt: new Date().toISOString(),
      };

      try {
        const savedHive = await hiveApi.createHive(newHiveData);
        setHives((prev) => [savedHive || newHiveData, ...prev]);
        showToast(`Hive ${cleanId} saved to database!`);
        return savedHive || newHiveData;
      } catch (err) {
        console.error("Failed to save hive to Neon DB:", err);
        setHives((prev) => [newHiveData, ...prev]);
        showToast(`Hive ${cleanId} registered.`);
        return newHiveData;
      }
    },
    [currentActorId, currentUser, hives, showToast]
  );

  const recordInspection = useCallback(
    async ({ hiveId, queenStatus, colonyStrength, notes }) => {
      const hive = hives.find((h) => h.hiveId === hiveId);
      if (!hive) {
        showToast("Hive not found.", "critical");
        return null;
      }

      const producer = currentActorId || hive.producerId || "BK-001";
      const newInsp = {
        inspectionId: `INSP-${Date.now().toString(36).toUpperCase()}`,
        hiveId,
        producerId: producer,
        queenStatus: queenStatus || "Active & Laying",
        colonyStrength: colonyStrength || "Strong (8-10 frames)",
        notes: notes || "",
        inspectedAt: new Date().toISOString(),
      };

      try {
        const saved = await inspectionApi.recordInspection(newInsp);
        setInspections((prev) => [saved || newInsp, ...prev]);
        showToast(`Inspection saved to database for Hive ${hiveId}!`);
      } catch (err) {
        console.error("Failed to save inspection to Neon DB:", err);
        setInspections((prev) => [newInsp, ...prev]);
        showToast(`Inspection logged for Hive ${hiveId}.`);
      }

      if (queenStatus?.toLowerCase().includes("absent")) {
        setHives((prev) =>
          prev.map((h) => (h.hiveId === hiveId ? { ...h, status: "critical" } : h))
        );
        try {
          await hiveApi.updateHive(hiveId, { status: "critical" });
        } catch (e) {
          // ignore
        }
      }
      return newInsp;
    },
    [currentActorId, hives, showToast]
  );

  const recordExtraction = useCallback(
    async ({ hiveId, quantity, extractionDate, honeyType, floralSource, notes }) => {
      const producerId = currentActorId || "BK-001";
      const hive = hives.find((h) => h.hiveId === hiveId);

      let newBatch;
      try {
        newBatch = batchService.createBatch({
          producerId,
          producerName: currentUser?.name || "Independent Beekeeper",
          hiveId,
          region: currentUser?.region || hive?.region || "Erode",
          honeyType,
          floralSource,
          harvestDate: extractionDate,
          quantity,
        });
      } catch (error) {
        showToast(error.message, "critical");
        return null;
      }

      try {
        const savedBatch = await batchApi.createBatch(newBatch);
        if (savedBatch) newBatch = savedBatch;
        showToast(`Batch ${newBatch.batchId} saved to database!`);
      } catch (err) {
        console.error("Backend batch creation fallback:", err);
        showToast(`Batch ${newBatch.batchId} recorded.`);
      }

      setBatches((prev) => [newBatch, ...prev]);
      await recordEvent({ batchId: newBatch.batchId, eventType: "HARVESTED", actorId: producerId, occurredAt: extractionDate, payload: { hiveId, honeyType } });
      await recordEvent({ batchId: newBatch.batchId, eventType: "EXTRACTED", actorId: producerId, occurredAt: extractionDate, payload: { quantity, notes: notes || "" } });
      return newBatch;
    },
    [currentActorId, currentUser, hives, recordEvent, showToast]
  );

  // ---- Processor actions ----
  const startProcessing = useCallback(
    async (batchId) => {
      try {
        setBatches((prev) => processorService.markProcessingStarted(prev, batchId, currentActorId));
        await batchApi.updateBatch(batchId, { stage: 2, processingStatus: "In Progress", processorId: currentActorId });
      } catch (error) {
        console.error("Processing started error:", error);
      }
      await recordEvent({ batchId, eventType: "PROCESSED", actorId: currentActorId, payload: { phase: "started" } });
      showToast(`Processing started for ${batchId}.`);
    },
    [currentActorId, recordEvent, showToast]
  );

  const completeProcessing = useCallback(
    async (batchId, processingMethod) => {
      try {
        setBatches((prev) => processorService.markProcessingCompleted(prev, batchId, processingMethod));
        await batchApi.updateBatch(batchId, { stage: 3, processingStatus: "Completed", processingMethod });
      } catch (error) {
        console.error("Processing completed error:", error);
      }
      await recordEvent({ batchId, eventType: "PROCESSED", actorId: currentActorId, payload: { phase: "completed", processingMethod } });
      showToast(`Processing completed for ${batchId}.`);
    },
    [currentActorId, recordEvent, showToast]
  );

  const splitBatchAction = useCallback(
    async (batchId, splits) => {
      const parent = batchService.findBatch(batches, batchId);
      if (!parent) {
        showToast("Batch not found.", "critical");
        return null;
      }
      let children;
      let relationships;
      try {
        ({ children, relationships } = batchService.splitBatch(parent, splits));
      } catch (error) {
        showToast(error.message, "critical");
        return null;
      }

      try {
        await batchApi.splitBatch(batchId, splits);
      } catch (e) {
        console.warn("Split batch API fallback:", e.message);
      }

      setBatches((prev) => [...prev, ...children]);
      setBatchRelationships((prev) => [...prev, ...relationships]);
      for (const child of children) {
        await recordEvent({ batchId: child.batchId, eventType: "BATCH_SPLIT", actorId: currentActorId, payload: { parentBatchId: batchId, quantity: child.quantity } });
      }
      showToast(`Batch ${batchId} split into ${children.length} child batches.`);
    },
    [batches, currentActorId, recordEvent, showToast]
  );

  const sendSampleRequest = useCallback(
    async ({ batchId, labId, sampleQuantity, tests, requestedDate, notes }) => {
      let req;
      try {
        req = laboratoryService.submitSampleRequest({ batchId, labId, sampleQuantity, tests, requestedDate, notes });
      } catch (error) {
        showToast(error.message, "critical");
        return null;
      }

      try {
        await labApi.submitSampleRequest({
          batchId,
          labId,
          sampleQuantityMl: sampleQuantity,
          tests,
          requestedDate,
          notes,
        });
      } catch (e) {
        console.warn("Lab sample request fallback:", e.message);
      }

      setTestRequests((prev) => [req, ...prev]);
      setBatches((prev) => batchService.updateBatch(prev, batchId, { labId, stage: 4 }));
      await recordEvent({ batchId, eventType: "QUALITY_TEST_REQUESTED", actorId: currentActorId, payload: { labId, tests } });
      showToast(`Sample request sent for ${batchId}.`);
      return req;
    },
    [currentActorId, recordEvent, showToast]
  );

  // ---- Laboratory actions ----
  const saveAnalysis = useCallback(
    async ({ batchId, moisture, sucrose, fructose, glucose, adulteration, testStatus }) => {
      let result;
      try {
        result = laboratoryService.saveAnalysis({
          batchId,
          labId: currentActorId,
          moisture,
          sucrose,
          fructose,
          glucose,
          adulteration,
          testStatus,
          verifierId: `${currentActorId}-V1`,
        });
      } catch (error) {
        showToast(error.message, "critical");
        return null;
      }

      try {
        await labApi.saveAnalysis({
          batchId,
          labId: currentActorId,
          moisture,
          sucrose,
          fructose,
          glucose,
          adulteration,
          testStatus,
          verifierId: `${currentActorId}-V1`,
        });
      } catch (e) {
        console.warn("Save analysis API fallback:", e.message);
      }

      setQualityResults((prev) => [result, ...prev]);
      setBatches((prev) => batchService.updateBatch(prev, batchId, { testStatus, stage: 5 }));
      await recordEvent({
        batchId,
        eventType: "QUALITY_VERIFY",
        actorId: currentActorId,
        payload: { testId: result.testId, result: testStatus },
      });
      showToast(`Analysis saved for ${batchId}.`);
      return result;
    },
    [currentActorId, recordEvent, showToast]
  );

  const issueCertificate = useCallback(
    async ({ batchId, testDate, result, fileName }) => {
      const cert = certificateService.issueCertificate({
        batchId,
        labId: currentActorId,
        testDate,
        result,
        verifierId: `${currentActorId}-V1`,
        fileName,
      });

      try {
        await labApi.issueCertificate({
          batchId,
          labId: currentActorId,
          testDate,
          result,
          verifierId: `${currentActorId}-V1`,
          fileName,
        });
      } catch (e) {
        console.warn("Issue certificate API fallback:", e.message);
      }

      setCertificates((prev) => [cert, ...prev]);
      setBatches((prev) => batchService.updateBatch(prev, batchId, { certificateId: cert.certificateId, certStatus: "CERTIFIED", stage: 6 }));
      await recordEvent({ batchId, eventType: "CERTIFICATE_ISSUED", actorId: currentActorId, payload: { certificateId: cert.certificateId } });
      showToast(`Certificate ${cert.certificateId} issued.`);
      return cert;
    },
    [currentActorId, recordEvent, showToast]
  );

  // ---- KVIC actions ----
  const approveApplication = useCallback(
    async (name) => {
      const app = pendingApplications.find((a) => a.name === name);
      if (app?.id) {
        try {
          await kvicApi.reviewApplication(app.id, "Approved");
        } catch (e) {
          // ignore
        }
      }
      setPendingApplications((prev) => prev.map((a) => (a.name === name ? { ...a, status: "Approved" } : a)));
      showToast(`${name} approved.`);
    },
    [pendingApplications, showToast]
  );

  const rejectApplication = useCallback(
    async (name, _reason) => {
      const app = pendingApplications.find((a) => a.name === name);
      if (app?.id) {
        try {
          await kvicApi.reviewApplication(app.id, "Rejected");
        } catch (e) {
          // ignore
        }
      }
      setPendingApplications((prev) => prev.map((a) => (a.name === name ? { ...a, status: "Rejected" } : a)));
      showToast(`${name}'s application rejected.`, "critical");
    },
    [pendingApplications, showToast]
  );

  const value = {
    currentUser,
    workspace,
    currentActorId,
    login,
    loginWithGoogle,
    logout,
    switchWorkspace,
    submitRegistration,

    hives,
    setHives,
    addHive,
    inspections,
    recordInspection,

    batches,
    batchRelationships,
    provenanceEvents,
    testRequests,
    qualityResults,
    certificates,
    pendingApplications,
    notifications,

    recordExtraction,
    startProcessing,
    completeProcessing,
    splitBatchAction,
    sendSampleRequest,
    saveAnalysis,
    issueCertificate,
    approveApplication,
    rejectApplication,
    resetAllData,

    toast,
    showToast,
    clearToast: () => setToast(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
