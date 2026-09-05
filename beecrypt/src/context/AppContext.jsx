import React, { createContext, useCallback, useMemo, useState } from "react";

import {
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

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ---- Auth / workspace ----
  const [currentUser, setCurrentUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);

  // ---- Shared domain state (this is the "single source of truth" that
  // Beekeeper / Processor / Laboratory / KVIC workspaces all read from and
  // write to, so a batch created by a beekeeper is immediately visible
  // to a processor, lab, and admin.) ----
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [batchRelationships, setBatchRelationships] = useState(INITIAL_BATCH_RELATIONSHIPS);
  const [provenanceEvents, setProvenanceEvents] = useState(INITIAL_PROVENANCE_EVENTS);
  const [testRequests, setTestRequests] = useState(INITIAL_TEST_REQUESTS);
  const [qualityResults, setQualityResults] = useState(INITIAL_QUALITY_RESULTS);
  const [certificates, setCertificates] = useState(INITIAL_CERTIFICATES);
  const [pendingApplications, setPendingApplications] = useState(INITIAL_PENDING_APPLICATIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // ---- Toast ----
  const [toast, setToast] = useState(null); // { message, tone }
  const showToast = useCallback((message, tone = "success") => {
    setToast({ message, tone, key: Date.now() });
  }, []);

  // ---- Actor ID resolution for the active workspace ----
  const currentActorId = useMemo(() => {
    if (!currentUser || !workspace) return null;
    if (currentUser.multiActorIds) return currentUser.multiActorIds[workspace];
    return currentUser.actorId;
  }, [currentUser, workspace]);

  // ---- Auth actions ----
  const login = useCallback(async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    setWorkspace(user.roles[0]);
    return user;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setWorkspace(null);
  }, []);

  const switchWorkspace = useCallback((role) => {
    setWorkspace(role);
  }, []);

  const submitRegistration = useCallback(async (formData) => {
    const res = await authService.submitRegistration(formData);
    return res;
  }, []);

  // ---- Provenance helper: create + attach an event in one step ----
  const recordEvent = useCallback(({ batchId, eventType, actorId, occurredAt, payload }) => {
    const event = provenanceService.createEvent({ batchId, eventType, actorId, occurredAt, payload });
    const prepared = blockchainService.prepareEvent(event);
    setProvenanceEvents((prev) => [...prev, prepared]);
    return prepared;
  }, []);

  // ---- Beekeeper actions ----
  const recordExtraction = useCallback(
    ({ hiveId, quantity, extractionDate, honeyType, floralSource, notes }) => {
      const producerId = currentActorId;
      const producerName = currentUser?.name;
      const region = currentUser?.region;
      const newBatch = batchService.createBatch({
        producerId,
        producerName,
        hiveId,
        region,
        honeyType,
        floralSource,
        harvestDate: extractionDate,
        quantity,
      });
      setBatches((prev) => [newBatch, ...prev]);
      recordEvent({ batchId: newBatch.batchId, eventType: "HARVESTED", actorId: producerId, occurredAt: extractionDate, payload: { hiveId, honeyType } });
      recordEvent({ batchId: newBatch.batchId, eventType: "EXTRACTED", actorId: producerId, occurredAt: extractionDate, payload: { quantity, notes: notes || "" } });
      showToast(`Batch ${newBatch.batchId} recorded.`);
      return newBatch;
    },
    [currentActorId, currentUser, recordEvent, showToast]
  );

  // ---- Processor actions ----
  const startProcessing = useCallback(
    (batchId) => {
      setBatches((prev) => processorService.markProcessingStarted(prev, batchId, currentActorId));
      recordEvent({ batchId, eventType: "PROCESSED", actorId: currentActorId, payload: { phase: "started" } });
      showToast(`Processing started for ${batchId}.`);
    },
    [currentActorId, recordEvent, showToast]
  );

  const completeProcessing = useCallback(
    (batchId, processingMethod) => {
      setBatches((prev) => processorService.markProcessingCompleted(prev, batchId, processingMethod));
      recordEvent({ batchId, eventType: "PROCESSED", actorId: currentActorId, payload: { phase: "completed", processingMethod } });
      showToast(`Processing completed for ${batchId}.`);
    },
    [currentActorId, recordEvent, showToast]
  );

  const splitBatchAction = useCallback(
    (batchId, splits) => {
      const parent = batchService.findBatch(batches, batchId);
      if (!parent) return;
      const { children, relationships } = batchService.splitBatch(parent, splits);
      setBatches((prev) => [...prev, ...children]);
      setBatchRelationships((prev) => [...prev, ...relationships]);
      children.forEach((child) => {
        recordEvent({ batchId: child.batchId, eventType: "BATCH_SPLIT", actorId: currentActorId, payload: { parentBatchId: batchId, quantity: child.quantity } });
      });
      showToast(`Batch ${batchId} split into ${children.length} child batches.`);
    },
    [batches, currentActorId, recordEvent, showToast]
  );

  const sendSampleRequest = useCallback(
    ({ batchId, labId, sampleQuantity, tests, requestedDate, notes }) => {
      const req = laboratoryService.submitSampleRequest({ batchId, labId, sampleQuantity, tests, requestedDate, notes });
      setTestRequests((prev) => [req, ...prev]);
      setBatches((prev) => batchService.updateBatch(prev, batchId, { labId, stage: 4 }));
      recordEvent({ batchId, eventType: "QUALITY_TEST_REQUESTED", actorId: currentActorId, payload: { labId, tests } });
      showToast(`Sample request sent for ${batchId}.`);
      return req;
    },
    [currentActorId, recordEvent, showToast]
  );

  // ---- Laboratory actions ----
  const saveAnalysis = useCallback(
    ({ batchId, moisture, sucrose, fructose, glucose, adulteration, testStatus }) => {
      const result = laboratoryService.saveAnalysis({
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
      setQualityResults((prev) => [result, ...prev]);
      setBatches((prev) => batchService.updateBatch(prev, batchId, { testStatus, stage: 5 }));
      recordEvent({
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
    ({ batchId, testDate, result, fileName }) => {
      const cert = certificateService.issueCertificate({
        batchId,
        labId: currentActorId,
        testDate,
        result,
        verifierId: `${currentActorId}-V1`,
        fileName,
      });
      setCertificates((prev) => [cert, ...prev]);
      setBatches((prev) => batchService.updateBatch(prev, batchId, { certificateId: cert.certificateId, certStatus: "CERTIFIED", stage: 6 }));
      recordEvent({ batchId, eventType: "CERTIFICATE_ISSUED", actorId: currentActorId, payload: { certificateId: cert.certificateId } });
      showToast(`Certificate ${cert.certificateId} issued.`);
      return cert;
    },
    [currentActorId, recordEvent, showToast]
  );

  // ---- KVIC actions ----
  const approveApplication = useCallback(
    (name) => {
      setPendingApplications((prev) => prev.map((a) => (a.name === name ? { ...a, status: "Approved" } : a)));
      showToast(`${name} approved.`);
    },
    [showToast]
  );

  const rejectApplication = useCallback(
    (name, _reason) => {
      setPendingApplications((prev) => prev.map((a) => (a.name === name ? { ...a, status: "Rejected" } : a)));
      showToast(`${name}'s application rejected.`, "critical");
    },
    [showToast]
  );

  const value = {
    currentUser,
    workspace,
    currentActorId,
    login,
    logout,
    switchWorkspace,
    submitRegistration,

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

    toast,
    showToast,
    clearToast: () => setToast(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
