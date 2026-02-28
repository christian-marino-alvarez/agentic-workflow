---
id: workflow.optional.performance
name: Performance Audit
description: "Performance analysis, optimization recommendations, and benchmark validation."
owner: architect-agent
trigger: ["performance"]
type: dynamic
objective: "Assess performance impact of changes and provide optimization recommendations."
context:
  - .agent/artifacts/<TASK>/architect/analysis-v1.md
input:
  - Implemented code changes
output:
  - .agent/artifacts/<TASK>/architect/performance-report-v1.md
---

# WORKFLOW: optional.performance

## Input
- Analysis context and implemented code changes.

## Output
- Artifact: `.agent/artifacts/<TASK>/architect/performance-report-v1.md`

## Objective
Assess the performance impact of implemented changes. Analyze bundle size, load times, render performance, data flow efficiency, and memory usage.

## Instructions
1. **Analyze bundle impact**: Check if new dependencies increase bundle size.
2. **Evaluate render performance**: Check for unnecessary re-renders, lazy loading.
3. **Data flow analysis**: Check for redundant computations, message bloat.
4. **Memory considerations**: Check for potential leaks.
5. **Create performance report**: Document in `performance-report.md`.

## Gate
1. Performance analysis completed.
2. `performance-report.md` artifact created.

## Pass
- Return to parent phase with results.

## Fail
- Critical performance issues detected.