---
id: task.26
title: Portable Agentic System
status: defined
owner: architect-agent
strategy: long
created_at: 2026-01-19T21:16:00+01:00
lifecycle:
  phases:
    phase-0-acceptance-criteria:
      completed: true
      validated_at: 2026-01-19T21:17:26+01:00
    phase-1-research:
      completed: true
      validated_at: 2026-01-19T21:21:58+01:00
    phase-2-analysis:
      completed: true
      validated_at: 2026-01-19T21:25:29+01:00
    phase-3-planning:
      completed: true
      validated_at: 2026-01-19T21:30:01+01:00
    phase-4-implementation:
      completed: true
      validated_at: 2026-01-19T22:48:00+01:00
      current: false
    phase-5-verification:
      completed: true
      validated_at: 2026-01-19T22:52:00+01:00
      current: false
    phase-6-results-acceptance:
      completed: false
      current: true
    phase-7-evaluation:
      completed: false
    phase-8-commit-push:
      completed: false
aliases:
  acceptance: .agent/artifacts/26-portable-agentic-system/acceptance.md
---

# Task 26: Portable Agentic System

## Description
Make the current agentic system portable via an npm package. This allows distribution via npm, global installation, and per-project customization of constitutions, roles, and workflows.

## Goal
Decouple the agentic orchestration from the Extensio framework and package it as `@cmarino/agentic-workflow`, enabling any project to function as an "Agentic Workspace" with a standard `npm init` setup.

## Current Phase: Phase 0 (Acceptance Criteria)
See [Acceptance Criteria](acceptance.md) for details.
