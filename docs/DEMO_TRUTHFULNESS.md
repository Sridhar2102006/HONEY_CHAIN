# HoneyChain SIH'26 — Product Truthfulness & Jury Disclosure Guide

## 1. Core Principle: Defensible Engineering
In competitive hackathons such as the Smart India Hackathon (SIH 2026), presenting mock or simulated systems as real cryptographic or deep-learning implementations is a major failure mode that jury members and technical evaluators immediately detect.

This document establishes the official truthfulness baseline for HoneyChain/BeeCrypt: **Celebrate genuine engineering achievements while being 100% transparent about simulation boundaries.**

---

## 2. Capability Transparency Matrix

| Feature Area | What is Genuinely Implemented | What is Simulated / Prototype | Proper Technical Presentation to Jury |
|---|---|---|---|
| **IoT Telemetry** | ESP32 DevKit V1 DHT11 & SW-420 sensors transmitting real-time micro-climate & vibration data over HTTP into MongoDB Atlas; Server-Sent Events (SSE) broadcasting live readings. | Battery sleep profile and persistent LittleFS flash buffer during offline periods are prototype architecture. | "Real-time cyber-physical IoT telemetry pipeline deployed to cloud time-series database with live reactive frontend streaming." |
| **Camera Inspection** | Physical ESP32-CAM OV2640 module direct streaming binary JPEGs via backend authenticated proxy into MongoDB GridFS bucket. | Hardware concurrency lock prevents sensor collisions. | "Authenticated edge vision gateway streaming hardware captures directly into cloud blob storage." |
| **AI Hive Health** | UI workflow, frame mapping to inspection records, worker brood health scoring interface. | Disease diagnosis uses a deterministic prototype formula based on frame file attributes rather than an onboard deep-learning CNN. | "Prototype AI inspection workflow with simulated pest diagnostics, architected with a clean adapter seam for TensorFlow Lite / ONNX model integration." |
| **Blockchain Provenance** | Cryptographic SHA-256 event chaining (`payload_hash` linked to `previous_event_hash`) persisted in PostgreSQL `provenance_events`. | Zero on-chain smart contracts deployed; no gas fees or wallet signing active. | "Cryptographically-chained relational provenance ledger providing tamper-evident audit trails, engineered as an on-chain anchoring seam for Ethereum/Polygon rollups." |
| **Consumer QR Verification** | Dynamic QR code generation resolving to `/verify/:batchId`; public read-only API endpoint exposing origin, floral source, and AGMARK test metrics. | Digital signature validation using asymmetric public-key infrastructure (PKI) is in prototype design. | "End-to-end QR consumer verification displaying laboratory certificate attributes and supply-chain custody history." |
| **Multi-Role Workspaces** | Five distinct workspace interfaces (Beekeeper, Processor, Lab, Retailer, Admin) with server-enforced role authentication. | Identity federation with external government registries is architectural. | "Full-lifecycle role-based access control with server-enforced permissions for all supply-chain stakeholders." |

---

## 3. Disallowed Demo Claims
- ❌ **DO NOT SAY:** "Our smart contract on Ethereum verified this batch."  
  ✔️ **DO SAY:** "Our system computes an immutable SHA-256 hash chain on every lifecycle transition, designed to anchor as Merkle roots on an EVM-compatible chain."
- ❌ **DO NOT SAY:** "Our deep learning convolutional neural network detected 98.4% Varroa mite infestation."  
  ✔️ **DO SAY:** "We have built the complete end-to-end AI diagnosis workflow and camera capture bridge, currently running in simulation mode ready for our fine-tuned YOLOv8 dataset."
- ❌ **DO NOT SAY:** "The honey batch is blockchain-confirmed."  
  ✔️ **DO SAY:** "The batch has an unbroken cryptographic provenance trail verified across our audit database."
