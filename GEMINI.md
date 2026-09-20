# Project Rules & Operating Guidelines

These rules are mandatory and must be strictly followed for all work in this repository:

## 1. Never Run the Project
- **Rule:** Do NOT run the project under any circumstances (e.g., `npm run dev`, `next dev`, `npm start`, `node`, `python wiki.py`, etc.).
- **Reason:** The user will be running the project themselves, or it will already be running in their environment.

## 2. Mandatory Implementation Plan for Every Request
- **Rule:** For every single request made by the user—no matter how small, minor, or trivial—you MUST generate an implementation plan (`implementation_plan.md`) first.
- **Workflow:**
  1. Present the plan.
  2. Wait for explicit user review and approval before touching or modifying any code/files.

## 3. Never Run Terminal Commands Autonomously
- **Rule:** Do NOT execute terminal-based commands on your own.
- **Workflow:** Always ask the user for permission before running any terminal command, or specify the exact command and ask the user if they would like to run it or have you run it with their consent.

## 4. Always Update ARCHITECTURE.md After Each Implementation
- **Rule:** After completing any feature, bug fix, or architectural modification, you MUST update `ARCHITECTURE.md` to accurately reflect the latest system state, routes, schema models, and technical decisions.
- **Workflow:** Keep `ARCHITECTURE.md` continuously synchronized with the live codebase before completing each task.
