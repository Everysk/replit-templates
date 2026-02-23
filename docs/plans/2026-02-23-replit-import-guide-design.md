# Design: Replit Import Guide + Agent Skills .docx

**Date:** 2026-02-23
**Author:** Claude Sonnet 4.6
**Status:** Approved

---

## Goal

Create a new `.docx` file in `docs/` that serves as a complete onboarding guide for users who are importing the `https://github.com/Everysk/replit-templates` GitHub template into Replit for the first time. The guide includes:

1. Live screenshots captured via Playwright at each step of the Replit import flow
2. A section explaining the bundled Agent Skills and how to invoke them

---

## Document Structure

**File:** `docs/Getting Started - Everysk App Template on Replit.docx`

### Sections

1. **Title Page / Header**
   - Title: "Getting Started: Everysk App Template on Replit"
   - Subtitle: Step-by-step guide to importing, configuring, and using agent skills

2. **Prerequisites**
   - Everysk account with API credentials
   - Where to get them: `https://everysk.com/account`
   - Required secrets: `EVERYSK_API_SID`, `EVERYSK_API_TOKEN`, `EVERYSK_APP_NAME`

3. **Step-by-Step: Import the Template into Replit**
   - Step 1: Navigate to the GitHub template (screenshot: github.com/Everysk/replit-templates)
   - Step 2: Open the Replit import URL (screenshot: replit.com/github/Everysk/replit-templates)
   - Step 3: Configure the Replit project (screenshot: Replit workspace after fork)
   - Step 4: Open the Secrets tab (lock icon) (screenshot: Secrets tab open)
   - Step 5: Add each required secret (screenshot: adding EVERYSK_API_SID)
   - Step 6: Click Run (screenshot: app running in Replit webview)

4. **Understanding Agent Skills**
   - What agent skills are and why they exist
   - Table of all skills (name, path, when to use)
   - How to invoke them:
     - In Claude Code: `Skill(skill="brainstorming")`
     - In Replit AI agent: automatic via `replit.md` manifest
   - Per-skill descriptions:
     - brainstorming: design-before-code workflow
     - everysk-lib-sdk: portfolio/datastore/workflow API patterns
     - everysk-mcp: MCP server integration
     - frontend-design: production-grade MUI + Tailwind UI
     - pdf: all PDF operations
     - find-skills: discover new capabilities

5. **Troubleshooting**
   - Missing secrets error
   - App not starting
   - Agent not loading skills

---

## Technical Approach

**Method:** Option B — Parallel subagents

### Execution Plan

**Phase 1 (Parallel):**
- **Main thread (Playwright MCP):** Navigate each step of the Replit import flow, capture 6–8 screenshots, save to `docs/screenshots/`
- **Background subagent:** Build docx-js skeleton with all headings, text content, numbered steps, and image placeholders

**Phase 2 (Sequential):**
- Embed screenshots into the docx using XML relationship injection (docx skill patterns)
- Validate with `python scripts/office/validate.py`

### Screenshot Targets (Playwright)
1. `github.com/Everysk/replit-templates` — template page
2. `replit.com/github/Everysk/replit-templates` — import/fork page
3. Replit workspace post-import — file tree visible
4. Secrets tab open (lock icon clicked)
5. Adding `EVERYSK_API_SID` secret
6. App running in Replit (green Run button, webview)

### Tools
- **Playwright MCP:** Live browser screenshots
- **docx-js (npm):** New document generation
- **docx skill:** XML editing for image embedding
- **Subagent (background):** Parallel doc skeleton generation

---

## Success Criteria

- New `.docx` exists at `docs/Getting Started - Everysk App Template on Replit.docx`
- Document passes `python scripts/office/validate.py`
- All 6+ screenshots embedded with captions
- Agent Skills table matches `replit.md` manifest exactly
- Numbered steps match README.md Replit Setup section
