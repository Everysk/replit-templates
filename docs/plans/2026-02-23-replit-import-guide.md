# Replit Import Guide .docx Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create `docs/Getting Started - Everysk App Template on Replit.docx` — a complete onboarding guide with live Playwright screenshots and an Agent Skills reference section.

**Architecture:** Parallel Phase 1 (Playwright captures screenshots while background subagent writes the docx-js generation script), then sequential Phase 2 (run docx-js with embedded screenshots, validate, commit).

**Tech Stack:** Playwright MCP (screenshots), docx-js npm (document generation), Node.js, docx skill (XML validation), Python scripts/office/validate.py

---

## Phase 1 (Parallel)

### Task 1: Setup

**Files:**
- Create: `docs/screenshots/` (directory)
- Create: `docs/generate-guide.js` (docx-js script)

**Step 1: Create screenshots directory**

```bash
mkdir -p /home/chicagojoe/PyCharmProjects/everysk/apps/everysk-replit-templates/docs/screenshots
```

**Step 2: Check docx npm package is available**

```bash
node -e "require('docx'); console.log('docx OK')" 2>/dev/null || npm install -g docx
```

Expected: `docx OK` or successful install.

**Step 3: Commit directory**

```bash
cd /home/chicagojoe/PyCharmProjects/everysk/apps/everysk-replit-templates
git add docs/screenshots/.gitkeep docs/plans/
git commit -m "docs: add plan and screenshots directory for Replit import guide"
```

---

### Task 2: Capture Screenshots via Playwright MCP

**Files:**
- Create: `docs/screenshots/01-github-template.png`
- Create: `docs/screenshots/02-replit-import.png`
- Create: `docs/screenshots/03-replit-workspace.png`
- Create: `docs/screenshots/04-secrets-tab.png`
- Create: `docs/screenshots/05-add-secret.png`
- Create: `docs/screenshots/06-app-running.png`

**Step 1: Navigate to GitHub template page**

Use Playwright MCP:
```
browser_navigate(url="https://github.com/Everysk/replit-templates")
browser_take_screenshot(filename="docs/screenshots/01-github-template.png", type="png")
```

**Step 2: Navigate to Replit import URL**

```
browser_navigate(url="https://replit.com/github/Everysk/replit-templates")
browser_wait_for(time=3)
browser_take_screenshot(filename="docs/screenshots/02-replit-import.png", type="png")
```

**Step 3: Capture Replit workspace (if logged in)**

After import lands on workspace:
```
browser_wait_for(time=3)
browser_take_screenshot(filename="docs/screenshots/03-replit-workspace.png", type="png")
```

**Step 4: Capture Secrets tab**

Click the lock icon / Secrets tab in Replit sidebar:
```
browser_snapshot()  # find the lock icon ref
browser_click(ref="<lock-icon-ref>")
browser_take_screenshot(filename="docs/screenshots/04-secrets-tab.png", type="png")
```

**Step 5: Capture adding a secret**

Click "New Secret" or equivalent:
```
browser_snapshot()  # find new secret button
browser_click(ref="<new-secret-ref>")
browser_take_screenshot(filename="docs/screenshots/05-add-secret.png", type="png")
```

**Step 6: Capture app running**

Click Run button:
```
browser_snapshot()  # find Run button
browser_click(ref="<run-button-ref>")
browser_wait_for(time=5)
browser_take_screenshot(filename="docs/screenshots/06-app-running.png", type="png")
```

> **Note:** If Replit requires login, capture the login redirect instead and note it as "Step 0: Log into Replit". If pages show error states, screenshot those as-is — they still document the flow.

---

### Task 3: Write docx-js Generation Script (Background Subagent)

**Files:**
- Create: `docs/generate-guide.js`

**Step 1: Create the script**

