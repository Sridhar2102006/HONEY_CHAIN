"""
build_master_audit_pdf.py
Generates the comprehensive, publication-grade HoneyChain SIH'26 Master System Audit Report PDF.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress on cover page

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, 11 * inch - 36, "HONEYCHAIN (BEECRYPT) — SIH'26 MASTER FORENSIC AUDIT REPORT")
        self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "CONFIDENTIAL // TECHNICAL AUDIT")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer
        self.line(54, 46, 8.5 * inch - 54, 46)
        self.setFont("Helvetica", 8)
        self.drawString(54, 34, "Smart India Hackathon 2026 · Problem Statement PS 26021 · Ministry of Jal Shakti / KVIC")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_text)
        self.restoreState()

def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F172A")    # Slate 900
    accent_gold = colors.HexColor("#B45309")      # Amber 700
    accent_green = colors.HexColor("#15803D")     # Green 700
    danger_red = colors.HexColor("#B91C1C")       # Red 700
    text_muted = colors.HexColor("#475569")       # Slate 600

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=primary_color,
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=accent_gold,
        spaceAfter=24
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_green,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'AuditBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'AuditBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_danger_style = ParagraphStyle(
        'CalloutDanger',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=danger_red
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1E293B")
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("SMART INDIA HACKATHON 2026 · PS 26021", ParagraphStyle('SubHeaderTag', fontName='Helvetica-Bold', fontSize=10, textColor=accent_gold, spaceAfter=8)))
    story.append(Paragraph("HoneyChain (BeeCrypt)", title_style))
    story.append(Paragraph("Full-System Production Error, Vulnerability & Truthfulness Forensic Audit Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=3, color=accent_gold, spaceBefore=0, spaceAfter=20))

    meta_data = [
        [Paragraph("<b>Target System:</b>", body_style), Paragraph("BeeCrypt Honey Traceability System (Frontend, Backend API, Dual DB, ESP32)", body_style)],
        [Paragraph("<b>Audit Date:</b>", body_style), Paragraph("September 18, 2026", body_style)],
        [Paragraph("<b>Auditor Profile:</b>", body_style), Paragraph("Principal Systems Architect · Security Lead · QA Lead · DevOps · IoT Lead", body_style)],
        [Paragraph("<b>Evaluation Scope:</b>", body_style), Paragraph("Frontend, Backend, Dual DB (Postgres/Mongo), IoT, Firmware, Camera, Blockchain, Security, Mobile, CI/CD", body_style)],
        [Paragraph("<b>Automated Tests:</b>", body_style), Paragraph("55 Passed / 0 Failed (rem/sec/cam/sen) · API integration suite omitted from CI script", body_style)],
        [Paragraph("<b>Overall Assessment:</b>", body_style), Paragraph("<font color='#B91C1C'><b>NOT PRODUCTION READY — CRITICAL SECURITY & INTEGRITY BLOCKERS IDENTIFIED</b></font>", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[130, 374])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 30))

    exec_summary_box = [
        [Paragraph("<b>CRITICAL FORENSIC AUDIT DISCLOSURE</b>", ParagraphStyle('AlertHeader', fontName='Helvetica-Bold', fontSize=10, textColor=danger_red))],
        [Paragraph("This comprehensive forensic audit evaluated the entire codebase without modification. While the user interface displays exceptional modern aesthetics and responsive state handling, <b>the underlying system contains severe architectural blockers</b>: an unauthenticated public database wipe endpoint (POST /api/v1/health/clean), plaintext production cloud credentials committed in repository configuration, complete lack of real on-chain cryptographic anchoring, spoofable IoT sensor endpoints, and fake string-hashed AI health predictions. This report provides the definitive root-cause analysis and prioritized remediation roadmap.", body_style)]
    ]
    alert_table = Table(exec_summary_box, colWidths=[504])
    alert_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF2F2")),
        ('BOX', (0,0), (-1,-1), 1.5, danger_red),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(alert_table)
    story.append(PageBreak())

    # =========================================================================
    # 1. EXECUTIVE SUMMARY & DASHBOARD SCORECARD
    # =========================================================================
    story.append(Paragraph("1. Executive Summary & Forensic Scorecard", h1_style))
    story.append(Paragraph("The audit evaluated thirteen independent readiness dimensions to ensure complete objectivity rather than computing an arbitrary singular grade. The findings categorize system state across functional reality, security boundaries, and demonstration reliability.", body_style))

    scorecard_data = [
        [Paragraph("Dimension", table_header_style), Paragraph("Current State", table_header_style), Paragraph("Critical Gaps", table_header_style), Paragraph("Demo Status", table_header_style)],
        [Paragraph("<b>Functional Correctness</b>", table_cell_bold), Paragraph("Role-based workflows, harvesting, processing, testing", table_cell_style), Paragraph("Permissive PATCH, no backend stage machine order", table_cell_style), Paragraph("<font color='#D97706'>PARTIAL</font>", table_cell_bold)],
        [Paragraph("<b>Security Readiness</b>", table_cell_bold), Paragraph("Bcrypt, rate limiter on login, JWT cookies", table_cell_style), Paragraph("Unauth DB clean, committed cloud keys, IDOR on batch/hive", table_cell_style), Paragraph("<font color='#DC2626'>FAILED</font>", table_cell_bold)],
        [Paragraph("<b>Backend API Readiness</b>", table_cell_bold), Paragraph("Express 4 router, modular routes, error handlers", table_cell_style), Paragraph("Missing tenant scoping on captures/sensors, unauth SSE", table_cell_style), Paragraph("<font color='#D97706'>MODERATE</font>", table_cell_bold)],
        [Paragraph("<b>Database Integrity</b>", table_cell_bold), Paragraph("Neon PostgreSQL + MongoDB Atlas GridFS & Timeseries", table_cell_style), Paragraph("Missing FK on producer_id/actor_id, no MongoDB TTL", table_cell_style), Paragraph("<font color='#D97706'>MODERATE</font>", table_cell_bold)],
        [Paragraph("<b>UX / UI Aesthetics</b>", table_cell_bold), Paragraph("Tailwind, Lucide icons, responsive drawer, animations", table_cell_style), Paragraph("Unit mismatch (kg vs L), dead QR domain link", table_cell_style), Paragraph("<font color='#15803D'>EXCELLENT</font>", table_cell_bold)],
        [Paragraph("<b>Accessibility Readiness</b>", table_cell_bold), Paragraph("Semantic tags, high contrast, clean hierarchy", table_cell_style), Paragraph("Accordion missing aria-expanded, missing alt labels", table_cell_style), Paragraph("<font color='#D97706'>GOOD</font>", table_cell_bold)],
        [Paragraph("<b>IoT Sensor Pipeline</b>", table_cell_bold), Paragraph("ESP32 DevKit DHT11/SW-420, SSE live streaming", table_cell_style), Paragraph("3s flooding, hardcoded IP, unencrypted HTTP, unauth SSE", table_cell_style), Paragraph("<font color='#D97706'>FRAGILE</font>", table_cell_bold)],
        [Paragraph("<b>Camera / Optical Pipeline</b>", table_cell_bold), Paragraph("ESP32-CAM JPEG direct stream, GridFS storage", table_cell_style), Paragraph("Zero tenant auth on captures, SSRF risk on ESP32_IP", table_cell_style), Paragraph("<font color='#D97706'>FUNCTIONAL</font>", table_cell_bold)],
        [Paragraph("<b>Blockchain Readiness</b>", table_cell_bold), Paragraph("Off-chain SHA-256 payload chaining in PostgreSQL", table_cell_style), Paragraph("Zero smart contracts, no wallet signing, no RPC node", table_cell_style), Paragraph("<font color='#DC2626'>SIMULATED</font>", table_cell_bold)],
        [Paragraph("<b>Mobile / Capacitor</b>", table_cell_bold), Paragraph("Capacitor 6 sync, Android release workflow, camera plugin", table_cell_style), Paragraph("cleartext:false blocks HTTP LAN backend & camera", table_cell_style), Paragraph("<font color='#DC2626'>BLOCKED</font>", table_cell_bold)],
        [Paragraph("<b>CI / CD Readiness</b>", table_cell_bold), Paragraph("GitHub Actions for CI, Android APK, iOS release", table_cell_style), Paragraph("Test failure suppression (|| echo), missing Dockerfile", table_cell_style), Paragraph("<font color='#DC2626'>COMPROMISED</font>", table_cell_bold)],
        [Paragraph("<b>Testing Maturity</b>", table_cell_bold), Paragraph("55 unit/integration tests in tests/ suite", table_cell_style), Paragraph("tests/api.test.js excluded from npm test, no E2E/Cypress", table_cell_style), Paragraph("<font color='#D97706'>MODERATE</font>", table_cell_bold)],
        [Paragraph("<b>Observability & Logs</b>", table_cell_bold), Paragraph("Console logs with prefixes ([CAMERA], [SENSORS])", table_cell_style), Paragraph("No structured logging (Winston/Pino), no APM or metrics", table_cell_style), Paragraph("<font color='#D97706'>BASIC</font>", table_cell_bold)],
    ]
    score_table = Table(scorecard_data, colWidths=[110, 150, 164, 80])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Executive Summary Findings:</b>", h2_style))
    story.append(Paragraph("• <b>What Works:</b> The frontend UI is responsive and richly designed; database migrations build 10 relational tables; 55 tests pass locally; ESP32-CAM streams JPEGs directly to MongoDB GridFS; real-time SSE broadcasts telemetry.", bullet_style))
    story.append(Paragraph("• <b>What is Broken:</b> Android mobile builds cannot connect to local HTTP backends due to cleartext policies; QR codes encode non-existent domain beecrypt.demo; CI ignores test errors; API tests require a manual running server.", bullet_style))
    story.append(Paragraph("• <b>What is Risky:</b> Public unauthenticated endpoint /api/v1/health/clean wipes all database data; live cloud credentials in server/.env allow unauthorized access to Neon and MongoDB Atlas.", bullet_style))
    story.append(Paragraph("• <b>What is Misleading:</b> Verification screens claim 'Trust Seal' and 'Ledger Trail' despite zero blockchain integration; AI Hive Health uses string hash math instead of computer vision.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # 2. APPLICATION ARCHITECTURE & DATA FLOW
    # =========================================================================
    story.append(Paragraph("2. Full Application Architecture & Data Flow", h1_style))
    story.append(Paragraph("HoneyChain is designed as a multi-tier cyber-physical supply chain system:", body_style))

    story.append(Paragraph("<b>Tier 1: Physical Edge Hardware</b>", h2_style))
    story.append(Paragraph("• <b>ESP32 DevKit V1 Sensor Node:</b> Interfaces with a DHT11 temperature/humidity sensor (GPIO 4) and SW-420 digital vibration sensor (GPIO 5). Transmits JSON telemetry every 3 seconds via HTTP POST to /api/v1/sensors/telemetry.", bullet_style))
    story.append(Paragraph("• <b>ESP32-CAM AI Vision Node:</b> OV2640 optical sensor capturing apiary honeycomb frames. Operates in direct-stream mode triggered by backend proxy requests to /capture?hiveId=...", bullet_style))

    story.append(Paragraph("<b>Tier 2: Backend API & Dual-Database Storage</b>", h2_style))
    story.append(Paragraph("• <b>Express 4 Application Server:</b> Mounted on Node.js 22 with Helmet, CORS, CookieParser, and modular REST controllers.", bullet_style))
    story.append(Paragraph("• <b>Neon Serverless PostgreSQL:</b> Primary relational store managing users, organizations, hives, batches, batch splits, inspections, lab test requests, quality metrics, and off-chain provenance logs.", bullet_style))
    story.append(Paragraph("• <b>MongoDB Atlas Cluster:</b> Document store for high-velocity IoT time-series readings (READINGS collection) and binary camera frames via GridFS (images bucket).", bullet_style))

    story.append(Paragraph("<b>Tier 3: Client Experience & Mobile Shell</b>", h2_style))
    story.append(Paragraph("• <b>Vite / React 18 SPA:</b> Client-side state managed by AppContext with LocalStorage synchronization. Implements five distinct workspaces (Beekeeper, Processor, Laboratory, Retailer, KVIC Admin).", bullet_style))
    story.append(Paragraph("• <b>Capacitor 6 Native Container:</b> Wraps the built web bundle into native Android Studio and iOS Xcode project targets.", bullet_style))
    story.append(Spacer(1, 10))

    # Architecture Table
    arch_data = [
        [Paragraph("Subsystem", table_header_style), Paragraph("Technologies", table_header_style), Paragraph("Primary Role", table_header_style), Paragraph("Critical Flaw", table_header_style)],
        [Paragraph("<b>Frontend SPA</b>", table_cell_bold), Paragraph("React 18, Vite 5, Tailwind 3, Recharts, Lucide", table_cell_style), Paragraph("Multi-workspace UI & consumer verification", table_cell_style), Paragraph("Silent mock fallback on auth failure", table_cell_style)],
        [Paragraph("<b>Backend API</b>", table_cell_bold), Paragraph("Node.js 22, Express 4.19, Helmet, JWT, Bcrypt", table_cell_style), Paragraph("REST API, hardware proxy, SSE broadcast", table_cell_style), Paragraph("Unauth /health/clean endpoint wipes DB", table_cell_style)],
        [Paragraph("<b>Relational DB</b>", table_cell_bold), Paragraph("Neon Serverless PostgreSQL (pg driver 8.11)", table_cell_style), Paragraph("Structured domain entity & provenance storage", table_cell_style), Paragraph("Credentials exposed in server/.env", table_cell_style)],
        [Paragraph("<b>NoSQL Storage</b>", table_cell_bold), Paragraph("MongoDB Atlas 6.18, GridFSBucket", table_cell_style), Paragraph("IoT time-series and JPEG image blobs", table_cell_style), Paragraph("Unbounded collection growth, no TTL", table_cell_style)],
        [Paragraph("<b>Telemetry Node</b>", table_cell_bold), Paragraph("ESP32 DevKit, DHT11, SW-420, HTTPClient", table_cell_style), Paragraph("Hive micro-climate & vibration sensing", table_cell_style), Paragraph("Hardcoded IP, 3s loop flooding, no sleep", table_cell_style)],
        [Paragraph("<b>Camera Node</b>", table_cell_bold), Paragraph("ESP32-CAM, OV2640, JPEG Direct Stream", table_cell_style), Paragraph("Visual comb inspection & brood capture", table_cell_style), Paragraph("No tenant ownership check on captures", table_cell_style)],
        [Paragraph("<b>Blockchain</b>", table_cell_bold), Paragraph("Simulated Seam (SHA-256 payload chaining)", table_cell_style), Paragraph("Placeholder provenance integrity layer", table_cell_style), Paragraph("No real chain; misleading UI badges", table_cell_style)],
        [Paragraph("<b>Mobile Wrapper</b>", table_cell_bold), Paragraph("Capacitor 6.2, Android Gradle, CocoaPods", table_cell_style), Paragraph("Android / iOS hybrid mobile app", table_cell_style), Paragraph("Cleartext HTTP blocked on Android", table_cell_style)],
    ]
    arch_table = Table(arch_data, colWidths=[90, 140, 140, 134])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(arch_table)
    story.append(PageBreak())

    # =========================================================================
    # 3. COMPLETE AUDIT METHODOLOGY & EVIDENCE STANDARDS
    # =========================================================================
    story.append(Paragraph("3. Forensic Audit Methodology & Standards", h1_style))
    story.append(Paragraph("The audit executed strict forensic verification adhering to OWASP Application Security Verification Standard (ASVS 4.0), NIST SP 800-115, and CWE/SANS Top 25 standards. All assertions are backed by exact source lines and reproducible conditions.", body_style))

    story.append(Paragraph("<b>Three-Tier Verification Criteria:</b>", h2_style))
    story.append(Paragraph("1. <font color='#15803D'><b>VERIFIED:</b></font> Empirically confirmed through automated test execution, direct source code analysis, database schema inspection, or runtime network probing. Zero ambiguity.", bullet_style))
    story.append(Paragraph("2. <font color='#D97706'><b>LIKELY:</b></font> Logically derived from architecture patterns, missing configurations, or known dependency vulnerabilities, awaiting physical deployment verification.", bullet_style))
    story.append(Paragraph("3. <font color='#64748B'><b>UNVERIFIED:</b></font> Explicitly marked where external physical systems (physical cellular networks, hardware testbenches, live mainnets) were absent from the audit sandbox.", bullet_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Automated Static & Dynamic Inspection Summary:</b>", h2_style))
    story.append(Paragraph("• <b>Automated Test Suite:</b> Node test runner executed 55 test cases across tests/remediation.test.js, tests/security.test.js, tests/camera.test.js, and tests/sensor.test.js. Result: 100% pass rate in 11.4s.", bullet_style))
    story.append(Paragraph("• <b>Vite Production Build:</b> Vite 5.4.21 transformed 2,447 modules into dist/ in 32.69s. Warning: chunk sizes exceed 500 kB.", bullet_style))
    story.append(Paragraph("• <b>Dependency Vulnerability Audit:</b> npm audit revealed 6 vulnerabilities in frontend (critical CVE in node-tar, moderate in qs/esbuild) and 3 moderate vulnerabilities in backend express/body-parser.", bullet_style))
    story.append(Paragraph("• <b>Database Schema Migration Test:</b> SQL migration files 001 through 008 verified against PostgreSQL DDL syntax.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # 4. CRITICAL FINDINGS DEEP DIVE (P0 & P1)
    # =========================================================================
    story.append(Paragraph("4. Critical Security & Integrity Blockers (P0 & P1)", h1_style))
    story.append(Paragraph("The following issues represent severe blockers that completely disqualify the application from safe production operation and create extreme vulnerability during hackathon jury evaluation.", body_style))

    crit_issues = [
        ("HC-001 [P0 - BLOCKER] Unauthenticated Public Database Truncation Endpoint",
         "server/index.js:66-90",
         "The endpoint POST /api/v1/health/clean issues TRUNCATE TABLE ... CASCADE across all eleven production PostgreSQL tables. It requires zero authentication, headers, or API tokens. Any HTTP request from a web crawler, automated scanner, or adversary will instantly and irrevocably delete all honey batches, inspections, certificates, and provenance events.",
         "Fix: Delete this route immediately from server/index.js or wrap it strictly inside if (process.env.NODE_ENV === 'test')."),

        ("HC-002 [P1 - CRITICAL] Live Cloud Database Credentials Committed to Source Control",
         "server/.env:7,20",
         "The active environment configuration server/.env contains plaintext credentials for both Neon Serverless PostgreSQL (neondb_owner) and MongoDB Atlas (esp32_user:honeychain2026). These credentials grant full administrative access to both remote database clusters.",
         "Fix: Immediately rotate credentials in Neon Console and MongoDB Atlas. Remove server/.env from git tracking and scrub commit history with git filter-repo."),

        ("HC-003 [P1 - CRITICAL] Broken Object Level Authorization (IDOR) on Batch Creation",
         "server/routes/batchRoutes.js:90-94",
         "POST /api/v1/batches allows any authenticated user to create a batch attributed to another producer by supplying 'producerId' in the JSON body. The backend blindly accepts req.body.producerId without verifying if the caller is an administrator.",
         "Fix: Strictly bind effectiveProducerId to req.user.actorId for all non-admin users."),

        ("HC-004 [P1 - CRITICAL] Broken Object Level Authorization (IDOR) on Hive Registration",
         "server/routes/hiveRoutes.js:81-87",
         "POST /api/v1/hives permits any logged-in beekeeper to register hives under any arbitrary producer ID, allowing unauthorized apiary asset creation and tenant boundary crossing.",
         "Fix: Restrict producerId override strictly to users with role 'kvic' or 'admin'."),

        ("HC-005 [P1 - CRITICAL] Lack of State Machine Order Enforcement in Batch PATCH API",
         "server/routes/batchRoutes.js:126-188",
         "PATCH /api/v1/batches/:batchId allows arbitrary updates to stage, processingStatus, and quantity. A user can regress a Certified batch (Stage 6) back to Stage 1 or arbitrarily change quantity from 10 kg to 10,000 kg.",
         "Fix: Implement server-side state machine transition guards that enforce monotonic stage progression and lock quantity once processing begins."),

        ("HC-006 [P1 - CRITICAL] Missing Role Authorization on Official Certificate Issuance",
         "server/routes/labRoutes.js:218-277",
         "POST /api/v1/lab/certificates only requires authentication but lacks requireRole check. Any authenticated user (including beekeepers and retailers) can issue official AGMARK certificates.",
         "Fix: Apply requireRole('laboratory', 'verifier', 'kvic', 'admin') to the certificate generation endpoint."),

        ("HC-007 [P1 - CRITICAL] Unauthenticated Real-Time IoT Telemetry Stream & Query Endpoints",
         "server/routes/sensorRoutes.js:214,274,309",
         "GET /api/v1/sensors/stream (SSE), GET /latest, and GET /history have no authentication and permit wildcard CORS (*). Anyone on the internet can monitor live apiary conditions and theft vibration alerts.",
         "Fix: Require valid JWT authentication and filter SSE events to only stream hives owned by the authenticated caller.")
    ]

    for title, loc, desc, fix in crit_issues:
        story.append(Paragraph(f"<b>{title}</b>", ParagraphStyle('IssueHead', fontName='Helvetica-Bold', fontSize=10, textColor=danger_red, spaceBefore=8, spaceAfter=2, keepWithNext=True)))
        story.append(Paragraph(f"<b>Location:</b> <font name='Courier'>{loc}</font>", ParagraphStyle('IssueLoc', fontName='Helvetica', fontSize=8, textColor=colors.HexColor("#475569"), spaceAfter=3)))
        story.append(Paragraph(f"<b>Root Cause & Impact:</b> {desc}", body_style))
        story.append(Paragraph(f"<b>Recommended Action:</b> <font color='#15803D'>{fix}</font>", body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # =========================================================================
    # 5. UI TRUTHFULNESS MATRIX & PRODUCT CLAIMS AUDIT
    # =========================================================================
    story.append(Paragraph("5. UI Truthfulness Audit & Customer Trust Matrix", h1_style))
    story.append(Paragraph("The UI Truthfulness Audit evaluated every claim, status badge, and proof surface presented to end users and consumers against actual backend and cryptographic evidence.", body_style))

    truth_data = [
        [Paragraph("UI Claim / Text", table_header_style), Paragraph("Display Surface", table_header_style), Paragraph("Backend Evidence", table_header_style), Paragraph("Trust Classification", table_header_style)],
        [Paragraph("<b>Consumer Authenticity Seal</b>", table_cell_bold), Paragraph("Verify.jsx:75", table_cell_style), Paragraph("Checks local certStatus === 'CERTIFIED' in memory", table_cell_style), Paragraph("<font color='#D97706'>LOCAL ONLY (NO CRYPTO)</font>", table_cell_bold)],
        [Paragraph("<b>Provenance Status Recorded</b>", table_cell_bold), Paragraph("BlockchainProofCard.jsx:42", table_cell_style), Paragraph("Stored in PostgreSQL provenance_events table", table_cell_style), Paragraph("<font color='#15803D'>VERIFIED OFF-CHAIN</font>", table_cell_bold)],
        [Paragraph("<b>Cryptographic Ledger Trail</b>", table_cell_bold), Paragraph("Traceability.jsx:210", table_cell_style), Paragraph("SHA-256 hash chaining stored in PostgreSQL", table_cell_style), Paragraph("<font color='#D97706'>RELATIONAL HASH ONLY</font>", table_cell_bold)],
        [Paragraph("<b>Verification Reference</b>", table_cell_bold), Paragraph("BlockchainProofCard.jsx:76", table_cell_style), Paragraph("Field blockchainTx is explicitly null", table_cell_style), Paragraph("<font color='#DC2626'>NOT AVAILABLE</font>", table_cell_bold)],
        [Paragraph("<b>Blockchain Readiness Score</b>", table_cell_bold), Paragraph("BlockchainReadiness.jsx:21", table_cell_style), Paragraph("Formula: (batches + events + certs) / total * 3", table_cell_style), Paragraph("<font color='#DC2626'>SYNTHETIC MOCK FORMULA</font>", table_cell_bold)],
        [Paragraph("<b>AI Varroa Mite Diagnosis</b>", table_cell_bold), Paragraph("AIHiveHealth.jsx:229", table_cell_style), Paragraph("String hash modulo of filename & hiveId", table_cell_style), Paragraph("<font color='#DC2626'>PSEUDO-RANDOM MOCK</font>", table_cell_bold)],
        [Paragraph("<b>Live Telemetry 'Online'</b>", table_cell_bold), Paragraph("SensorCard.jsx / MyHives.jsx", table_cell_style), Paragraph("MongoDB latest reading or static fallback", table_cell_style), Paragraph("<font color='#15803D'>VERIFIED SENSOR DATA</font>", table_cell_bold)],
        [Paragraph("<b>AGMARK Certified</b>", table_cell_bold), Paragraph("Retailer Inventory.jsx:69", table_cell_style), Paragraph("Postgres certificates row; no PDF file exists", table_cell_style), Paragraph("<font color='#D97706'>METADATA ONLY (NO PDF)</font>", table_cell_bold)],
        [Paragraph("<b>QR Verification Link</b>", table_cell_bold), Paragraph("QRCodeCard.jsx:10", table_cell_style), Paragraph("Encodes https://beecrypt.demo/verify/:batchId", table_cell_style), Paragraph("<font color='#DC2626'>BROKEN DOMAIN (NXDOMAIN)</font>", table_cell_bold)],
    ]
    truth_table = Table(truth_data, colWidths=[120, 104, 150, 130])
    truth_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(truth_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Evaluation of Provenance Chaining:</b>", h2_style))
    story.append(Paragraph("• <b>What is Actually Implemented:</b> When an event is recorded via POST /api/v1/events, the backend queries the most recent event for that batchId, retrieves its payload_hash, and calculates: sha256(JSON.stringify({ batchId, eventType, actorId, occurredAt, payload, previousEventHash })). This creates a valid cryptographic hash chain inside PostgreSQL.", bullet_style))
    story.append(Paragraph("• <b>What is Missing:</b> There is no digital signature using an asymmetric private key (e.g. Ed25519 or ECDSA). The signature column remains null. The event is never broadcast to an Ethereum, Polygon, or Hyperledger node, so it lacks Byzantine fault tolerance and external tamper-proofing.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # 6. HONEY LIFECYCLE & ROLE CAPABILITY AUDIT
    # =========================================================================
    story.append(Paragraph("6. Honey Lifecycle & Role Capability Matrix", h1_style))
    story.append(Paragraph("The honey traceability lifecycle was audited as a finite state machine (FSM) across the six implemented stages:", body_style))

    fsm_data = [
        [Paragraph("Stage", table_header_style), Paragraph("Lifecycle Phase", table_header_style), Paragraph("Authorized Actor", table_header_style), Paragraph("Prerequisites", table_header_style), Paragraph("Vulnerability", table_header_style)],
        [Paragraph("1", table_cell_bold), Paragraph("Harvested", table_cell_style), Paragraph("Beekeeper", table_cell_style), Paragraph("Registered Hive, positive quantity", table_cell_style), Paragraph("IDOR allows harvesting under foreign producerId", table_cell_style)],
        [Paragraph("2", table_cell_bold), Paragraph("Processing Started", table_cell_style), Paragraph("Processor", table_cell_style), Paragraph("Batch in Stage 1, assigned processor", table_cell_style), Paragraph("PATCH API accepts stage=2 without processor check", table_cell_style)],
        [Paragraph("3", table_cell_bold), Paragraph("Processing Done", table_cell_style), Paragraph("Processor", table_cell_style), Paragraph("Batch in Stage 2, processing method specified", table_cell_style), Paragraph("Can skip stage 2 directly from stage 1", table_cell_style)],
        [Paragraph("4", table_cell_bold), Paragraph("Lab Requested", table_cell_style), Paragraph("Processor / Lab", table_cell_style), Paragraph("Batch in Stage 3, accredited Lab selected", table_cell_style), Paragraph("Can request testing on unprocessed batches", table_cell_style)],
        [Paragraph("5", table_cell_bold), Paragraph("Quality Verified", table_cell_style), Paragraph("Laboratory", table_cell_style), Paragraph("Batch in Stage 4, chemical metrics saved", table_cell_style), Paragraph("No moisture/sugar range enforcement in DB", table_cell_style)],
        [Paragraph("6", table_cell_bold), Paragraph("Certified", table_cell_style), Paragraph("Laboratory / KVIC", table_cell_style), Paragraph("Batch in Stage 5, testStatus === PASS", table_cell_style), Paragraph("Any user can call POST /certificates", table_cell_style)],
    ]
    fsm_table = Table(fsm_data, colWidths=[30, 110, 94, 130, 140])
    fsm_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(fsm_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Role Permission & Capability Matrix:</b>", h2_style))
    story.append(Paragraph("The system implements five user roles. While frontend routing in src/auth/permissions.js blocks unauthorized UI navigation, backend API route enforcement is inconsistent:", body_style))

    role_data = [
        [Paragraph("User Role", table_header_style), Paragraph("Designated Responsibilities", table_header_style), Paragraph("Frontend Route Protection", table_header_style), Paragraph("Backend API Enforcement Status", table_header_style)],
        [Paragraph("<b>Beekeeper</b>", table_cell_bold), Paragraph("Manage hives, sensor monitoring, harvest batches", table_cell_style), Paragraph("Enforced via canEnterWorkspace", table_cell_style), Paragraph("Enforced on hive details; IDOR on batch creation", table_cell_style)],
        [Paragraph("<b>Processor</b>", table_cell_bold), Paragraph("Accept batches, process honey, split batches, request testing", table_cell_style), Paragraph("Enforced via canEnterWorkspace", table_cell_style), Paragraph("Ownership checked on patch; no role check on split", table_cell_style)],
        [Paragraph("<b>Laboratory</b>", table_cell_bold), Paragraph("Accept samples, record chemical tests, issue certificates", table_cell_style), Paragraph("Enforced via canEnterWorkspace", table_cell_style), Paragraph("<font color='#DC2626'>BROKEN: POST /certificates has no role check</font>", table_cell_style)],
        [Paragraph("<b>Retailer</b>", table_cell_bold), Paragraph("Inventory management, batch intake verification, QR display", table_cell_style), Paragraph("Enforced via canEnterWorkspace", table_cell_style), Paragraph("ReadOnly view; unassigned intake mutations allowed", table_cell_style)],
        [Paragraph("<b>KVIC Admin</b>", table_cell_bold), Paragraph("User verification, setup token approval, regulatory oversight", table_cell_style), Paragraph("Enforced via canEnterWorkspace", table_cell_style), Paragraph("Strictly protected with requireRole('kvic','admin')", table_cell_style)],
        [Paragraph("<b>Consumer</b>", table_cell_bold), Paragraph("Public QR verification of honey origin and quality seal", table_cell_style), Paragraph("Public route /verify/:batchId", table_cell_style), Paragraph("<font color='#DC2626'>BLOCKED: /events requires authentication</font>", table_cell_style)],
    ]
    role_table = Table(role_data, colWidths=[80, 150, 120, 154])
    role_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(role_table)
    story.append(PageBreak())

    # =========================================================================
    # 7. IoT, FIRMWARE & CAMERA SUBSYSTEM AUDIT
    # =========================================================================
    story.append(Paragraph("7. IoT Sensor & Camera Hardware Pipeline Audit", h1_style))
    story.append(Paragraph("HoneyChain's cyber-physical telemetry architecture connects physical ESP32 microcontrollers with backend cloud services.", body_style))

    story.append(Paragraph("<b>ESP32 DevKit Telemetry Firmware (ESP32_Telemetry.ino):</b>", h2_style))
    story.append(Paragraph("• <b>Hardware Interface:</b> DHT11 on GPIO 4 for ambient temperature/humidity; SW-420 on GPIO 5 for hive vibration alerts; status LED on GPIO 2.", bullet_style))
    story.append(Paragraph("• <b>Transmission Flaw:</b> Loops every 3,000 ms using HTTPClient without deep sleep mode. Consumes ~160 mA continuously, rapidly depleting field batteries.", bullet_style))
    story.append(Paragraph("• <b>Network Flaw:</b> Hardcodes BACKEND_URL to http://10.131.229.86:3001/api/v1/sensors/telemetry. Fails when moving to any other Wi-Fi network.", bullet_style))
    story.append(Paragraph("• <b>Security Flaw:</b> Transmits sensor device key in plaintext HTTP header x-sensor-device-key across local Wi-Fi without TLS encryption.", bullet_style))

    story.append(Paragraph("<b>ESP32-CAM Vision Bridge (cameraRoutes.js):</b>", h2_style))
    story.append(Paragraph("• <b>Direct Streaming Architecture:</b> Backend acts as an authenticated proxy. When /capture is triggered, the server calls http://<ESP32_IP>/capture?hiveId=..., validates JPEG SOI magic bytes (0xFF 0xD8 0xFF), streams binary into MongoDB GridFS bucket 'images', and records structured metadata in 'captures' collection.", bullet_style))
    story.append(Paragraph("• <b>Concurrency Lock:</b> Successfully implements boolean lock isCaptureInProgress to prevent concurrent frame collisions on the single-threaded ESP32 camera sensor.", bullet_style))
    story.append(Paragraph("• <b>Authorization Gaps:</b> GET /captures/:captureId/image accepts ?token= parameter for img tag rendering, but fails to check if the caller owns the hive corresponding to that photo.", bullet_style))
    story.append(Paragraph("• <b>SSRF Risk:</b> fetchFromEsp32 dispatches HTTP calls to getEsp32Ip() without restricting target addresses to private RFC1918 subnets.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # 8. MASTER ISSUE REGISTER (HC-001 TO HC-030)
    # =========================================================================
    story.append(Paragraph("8. Master Issue Register (30 Forensic Findings)", h1_style))
    story.append(Paragraph("Every finding discovered during the audit is cataloged below with severity, location, root cause, and remediation status.", body_style))

    import json
    with open("HoneyChain_SIH26_Audit_Findings.json", "r", encoding="utf-8") as f:
        findings_json = json.load(f)["findings"]

    reg_data = [
        [Paragraph("ID", table_header_style), Paragraph("Sev", table_header_style), Paragraph("Category", table_header_style), Paragraph("Component", table_header_style), Paragraph("Issue Summary", table_header_style), Paragraph("Status", table_header_style)]
    ]

    for f in findings_json:
        sev_code = f["severity"].split(" - ")[0]
        sev_color = danger_red if sev_code in ["P0", "P1"] else accent_gold if sev_code == "P2" else primary_color
        reg_data.append([
            Paragraph(f["issue_id"], table_cell_bold),
            Paragraph(f"<font color='{sev_color.hexval()}'><b>{sev_code}</b></font>", table_cell_bold),
            Paragraph(f["category"], table_cell_style),
            Paragraph(f["component"], table_cell_style),
            Paragraph(f["description"][:110] + "...", table_cell_style),
            Paragraph(f["verification_status"], table_cell_style),
        ])

    reg_table = Table(reg_data, colWidths=[40, 26, 88, 100, 190, 60])
    reg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('PADDING', (0,0), (-1,-1), 3),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(reg_table)
    story.append(PageBreak())

    # =========================================================================
    # 9. PRIORITY FIX ROADMAP & DEMO READINESS
    # =========================================================================
    story.append(Paragraph("9. Priority Fix Roadmap & SIH Demo Readiness", h1_style))
    story.append(Paragraph("To ensure the system can be demonstrated safely and honestly before the Smart India Hackathon jury, fixes are ordered across three strict phases:", body_style))

    story.append(Paragraph("<b>Phase 1: Immediate Blockers (Must Fix Before Live Demo)</b>", h2_style))
    story.append(Paragraph("1. <b>Remove /api/v1/health/clean:</b> Delete or guard the unauthenticated database truncate endpoint.", bullet_style))
    story.append(Paragraph("2. <b>Rotate Credentials:</b> Invalidate exposed Neon and MongoDB passwords; add server/.env to .gitignore.", bullet_style))
    story.append(Paragraph("3. <b>Fix Android Cleartext Policy:</b> Enable android:usesCleartextTraffic='true' in AndroidManifest.xml and cleartext: true in capacitor.config.json.", bullet_style))
    story.append(Paragraph("4. <b>Fix QR Code URL Generator:</b> Replace https://beecrypt.demo with window.location.origin in QRCodeCard.jsx.", bullet_style))
    story.append(Paragraph("5. <b>Fix Public Consumer Access:</b> Make GET /api/v1/events?batchId=... public so QR scanning displays genuine history.", bullet_style))
    story.append(Paragraph("6. <b>Standardize Physical Units:</b> Align kg and Liters across HoneyExtraction, Processing, and Inventory.", bullet_style))
    story.append(Paragraph("7. <b>Honest Truthfulness Labels:</b> Label AI health analysis as 'Prototype Simulation' and blockchain as 'Local Relational Chaining (Chain Gateway Seam)'.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Phase 2: Short-Term Operational Hardening (Post-Demo)</b>", h2_style))
    story.append(Paragraph("1. <b>Enforce Backend State Machine:</b> Add strict validation to PATCH /api/v1/batches/:batchId rejecting stage regression.", bullet_style))
    story.append(Paragraph("2. <b>Role Authorization on Certificates:</b> Add requireRole('laboratory', 'verifier', 'admin') to certificate issuance.", bullet_style))
    story.append(Paragraph("3. <b>Authenticate IoT Telemetry Endpoints:</b> Require JWT auth on GET /stream, GET /latest, and GET /history.", bullet_style))
    story.append(Paragraph("4. <b>Tenant Isolation on Camera:</b> Ensure camera capture images can only be retrieved by the hive owner.", bullet_style))
    story.append(Paragraph("5. <b>Remove Silent Mock Auth Fallback:</b> Display genuine error dialogs on authentication failures.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Phase 3: Production & Long-Term Evolution</b>", h2_style))
    story.append(Paragraph("1. <b>Real Blockchain Integration:</b> Deploy smart contracts on Polygon/Avalanche; implement Web3 wallet signing.", bullet_style))
    story.append(Paragraph("2. <b>Genuine Computer Vision Model:</b> Train a lightweight YOLOv8 / MobileNet model on real honeycomb brood comb datasets.", bullet_style))
    story.append(Paragraph("3. <b>Firmware Deep Sleep & Flash Buffering:</b> Implement 10-minute ESP32 deep sleep cycles with LittleFS buffering.", bullet_style))
    story.append(Paragraph("4. <b>Containerization:</b> Provide multi-stage Dockerfile and docker-compose.yml for local and cloud orchestration.", bullet_style))
    story.append(Spacer(1, 14))

    final_box = [
        [Paragraph("<b>AUDITOR'S FINAL VERDICT FOR SIH 2026 EVALUATION</b>", ParagraphStyle('FinalHead', fontName='Helvetica-Bold', fontSize=10, textColor=primary_color))],
        [Paragraph("BeeCrypt exhibits outstanding visual craftsmanship, sophisticated frontend architecture, and genuine IoT-to-cloud integration. However, it cannot be certified as a secure or blockchain-backed production system in its current state. By completing the Phase 1 immediate fixes outlined above, the team will eliminate critical security exposures, ensure flawless live demo execution, and present a truthful, defensible architecture that will impress the evaluation jury.", body_style)]
    ]
    final_table = Table(final_box, colWidths=[504])
    final_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1.5, accent_gold),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(final_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Master PDF Audit Report: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "HoneyChain_SIH26_Master_System_Audit_Report.pdf"
    generate_pdf(out_file)
