# Acceptance Criteria — 9-Unified Tabbed Shell Implementation

## 1. Consolidated Definition
Se implementará un Shell Unificado basado en Lit para albergar los 4 módulos de la extensión.

## 2. Developer Responses (Consolidated)
- **viewId**: `agw.mainView` será el identificador único.
- **Estado**: Persistencia en memoria (Lit) + sincronización periódica con el Background.
- **Default Tab**: `Chat` será la pestaña activa por defecto.
- **Integración**: Arquitectura Reactiva (Shell se suscribe a los controladores existentes).
- **Shortcuts**: `Cmd+1` a `Cmd+4` para navegación rápida.

## 3. Verifiable Criteria
- [ ] Existe un único `registerWebviewViewProvider` en el Core Controller apuntando a `agw.mainView`.
- [ ] `<agw-unified-shell>` renderiza 4 pestañas: Chat, Workflow, History, Security.
- [ ] Al pulsar `Cmd+2` el Shell cambia a la pestaña `Workflow` sin parpadeos de Iframe.
- [ ] El texto escrito en el input de Chat persiste tras navegar a Security y volver.

## 4. Approval
```yaml
approval:
  developer:
    decision: SI
    date: "2026-02-11T07:30:43Z"
    comments: "Aprobado para iniciar implementación del shell unificado."
```

## 5. History
- **Phase 0 Validation**: 2026-02-11T07:32:00Z by architect-agent.