```javascript
// docs/generate-guide.js
// Run: node docs/generate-guide.js
// Requires: npm install -g docx (or local install)

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, HeadingLevel, AlignmentType, LevelFormat,
  BorderStyle, WidthType, ShadingType, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const OUTPUT_FILE = path.join(__dirname, 'Getting Started - Everysk App Template on Replit.docx');

// Helper: load image or return null if not found
function loadImage(filename) {
  const p = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(p)) {
    console.warn(`  [WARN] Screenshot not found: ${p}`);
    return null;
  }
  return fs.readFileSync(p);
}

// Helper: image paragraph (full width ~6.5 inches = 5940 EMUs * 914400/1440)
// US Letter content width 9360 DXA = 6.5 inches. At 96dpi, 6.5in = 624px.
// EMU = DXA * 914400 / 1440
function imageParagraph(filename, caption) {
  const data = loadImage(filename);
  const children = [];

  if (data) {
    children.push(new ImageRun({
      type: 'png',
      data,
      transformation: { width: 624, height: 390 }, // 16:10 ratio, full width
      altText: { title: caption, description: caption, name: caption }
    }));
  } else {
    children.push(new TextRun({
      text: `[Screenshot: ${filename} — not yet captured]`,
      italics: true,
      color: 'FF0000'
    }));
  }

  const paragraphs = [
    new Paragraph({ alignment: AlignmentType.CENTER, children }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: caption, italics: true, size: 18, color: '666666' })]
    }),
    new Paragraph({ children: [] }) // spacer
  ];
  return paragraphs;
}

// Helper: step paragraph
function step(num, text) {
  return new Paragraph({
    numbering: { reference: 'steps', level: 0 },
    children: [new TextRun({ text, size: 24 })]
  });
}

// Helper: bullet
function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text, size: 24 })]
  });
}

// Helper: code run
function code(text) {
  return new TextRun({ text, font: 'Courier New', size: 20, bold: true });
}

// Table border
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

// Skills table rows
const skills = [
  ['brainstorming', '.agents/skills/brainstorming', 'Before any creative/feature work — design first, code second'],
  ['everysk-lib-sdk', '.agents/skills/everysk/everysk-lib-sdk', 'Everysk Python SDK: portfolios, datastores, workflows'],
  ['everysk-mcp', '.agents/skills/everysk/everysk-mcp', 'Everysk MCP server integration patterns'],
  ['frontend-design', '.agents/skills/frontend-design', 'Building or styling any UI — MUI + Tailwind best practices'],
  ['pdf', '.agents/skills/pdf', 'All PDF operations: read, write, merge, OCR, forms'],
  ['find-skills', '.agents/skills/find-skills', 'Discover installable skills for new capabilities'],
];

function skillsTable() {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        borders, width: { size: 2200, type: WidthType.DXA },
        shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: 'Skill', bold: true, color: 'FFFFFF', size: 22 })] })]
      }),
      new TableCell({
        borders, width: { size: 2800, type: WidthType.DXA },
        shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: 'Path', bold: true, color: 'FFFFFF', size: 22 })] })]
      }),
      new TableCell({
        borders, width: { size: 4360, type: WidthType.DXA },
        shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: 'When to Use', bold: true, color: 'FFFFFF', size: 22 })] })]
      }),
    ]
  });

  const dataRows = skills.map(([name, skillPath, when], i) =>
    new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 2200, type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [code(name)] })]
        }),
        new TableCell({
          borders, width: { size: 2800, type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [code(skillPath)] })]
        }),
        new TableCell({
          borders, width: { size: 4360, type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: when, size: 22 })] })]
        }),
      ]
    })
  );

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 2800, 4360],
    rows: [headerRow, ...dataRows]
  });
}

async function main() {
  console.log('Generating: Getting Started - Everysk App Template on Replit.docx');

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'steps',
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        },
        {
          reference: 'bullets',
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }
      ]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 24 } } },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, font: 'Arial', color: '1A1A2E' },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: 'Arial', color: '16213E' },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: 'Arial', color: '0F3460' },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Everysk App Template \u2014 Getting Started Guide', size: 18, color: '999999' })
            ]
          })]
        })
      },
      children: [
        // ── TITLE ──────────────────────────────────────────────────────────────
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Getting Started', bold: true, size: 52 })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Everysk App Template on Replit', size: 36, color: '0F3460' })]
        }),
        new Paragraph({ children: [] }),

        // ── PREREQUISITES ───────────────────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Prerequisites')] }),
        new Paragraph({
          children: [new TextRun({ text: 'Before importing the template, gather the following credentials from your Everysk account at ', size: 24 }),
          new TextRun({ text: 'https://everysk.com/account', size: 24, bold: true })]
        }),
        new Paragraph({ children: [] }),
        bullet('EVERYSK_API_SID — Your Everysk API account SID'),
        bullet('EVERYSK_API_TOKEN — Your Everysk API authentication token'),
        bullet('EVERYSK_APP_NAME — The name for your Everysk application'),
        new Paragraph({ children: [] }),

        // ── STEP-BY-STEP IMPORT ─────────────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Importing the Template into Replit')] }),

        // Step 1: GitHub
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 1 \u2014 Open the GitHub Template')] }),
        new Paragraph({ children: [new TextRun({ text: 'Navigate to the template repository on GitHub:', size: 24 })] }),
        new Paragraph({ children: [code('https://github.com/Everysk/replit-templates')] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('01-github-template.png', 'Figure 1: Everysk template repository on GitHub'),

        // Step 2: Replit import
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 2 \u2014 Import into Replit')] }),
        new Paragraph({ children: [new TextRun({ text: 'Open the following URL in your browser to import the template directly into Replit:', size: 24 })] }),
        new Paragraph({ children: [code('https://replit.com/github/Everysk/replit-templates')] }),
        new Paragraph({ children: [new TextRun({ text: 'Sign in to Replit if prompted, then click Fork or Import to create your own copy of the project.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('02-replit-import.png', 'Figure 2: Replit import / fork page'),

        // Step 3: Workspace
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 3 \u2014 Your Replit Workspace')] }),
        new Paragraph({ children: [new TextRun({ text: 'After the import completes, Replit opens your new workspace. You will see the project files in the left panel and the shell/console at the bottom.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('03-replit-workspace.png', 'Figure 3: Replit workspace after import'),

        // Step 4: Secrets
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 4 \u2014 Open the Secrets Tab')] }),
        new Paragraph({ children: [new TextRun({ text: 'Click the lock icon (\uD83D\uDD12) in the left sidebar to open the Secrets tab. This is where you store environment variables securely \u2014 they are never committed to your repository.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('04-secrets-tab.png', 'Figure 4: Secrets tab (lock icon in sidebar)'),

        // Step 5: Add secrets
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 5 \u2014 Add Required Secrets')] }),
        new Paragraph({ children: [new TextRun({ text: 'Add each of the following secrets by clicking New Secret, entering the key name, and pasting the value:', size: 24 })] }),
        new Paragraph({ children: [] }),
        step(1, 'Key: EVERYSK_API_SID  \u2192  Value: your API SID from everysk.com/account'),
        step(2, 'Key: EVERYSK_API_TOKEN  \u2192  Value: your API token'),
        step(3, 'Key: EVERYSK_APP_NAME  \u2192  Value: your application name'),
        new Paragraph({ children: [] }),
        ...imageParagraph('05-add-secret.png', 'Figure 5: Adding the EVERYSK_API_SID secret'),

        // Step 6: Run
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 6 \u2014 Run the App')] }),
        new Paragraph({ children: [new TextRun({ text: 'Click the green Run button at the top of the workspace. The startup script validates all required secrets before starting the Vite dev server on port 5000. If any secrets are missing, you will see a clear error message in the console.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('06-app-running.png', 'Figure 6: App running in Replit'),
        new Paragraph({ children: [new PageBreak()] }),

        // ── AGENT SKILLS ────────────────────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Understanding Agent Skills')] }),
        new Paragraph({ children: [new TextRun({ text: 'This template ships with a set of AI agent skills in the ', size: 24 }),
          code('.agents/skills/'), new TextRun({ text: ' directory. These are instruction files that tell the Replit AI agent (and Claude Code) how to approach specific tasks correctly.', size: 24 })] }),
        new Paragraph({ children: [] }),
        new Paragraph({ children: [new TextRun({ text: 'The skills are automatically discovered by any agent that reads ', size: 24 }),
          code('replit.md'), new TextRun({ text: ', which lists all mandatory skills with their paths and "When to Use" criteria.', size: 24 })] }),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Available Skills')] }),
        new Paragraph({ children: [] }),
        skillsTable(),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('How to Invoke Skills')] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('In Claude Code (terminal):')] }),
        new Paragraph({ children: [code('Skill(skill="brainstorming")')] }),
        new Paragraph({ children: [code('Skill(skill="everysk-lib-sdk")')] }),
        new Paragraph({ children: [code('Skill(skill="frontend-design")')] }),
        new Paragraph({ children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('In Replit AI Agent:')] }),
        new Paragraph({ children: [new TextRun({ text: 'Skills are loaded automatically. The agent reads ', size: 24 }),
          code('replit.md'), new TextRun({ text: ' at the start of every conversation and loads the relevant skill before performing matching work. For example, the brainstorming skill is always loaded before any creative or feature-building task.', size: 24 })] }),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Key Skill: brainstorming')] }),
        new Paragraph({ children: [new TextRun({ text: 'The brainstorming skill enforces design-before-code discipline. Every time you ask the AI agent to build a new feature, it will:', size: 24 })] }),
        bullet('Explore the codebase and understand the current context'),
        bullet('Ask clarifying questions one at a time'),
        bullet('Propose 2\u20133 approaches with trade-offs'),
        bullet('Present a design for your approval before writing any code'),
        new Paragraph({ children: [] }),
        new Paragraph({ children: [new TextRun({ text: 'This prevents wasted work and ensures alignment before implementation begins.', size: 24, bold: true })] }),
        new Paragraph({ children: [] }),

        // ── TROUBLESHOOTING ─────────────────────────────────────────────────────
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Troubleshooting')] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Missing secrets error on startup')] }),
        new Paragraph({ children: [new TextRun({ text: 'If you see a secrets validation error in the console, open the Secrets tab and verify all three secrets are present: ', size: 24 }),
          code('EVERYSK_API_SID'), new TextRun({ text: ', ', size: 24 }),
          code('EVERYSK_API_TOKEN'), new TextRun({ text: ', and ', size: 24 }),
          code('EVERYSK_APP_NAME'), new TextRun({ text: '. Then click Run again.', size: 24 })] }),
        new Paragraph({ children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Agent not loading skills')] }),
        new Paragraph({ children: [new TextRun({ text: 'If the Replit agent skips the brainstorming or everysk skill steps, ask it to re-read ', size: 24 }),
          code('replit.md'), new TextRun({ text: '. The file contains the mandatory skill requirements that must be followed in every conversation.', size: 24 })] }),
        new Paragraph({ children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('App not loading in Replit webview')] }),
        bullet('Verify the dev server started on port 5000 (check console output)'),
        bullet('Check that all three secrets are set correctly'),
        bullet('Try stopping and re-clicking Run'),
        bullet('Open the Replit shell and run: bash scripts/check-env.sh'),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log('Done:', OUTPUT_FILE);
}

main().catch(console.error);
```

