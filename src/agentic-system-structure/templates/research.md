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
> **PERMANENT RULE**: This document is ONLY documentation.
> The researcher-agent documents findings WITHOUT analyzing, WITHOUT recommending, WITHOUT proposing solutions.
> Analysis belongs to Phase 2.

## 1. Executive Summary
- Problem investigated
- Research objective
- Key findings

---

## 2. Detected Needs
- Technical requirements identified by the architect-agent
- Assumptions and limitations

---

## 3. Technical Findings
For each finding:
- Description of the concept/technology
- Current state (stable, experimental, deprecated)
- Official documentation
- Known limitations

> **DO NOT include**: pros/cons, recommendations, decisions.

---

## 4. Relevant APIs
- API / specification
- Support status (Chrome/Firefox/Safari)
- Known restrictions

---

## 5. Multi-browser Compatibility
- Compatibility table
- Key differences
- Mitigation strategies

---

## 6. Detected AI-first Opportunities
- Patterns or APIs that could enable automation
- References to relevant documentation

> **DO NOT include**: expected impact, usage recommendations.

---

## 7. Identified Risks
- Detected risk
- Severity (high/medium/low)
- Information source

> **DO NOT include**: mitigations (those belong to analysis).

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
    decision: SI | NO
    date: <ISO-8601>
    comments: <optional>
```
