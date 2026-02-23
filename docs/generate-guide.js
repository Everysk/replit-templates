// docs/generate-guide.js
// Run: node docs/generate-guide.js
// Requires: npm install docx (or: npm install -g docx)

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, HeadingLevel, AlignmentType, LevelFormat,
  BorderStyle, WidthType, ShadingType, PageBreak
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Helper: image paragraph with caption
function imageParagraph(filename, caption) {
  const data = loadImage(filename);
  const children = [];

  if (data) {
    children.push(new ImageRun({
      type: 'png',
      data,
      transformation: { width: 624, height: 390 },
      altText: { title: caption, description: caption, name: caption }
    }));
  } else {
    children.push(new TextRun({
      text: `[Screenshot: ${filename} — not yet captured]`,
      italics: true,
      color: 'FF0000'
    }));
  }

  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: caption, italics: true, size: 18, color: '666666' })]
    }),
    new Paragraph({ children: [] })
  ];
}

function stepParagraph(num, text) {
  return new Paragraph({
    numbering: { reference: 'steps', level: 0 },
    children: [new TextRun({ text, size: 24 })]
  });
}

function bulletParagraph(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text, size: 24 })]
  });
}

function codeRun(text) {
  return new TextRun({ text, font: 'Courier New', size: 20, bold: true });
}

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