**Step 2: Verify script syntax**

```bash
node -c docs/generate-guide.js
```

Expected: `OK` (no syntax errors)

---

## Phase 2 (Sequential)

### Task 4: Run the docx-js Script

**Prereq:** Tasks 2 and 3 must be complete (screenshots on disk, script written)

**Step 1: Run the generator**

```bash
cd /home/chicagojoe/PyCharmProjects/everysk/apps/everysk-replit-templates
node docs/generate-guide.js
```

Expected output:
```
Generating: Getting Started - Everysk App Template on Replit.docx
Done: /home/chicagojoe/.../docs/Getting Started - Everysk App Template on Replit.docx
```

Any `[WARN] Screenshot not found` lines mean that screenshot wasn't captured — the doc still generates with a placeholder. Go back to Task 2 and recapture.

**Step 2: Verify file exists and is non-trivial**

```bash
ls -lh "docs/Getting Started - Everysk App Template on Replit.docx"
```

Expected: > 50KB (with screenshots), > 10KB (placeholders only)

---

### Task 5: Validate the .docx

**Step 1: Check scripts/office/validate.py exists**

```bash
ls scripts/office/validate.py || echo "validate.py not found — skip validation"
```

**Step 2: Run validation (if available)**

```bash
python scripts/office/validate.py "docs/Getting Started - Everysk App Template on Replit.docx"
```

