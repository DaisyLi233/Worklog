# WorkLog

WorkLog is an AI-powered work journal that helps users capture daily work as it happens and turn scattered logs into structured summaries, knowledge transfer, and performance reports.

## Problem

Work is continuous, but reflection and summarization are often delayed until the very end. This creates a gap between what people actually do during the process and what eventually gets documented.

For individuals, there are three core things people seek from their work:

1. Contributions and influence  
   What they have done and the impact they have created  

2. Skills  
   What they have learned, including both hard skills and soft skills  

3. Recognition  
   Whether their contributions and growth are seen and acknowledged by others  

In reality, however, this becomes difficult to achieve because of the disconnect between continuous work and one-time reflection. When employees try to summarize their experience at the end, they often forget what they have done. Many details, processes, small milestones, and even small personal achievements are lost. As a result, the content becomes fragmented and lacks structure, making it difficult to clearly present their contributions, skills, and personal growth.

For organizations, the accumulation of knowledge is equally important. Well-documented knowledge allows new team members to onboard quickly and enables others to reference past work when needed. The quality of knowledge transfer and training materials largely depends on how employees document their work.

However, due to the same disconnect between continuous work and delayed documentation, the quality is often not ideal. Documentation is usually written only at the end, which leads to knowledge that is not continuous, not sufficiently detailed, and not well structured.

## Value

For individuals, WorkLog provides a clearer and more continuous understanding of their work. Users can see what they have contributed, what they have learned, and how they have grown over time, including both hard skills and soft skills. Instead of relying on memory at the end, their work is captured as it happens and can be transformed into structured reports.

These outputs can be used in practical scenarios such as weekly reports and standup meetings, making it easier to communicate progress and impact. By turning daily work into structured outputs, WorkLog helps users better express their contribution, demonstrate their skills, and gain recognition.

It directly supports the three core needs of employees: contribution, skills, and recognition.

For organizations, WorkLog enables higher quality knowledge transfer by making documentation continuous rather than retrospective. Knowledge is no longer scattered or reconstructed at the end, but instead captured throughout the process, structured over time, and accumulated in a consistent way.

This results in knowledge that is continuous, structured, and built over time, rather than fragmented and assembled at the last minute. In essence, it turns individual work memory into organizational knowledge.

## Features

### Projects

WorkLog separates different projects or internships into independent folders so users can organize and manage work in a clear way.

### Work Log System

The work log system is the core of the product. It provides a flexible, Notion-like writing experience where users can add text blocks and attach screenshots or images as part of their record.

WorkLog supports three log types, each designed for a different dimension of work:

**Process** records technical work and workflow details. It focuses on how a feature, task, or solution was implemented, and is primarily used to capture hard skills.

**Obstacle** records blockers, challenges, and points of friction during the process. It captures what slowed progress down, what went wrong, and what had to be resolved.

**Retro / Learning** records reflections, takeaways, and lessons learned. It is designed to capture soft skills, self-awareness, and personal growth alongside technical progress.

### Summarize

The Summarize feature allows users to selectively choose which logs to include, rather than forcing everything into one output. Based on those selected entries, the system generates a structured summary with AI. This is especially useful for standups, weekly meetings, and other recurring updates where users need a concise but organized view of recent work.

### Finalize

The Finalize feature is designed for higher-level outputs and supports two different modes.

**Knowledge Transfer** is intended for the organization. It generates company-facing documentation based only on Process and Obstacle logs, focusing on implementation details, workflows, and problem-solving context.

**Performance Report** is intended for the individual. It generates a personal report based on all three log types, including Retro / Learning. This allows users to preserve not only what they did, but also what they learned and how they grew. It can be useful as a personal record, an end-of-internship summary, or a document of professional development.

### Report History and PDF Export

All generated reports are saved in history so users can revisit previous outputs at any time. Reports can also be downloaded as PDF files, making them easier to archive, share, or reuse.

## Setup

### How to Run

```bash
npm install
npm run dev
```
Then open http://localhost:5173.

### Environment Variables
This project requires an API key for AI features.

The repository includes a .env.example file. To run the project locally, create your own .env file in the root directory based on that example:

VITE_ANTHROPIC_API_KEY=your_api_key_here

The real .env file should not be committed to GitHub.

For local development, the app calls the Anthropic API directly from the browser. For production use, API requests should be routed through a backend service so the key can remain secure.

### File Strucuture
```
rc/
  components/
    Layout.jsx
    LogCard.jsx
    AddEntryForm.jsx
    SummarizePanel.jsx
    FinalizeModal.jsx
  pages/
    ProjectPage.jsx
  lib/
    AppContext.jsx
    helpers.js
```

### Stack
React 18 + Vite
Tailwind CSS
React Router v6
Lucide icons
Anthropic Claude API for Summarize, Knowledge Transfer, and Performance Report