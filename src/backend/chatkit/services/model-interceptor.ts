import { ModelAdvisor, type ModelProposal, type PhaseContext } from './model-advisor.js';

/**
 * ModelInterceptor - Runtime Integration
 * 
 * Intercepta la ejecución de fases del workflow antes de asignar el modelo
 * y evalúa si se puede proponer un modelo alternativo más eficiente.
 * 
 * Este componente se integra con el runtime de workflows para:
 * 1. Leer la fase actual que se va a ejecutar
 * 2. Consultar al ModelAdvisor sobre el modelo recomendado
 * 3. Emitir propuesta HIL si el modelo del usuario no es óptimo
 * 4. Aplicar la decisión del usuario
 */

export interface InterceptorResult {
  shouldProceed: boolean;
  proposal?: ModelProposal;
  modifiedContext?: PhaseContext;
}

export class ModelInterceptor {
  private advisor: ModelAdvisor;

  constructor() {
    this.advisor = new ModelAdvisor();
  }

  /**
   * Intercepta la ejecución de una fase del workflow
   * 
   * @param context Contexto de la fase actual
   * @returns Resultado de la interceptación con posible propuesta
   */
  public intercept(context: PhaseContext): InterceptorResult {
    // Evaluar si hay una propuesta de modelo alternativo
    const proposal = this.advisor.evaluatePhase(context);

    if (proposal) {
      // Hay una propuesta: pausar ejecución y solicitar consentimiento HIL
      return {
        shouldProceed: false,
        proposal,
        modifiedContext: context
      };
    }

    // No hay propuesta: proceder con el modelo actual
    return {
      shouldProceed: true
    };
  }

  /**
   * Aplica la decisión del usuario sobre la propuesta
   * 
   * @param context Contexto original
   * @param accepted Si el usuario aceptó la propuesta
   * @param proposal La propuesta original
   * @returns Contexto modificado si se aceptó, o el original si se rechazó
   */
  public applyDecision(
    context: PhaseContext,
    accepted: boolean,
    proposal: ModelProposal
  ): PhaseContext {
    if (accepted) {
      return {
        ...context,
        currentModel: proposal.proposedModel
      };
    }
    return context;
  }

  /**
   * Obtiene información sobre un modelo
   */
  public getModelInfo(modelId: string) {
    return this.advisor.getModelInfo(modelId);
  }
}
