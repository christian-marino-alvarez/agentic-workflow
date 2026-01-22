---
id: metrics.index
owner: architect-agent
version: 1.0.0
severity: PERMANENT
---

# INDEX — Metrics

## Objetivo
Este fichero enumera los archivos de métricas del sistema de agentes.

## Aliases (YAML)
```yaml
metrics:
  agent_scores: .agent/metrics/agent-scores.md
  agents_json: .agent/metrics/agents.json
```

## Reglas
- `agents.json` almacena puntuaciones históricas por agente.
- `agent-scores.md` es el template de visualización.
- Las métricas se actualizan en Phase 7 (Evaluation).
