---
artifact: research
phase: phase-1-research
owner: researcher-agent
status: draft | approved
related_task: <taskId>-<taskTitle>
---

# Research Report — <taskId>-<taskTitle>

## Agent Identification (MANDATORY)
First line of the document:
`<icon> **<agent-name>**: <message>`

> [!CAUTION]
> **PERMANENT RULE**: This document is ONLY for documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, and WITHOUT proposing solutions.
> Analysis is the responsibility of the architect during Phase 2.

## 1. Executive Summary
- Problem researched
- Research objective
- Key findings

---

## 2. Detected Needs
- Technical requirements identified by the architect-agent
- Assumptions and limits

---

## 3. Technical Findings
For each finding:
- Concept/technology description
- Current status (stable, experimental, deprecated)
- Official documentation
- Known limitations

> **DO NOT include**: pros/cons, recommendations, or decisions.

---

## 4. Relevant Web APIs / WebExtensions
- API / specification
- Support status (Chrome/Firefox/Safari)
- Known restrictions

---

## 5. Multi-browser Compatibility
- Compatibility table
- Key differences
- Mitigation strategies

---

## 6. AI-first Opportunities Detected
- Patterns or APIs that could enable automation
- References to relevant documentation

> **DO NOT include**: expected impact or usage recommendations.

---

## 7. Identified Risks
- Risk detected
- Severity (high/medium/low)
- Information source

> **DO NOT include**: mitigations (these belong in the analysis).

---

## 8. Sources
- Links to official docs
- RFCs / proposals
- Other resources

---

## 9. Developer Approval (MANDATORY)
```yaml
approval:
  developer:
    decision: YES | NO
    date: <ISO-8601>
    comments: <optional>
```
