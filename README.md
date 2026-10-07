# 🚢 EXPORTAI 
### Autonomous Pre-Shipment Export Document Verification & Anti-Demurrage Gateway
**KeralAI Grand Challenge 2026** — *Track: Challenge 3 (Export Document Verification System)*[cite: 6]  
**Team ColdSync** | Mar Baselios Institute of Technology and Science (MBITS)[cite: 6]  
**Lead Verification Officer:** Alby Mathew Joshy  
**Target Corridors:** Cochin Port ICTT Vallarpadam (`INCOK1`) & Vizhinjam International Seaport  

---

## 📌 Executive Overview
Kerala's high-value agro-marine and spice exporters face severe port detention fees, customs queries, and container holds caused by clerical mismatches across the export documentation trilogy:
1. **Commercial Invoice (CI)**[cite: 6]
2. **Packing List (PL)**[cite: 6]
3. **Customs Shipping Bill (SB)**[cite: 6]

A discrepancy as small as a 20-carton shortfall or a minor weight variance between documents triggers manual inspection holds, incurring **₹40,000 to ₹2,00,000 per day** in demurrage and refrigerated plug-in fees.

**EXPORTAI** provides a **hybrid reliability architecture**:
- Multimodal AI for structured data extraction and evidence localization.
- Deterministic finite-state validation for statutory field integrity, 8-digit HS Code matching, and $\pm 1.0\%$ SOLAS tare weight buffers.
- Customs House Agent (CHA) Human-in-the-Loop (HITL) sign-off workflows with SHA-256 tamper-evident verification audit logs.

---

## 🛡️ Enterprise Differentiators

| Feature | Generic Submissions | EXPORTAI (Team ColdSync) |
| :--- | :--- | :--- |
| **Validation Method** | LLM Prompting ("Check if these match") | Deterministic Rule & Arithmetic Engine |
| **Hallucination Risk** | High (numeric fabrication) | **0.0%** (Strict boundary check against source text) |
| **Tolerance Rules** | Binary match (rejects legal variance) | Parametric $\pm 1.0\%$ SOLAS tare weight buffer |
| **Regional Context** | Generic logistics demo | Cochin Port (`INCOK1`) & Vizhinjam Seaport specific |
| **Financial Metric** | Plain error string | Real-time Projected Demurrage Exposure (₹ INR) |
| **Audit Compliance** | None | Cryptographic SHA-256 Audit Dossier & Certification |
| **Responsible AI** | Raw data processed directly | Automated Indian PAN, Phone, and Account PII Masking |

---

## 🛠️ Tech Stack

- **Web Platform:** Next.js 15, React 19, TypeScript, Tailwind CSS, Motion
- **AI Extraction & Reasoning:** Google Gemini API (`@google/genai`) multimodal document parser
- **Verification Engine:** Deterministic TypeScript validation core + Python test microservices
- **Security & Storage:** Isolated local sandboxed `.storage` layer with path traversal guardrails
- **Lifecycle Alignment:** IBM BoB (Build on Box) SDLC framework

---

## 🚀 Live Verification Scenarios

1. **Scenario 1 — Carton Tally Mismatch:** Commercial Invoice states 1,200 cartons ($144,000 CIF) while Packing List states 1,180 cartons (20-carton variance)[cite: 6]. The engine flags container detention risk, calculates demurrage, and generates an automated supplier rectification email.
2. **Scenario 2 — Clean Export Trilogy (100% Pass):** Tellicherry Extra Bold Black Pepper (`HS: 09041110`, 500 cartons, 10,000 kg). Perfect consistency across CI, PL, and SB; generates an approved Pre-Clearance Dossier.
3. **Scenario 3 — HS Code Tariff & Tare Weight Variance:** Flags tariff classification mismatches and gross weight discrepancies exceeding the 1.0% tolerance window.

---

## 💻 Local Setup & Execution

### Running the Next.js Platform
```bash
# Install dependencies
npm install

# Start development server
npm run dev
