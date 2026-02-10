/**
 * ModelAdvisor - Runtime Integration
 * 
 * Servicio que evalúa si el modelo actual del usuario es apropiado para la fase
 * del workflow que se está ejecutando. Se integra con el runtime de workflows
 * para leer la metadata de la fase y proponer modelos alternativos cuando sea necesario.
 */

export interface ModelProposal {
  currentModel: string;
  proposedModel: string;
  reason: string;
  phase: string;
  estimatedSavings: {
    cost: number; // Porcentaje de ahorro
    speed: number; // Porcentaje de mejora en velocidad
  };
}

export interface PhaseContext {
  phase: string;              // ej: "phase-1-research"
  currentModel: string;       // Modelo configurado por el usuario
  workflowId: string;         // ej: "tasklifecycle-long"
}

/**
 * Mapeo de modelos por capacidad (de menor a mayor)
 */
const MODEL_TIERS = {
  'gpt-4o-mini': { tier: 1, cost: 1, speed: 4, name: 'GPT-4o Mini' },
  'gpt-4o': { tier: 2, cost: 3, speed: 2, name: 'GPT-4o' },
  'o1-mini': { tier: 3, cost: 5, speed: 1, name: 'O1 Mini' },
  'o1': { tier: 4, cost: 10, speed: 1, name: 'O1' }
} as const;

/**
 * Mapeo de fases a modelos recomendados
 * 
 * Este mapeo se basa en la complejidad cognitiva requerida por cada fase:
 * - Acceptance Criteria: Preguntas simples → modelo ligero
 * - Research: Investigación requiere capacidad media
 * - Analysis: Análisis profundo requiere razonamiento
 * - Planning: Planificación estratégica → modelo avanzado
 * - Implementation: Código puede ser con modelo medio
 * - Verification: Verificación es más simple
 */
const PHASE_MODEL_RECOMMENDATIONS: Record<string, keyof typeof MODEL_TIERS> = {
  'phase-0-acceptance-criteria': 'gpt-4o-mini',
  'phase-1-research': 'gpt-4o',
  'phase-2-analysis': 'gpt-4o',
  'phase-3-planning': 'o1-mini',
  'phase-4-implementation': 'gpt-4o',
  'phase-5-verification': 'gpt-4o-mini',
  'phase-6-results-acceptance': 'gpt-4o-mini',
  'phase-7-evaluation': 'gpt-4o-mini',
  'phase-8-commit-push': 'gpt-4o-mini',

  // Short workflow phases
  'short-phase-1-analisis': 'gpt-4o',
  'short-phase-2-plan': 'o1-mini',
  'short-phase-3-implementation': 'gpt-4o',
  'short-phase-4-qa-results': 'gpt-4o-mini'
};

export class ModelAdvisor {
  /**
   * Evalúa si se puede proponer un modelo alternativo para la fase actual
   * 
   * @param context Contexto de la fase actual del workflow
   * @returns Propuesta de modelo si el actual es inadecuado, null si es apropiado
   */
  public evaluatePhase(context: PhaseContext): ModelProposal | null {
    const recommendedModel = this.getRecommendedModelForPhase(context.phase);
    const currentTier = this.getModelTier(context.currentModel);
    const recommendedTier = this.getModelTier(recommendedModel);

    // Si el modelo actual es más potente de lo necesario, proponer uno más ligero
    if (currentTier > recommendedTier) {
      return this.createProposal(
        context.currentModel,
        recommendedModel,
        context.phase,
        'downgrade' // Usuario tiene modelo muy potente, proponer uno más ligero
      );
    }

    // Si el modelo actual es menos potente de lo recomendado, proponer uno más potente
    if (currentTier < recommendedTier) {
      return this.createProposal(
        context.currentModel,
        recommendedModel,
        context.phase,
        'upgrade' // Usuario tiene modelo débil, proponer uno más potente
      );
    }

    // El modelo actual es apropiado para la fase
    return null;
  }

  /**
   * Obtiene el modelo recomendado para una fase específica
   */
  private getRecommendedModelForPhase(phase: string): keyof typeof MODEL_TIERS {
    return PHASE_MODEL_RECOMMENDATIONS[phase] ?? 'gpt-4o';
  }

  /**
   * Obtiene el tier del modelo
   */
  private getModelTier(modelId: string): number {
    return MODEL_TIERS[modelId as keyof typeof MODEL_TIERS]?.tier ?? 2;
  }

  /**
   * Crea una propuesta de cambio de modelo
   */
  private createProposal(
    currentModel: string,
    proposedModel: string,
    phase: string,
    type: 'upgrade' | 'downgrade'
  ): ModelProposal {
    const currentMeta = MODEL_TIERS[currentModel as keyof typeof MODEL_TIERS];
    const proposedMeta = MODEL_TIERS[proposedModel as keyof typeof MODEL_TIERS];

    const costSavings = ((currentMeta.cost - proposedMeta.cost) / currentMeta.cost) * 100;
    const speedGain = ((proposedMeta.speed - currentMeta.speed) / currentMeta.speed) * 100;

    return {
      currentModel,
      proposedModel,
      phase,
      reason: this.getProposalReason(phase, type),
      estimatedSavings: {
        cost: Math.round(costSavings),
        speed: Math.round(speedGain)
      }
    };
  }

  /**
   * Genera la razón de la propuesta basada en la fase y el tipo de cambio
   */
  private getProposalReason(phase: string, type: 'upgrade' | 'downgrade'): string {
    const phaseNames: Record<string, string> = {
      'phase-0-acceptance-criteria': 'Definición de Acceptance Criteria',
      'phase-1-research': 'Investigación Técnica',
      'phase-2-analysis': 'Análisis Profundo',
      'phase-3-planning': 'Planificación Estratégica',
      'phase-4-implementation': 'Implementación',
      'phase-5-verification': 'Verificación y Testing',
      'phase-6-results-acceptance': 'Aceptación de Resultados',
      'phase-7-evaluation': 'Evaluación',
      'phase-8-commit-push': 'Commit y Push'
    };

    const phaseName = phaseNames[phase] ?? phase;

    if (type === 'downgrade') {
      return `La fase "${phaseName}" puede ejecutarse eficientemente con un modelo más ligero, ahorrando costos sin comprometer la calidad.`;
    } else {
      return `La fase "${phaseName}" requiere capacidades avanzadas de razonamiento. Se recomienda un modelo más potente para mejores resultados.`;
    }
  }

  /**
   * Obtiene información de un modelo
   */
  public getModelInfo(modelId: string): { name: string; tier: number } | null {
    const meta = MODEL_TIERS[modelId as keyof typeof MODEL_TIERS];
    return meta ? { name: meta.name, tier: meta.tier } : null;
  }
}