const skills = [
  ['brainstorming', '.agents/skills/brainstorming', 'Before any creative/feature work — design first, code second'],
  ['everysk-lib-sdk', '.agents/skills/everysk/everysk-lib-sdk', 'Everysk Python SDK: portfolios, datastores, workflows'],
  ['everysk-mcp', '.agents/skills/everysk/everysk-mcp', 'Everysk MCP server integration patterns'],
  ['everysk-worker-builder', '.agents/skills/everysk/workers-everysk-skill', 'Building new workers in the Everysk workers-everysk platform'],
  ['frontend-design', '.agents/skills/frontend-design', 'Building or styling any UI — MUI + Tailwind best practices'],
  ['agent-tools', '.agents/skills/agent-tools', 'AI model inference, image/video generation, web search via CLI'],
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
          children: [new Paragraph({ children: [codeRun(name)] })]
        }),
        new TableCell({
          borders, width: { size: 2800, type: WidthType.DXA },
          shading: { fill: i % 2 === 0 ? 'F5F5F5' : 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [codeRun(skillPath)] })]
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
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        },
        {
          reference: 'bullets',
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        }
      ]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: 24 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, font: 'Arial', color: '1A1A2E' },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: 'Arial', color: '16213E' },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: 'Arial', color: '0F3460' },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
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
            children: [new TextRun({ text: 'Everysk App Template \u2014 Getting Started Guide', size: 18, color: '999999' })]
          })]
        })
      },
      children: [
        // TITLE
        new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Getting Started', bold: true, size: 52 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Everysk App Template on Replit', size: 36, color: '0F3460' })] }),
        new Paragraph({ children: [] }),

        // PREREQUISITES
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Prerequisites')] }),
        new Paragraph({ children: [
          new TextRun({ text: 'Before importing the template, gather the following credentials from your Everysk account at ', size: 24 }),
          new TextRun({ text: 'https://everysk.com/account', size: 24, bold: true })
        ]}),
        new Paragraph({ children: [] }),
        bulletParagraph('EVERYSK_API_SID \u2014 Your Everysk API account SID'),
        bulletParagraph('EVERYSK_API_TOKEN \u2014 Your Everysk API authentication token'),
        bulletParagraph('EVERYSK_APP_NAME \u2014 The name for your Everysk application'),
        new Paragraph({ children: [] }),

        // IMPORT WORKFLOW
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Importing the Template into Replit')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 1 \u2014 Open the GitHub Template')] }),
        new Paragraph({ children: [new TextRun({ text: 'Navigate to the template repository on GitHub:', size: 24 })] }),
        new Paragraph({ children: [codeRun('https://github.com/Everysk/replit-templates')] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('01-github-template.png', 'Figure 1: Everysk template repository on GitHub'),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 2 \u2014 Import into Replit')] }),
        new Paragraph({ children: [new TextRun({ text: 'Open the following URL to import the template directly into Replit:', size: 24 })] }),
        new Paragraph({ children: [codeRun('https://replit.com/github/Everysk/replit-templates')] }),
        new Paragraph({ children: [new TextRun({ text: 'Sign in to Replit if prompted, then click Fork or Import to create your own copy.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('02-replit-import.png', 'Figure 2: Replit import / fork page'),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 3 \u2014 Your Replit Workspace')] }),
        new Paragraph({ children: [new TextRun({ text: 'After the import completes, Replit opens your new workspace with the project files in the left panel and the shell at the bottom.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('03-replit-workspace.png', 'Figure 3: Replit workspace after import'),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 4 \u2014 Open the Secrets Tab')] }),
        new Paragraph({ children: [new TextRun({ text: 'Click the lock icon (\uD83D\uDD12) in the left sidebar to open the Secrets tab. This is where you store environment variables securely \u2014 they are never committed to your repository.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('04-secrets-tab.png', 'Figure 4: Secrets tab (lock icon in sidebar)'),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 5 \u2014 Add Required Secrets')] }),
        new Paragraph({ children: [new TextRun({ text: 'Add each of the following secrets by clicking New Secret, entering the key name, and pasting the value:', size: 24 })] }),
        new Paragraph({ children: [] }),
        stepParagraph(1, 'Key: EVERYSK_API_SID  \u2192  Value: your API SID from everysk.com/account'),
        stepParagraph(2, 'Key: EVERYSK_API_TOKEN  \u2192  Value: your API token'),
        stepParagraph(3, 'Key: EVERYSK_APP_NAME  \u2192  Value: your application name'),
        new Paragraph({ children: [] }),
        ...imageParagraph('05-add-secret.png', 'Figure 5: Adding the EVERYSK_API_SID secret'),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Step 6 \u2014 Run the App')] }),
        new Paragraph({ children: [new TextRun({ text: 'Click the green Run button at the top of the workspace. The startup script validates all required secrets before starting the Vite dev server on port 5000. If any secrets are missing, you will see a clear error in the console.', size: 24 })] }),
        new Paragraph({ children: [] }),
        ...imageParagraph('06-app-running.png', 'Figure 6: App running in Replit'),
        new Paragraph({ children: [new PageBreak()] }),

        // AGENT SKILLS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Understanding Agent Skills')] }),
        new Paragraph({ children: [
          new TextRun({ text: 'This template ships with AI agent skills in the ', size: 24 }),
          codeRun('.agents/skills/'),
          new TextRun({ text: ' directory. These are instruction files that tell the Replit AI agent (and Claude Code) how to approach specific tasks correctly.', size: 24 })
        ]}),
        new Paragraph({ children: [] }),
        new Paragraph({ children: [
          new TextRun({ text: 'Skills are automatically discovered by any agent that reads ', size: 24 }),
          codeRun('replit.md'),
          new TextRun({ text: ', which lists all mandatory skills with their paths and \u201CWhen to Use\u201D criteria.', size: 24 })
        ]}),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Available Skills')] }),
        new Paragraph({ children: [] }),
        skillsTable(),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('How to Invoke Skills')] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('In Claude Code (terminal):')] }),
        new Paragraph({ children: [codeRun('Skill(skill="brainstorming")')] }),
        new Paragraph({ children: [codeRun('Skill(skill="everysk-lib-sdk")')] }),
        new Paragraph({ children: [codeRun('Skill(skill="frontend-design")')] }),
        new Paragraph({ children: [] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('In Replit AI Agent:')] }),
        new Paragraph({ children: [
          new TextRun({ text: 'Skills are loaded automatically. The agent reads ', size: 24 }),
          codeRun('replit.md'),
          new TextRun({ text: ' at the start of every conversation and loads the relevant skill before performing matching work.', size: 24 })
        ]}),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Key Skill: brainstorming')] }),
        new Paragraph({ children: [new TextRun({ text: 'The brainstorming skill enforces design-before-code discipline. Every time you ask the AI agent to build a new feature, it will:', size: 24 })] }),
        bulletParagraph('Explore the codebase and understand the current context'),
        bulletParagraph('Ask clarifying questions one at a time'),
        bulletParagraph('Propose 2\u20133 approaches with trade-offs'),
        bulletParagraph('Present a design for your approval before writing any code'),
        new Paragraph({ children: [] }),
        new Paragraph({ children: [new TextRun({ text: 'This prevents wasted work and ensures alignment before implementation begins.', size: 24, bold: true })] }),
        new Paragraph({ children: [] }),

        // TROUBLESHOOTING
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Troubleshooting')] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Missing secrets error on startup')] }),
        new Paragraph({ children: [
          new TextRun({ text: 'If you see a secrets validation error in the console, open the Secrets tab and verify all three secrets are present: ', size: 24 }),
          codeRun('EVERYSK_API_SID'), new TextRun({ text: ', ', size: 24 }),
          codeRun('EVERYSK_API_TOKEN'), new TextRun({ text: ', and ', size: 24 }),
          codeRun('EVERYSK_APP_NAME'), new TextRun({ text: '. Then click Run again.', size: 24 })
        ]}),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Agent not loading skills')] }),
        new Paragraph({ children: [
          new TextRun({ text: 'If the Replit agent skips the brainstorming or everysk skill steps, ask it to re-read ', size: 24 }),
          codeRun('replit.md'),
          new TextRun({ text: '. The file contains the mandatory skill requirements that must be followed in every conversation.', size: 24 })
        ]}),
        new Paragraph({ children: [] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('App not loading in Replit webview')] }),
        bulletParagraph('Verify the dev server started on port 5000 (check console output)'),
        bulletParagraph('Check that all three secrets are set correctly'),
        bulletParagraph('Try stopping and re-clicking Run'),
        bulletParagraph('Open the Replit shell and run: bash scripts/check-env.sh'),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log('Done:', OUTPUT_FILE);
}

main().catch(console.error);