Expected: No errors. If errors appear, unpack and fix per the docx skill XML Reference patterns:
```bash
python scripts/office/unpack.py "docs/Getting Started - Everysk App Template on Replit.docx" docs/unpacked/
# fix XML in docs/unpacked/word/document.xml
python scripts/office/pack.py docs/unpacked/ "docs/Getting Started - Everysk App Template on Replit.docx" --original "docs/Getting Started - Everysk App Template on Replit.docx"
```

---

### Task 6: Commit

**Step 1: Stage files**

```bash
cd /home/chicagojoe/PyCharmProjects/everysk/apps/everysk-replit-templates
git add "docs/Getting Started - Everysk App Template on Replit.docx" \
        docs/screenshots/ \
        docs/generate-guide.js \
        docs/plans/
```

**Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
docs: add Replit import guide with screenshots and agent skills reference

- New .docx: Getting Started - Everysk App Template on Replit.docx
- 6 Playwright screenshots of the Replit import workflow
- Step-by-step instructions for secrets setup and app startup
- Agent Skills section: table of all skills, invocation patterns, brainstorming workflow
- generate-guide.js: docx-js script for reproducible document regeneration

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Execution Notes

- **Screenshots directory:** `docs/screenshots/` — filenames must match exactly what `generate-guide.js` expects (01 through 06, `.png`)
- **Re-running:** If new screenshots are captured, just re-run `node docs/generate-guide.js` — it reads from disk each time
- **Image sizing:** Images are set to 624×390px in the docx. Playwright screenshots are typically 1280×800 — they scale down cleanly
- **Skill reference:** @docx skill handles XML repair patterns if validation fails
