import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type * as z from 'zod/v4';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type ListResourcesResult,
  type ListResourceTemplatesResult,
  type ListToolsResult,
  type ReadResourceResult,
  type ServerResult
} from '@modelcontextprotocol/sdk/types.js';
import { wrapHandler } from './tool.js';
import { DebugReadLogsRequestSchema, RuntimeAdvancePhaseRequestSchema, RuntimeChatRequestSchema, RuntimeCompleteStepRequestSchema, RuntimeEmitEventRequestSchema, RuntimeGetStateRequestSchema, RuntimeListWorkflowsRequestSchema, RuntimeNextStepRequestSchema, RuntimeResumeRequestSchema, RuntimeRunRequestSchema, RuntimeValidateGateRequestSchema } from '../schemas/runtime.js';
import { handleToolsCall } from '../handlers/tools.js';
import { listResources, listTemplateResourceTemplates, handleReadResource } from '../handlers/resources.js';
import { handleRun } from '../handlers/runtime/run.js';
import { handleResume, handleNextStep, handleCompleteStep } from '../handlers/runtime/step.js';
import { handleGetState } from '../handlers/runtime/state.js';
import { handleListWorkflows } from '../handlers/runtime/workflows.js';
import { handleValidateGate } from '../handlers/runtime/gates.js';
import { handleAdvancePhase } from '../handlers/runtime/advance-phase.js';
import { handleEmitEvent, handleChat } from '../handlers/runtime/events.js';
import { handleDebugReadLogs } from '../handlers/runtime/debug.js';
import { MCP_TOOLS } from '../tools/runtime-tools.js';

type RegisterSpec<TResult> = {
  schema: any;
  tag: string;
  run: (request: any) => Promise<TResult> | TResult;
};

const ROUTES = [
  route({
    schema: ListToolsRequestSchema,
    tag: 'tools.list',
    run: (_request) => ({ tools: MCP_TOOLS }) satisfies ListToolsResult
  }),
  route({
    schema: CallToolRequestSchema,
    tag: 'tools.call',
    run: async (request) => handleToolsCall(request.params.name, request.params.arguments ?? {})
  }),
  route({
    schema: ListResourcesRequestSchema,
    tag: 'resources.list',
    run: async (_request) => ({
      resources: await listResources()
    }) satisfies ListResourcesResult
  }),
  route({
    schema: ListResourceTemplatesRequestSchema,
    tag: 'resources.templates.list',
    run: async (_request) => ({
      resourceTemplates: await listTemplateResourceTemplates()
    }) satisfies ListResourceTemplatesResult
  }),
  route({
    schema: ReadResourceRequestSchema,
    tag: 'resources.read',
    run: async (request) => {
      const result = await handleReadResource(request.params.uri);
      return result satisfies ReadResourceResult;
    }
  }),
  route({
    schema: RuntimeRunRequestSchema,
    tag: 'runtime.run',
    run: async (request) => handleRun(request.params ?? {})
  }),
  route({
    schema: RuntimeResumeRequestSchema,
    tag: 'runtime.resume',
    run: async (request) => handleResume(request.params ?? {})
  }),
  route({
    schema: RuntimeGetStateRequestSchema,
    tag: 'runtime.get_state',
    run: async (request) => handleGetState(request.params ?? {})
  }),
  route({
    schema: RuntimeListWorkflowsRequestSchema,
    tag: 'runtime.list_workflows',
    run: async (request) => handleListWorkflows(request.params ?? {})
  }),
  route({
    schema: RuntimeValidateGateRequestSchema,
    tag: 'runtime.validate_gate',
    run: async (request) => handleValidateGate(request.params ?? {})
  }),
  route({
    schema: RuntimeAdvancePhaseRequestSchema,
    tag: 'runtime.advance_phase',
    run: async (request) => handleAdvancePhase(request.params ?? {})
  }),
  route({
    schema: RuntimeEmitEventRequestSchema,
    tag: 'runtime.emit_event',
    run: async (request) => handleEmitEvent(request.params ?? {})
  }),
  route({
    schema: RuntimeChatRequestSchema,
    tag: 'runtime.chat',
    run: async (request) => handleChat(request.params ?? {})
  }),
  route({
    schema: RuntimeNextStepRequestSchema,
    tag: 'runtime.next_step',
    run: async (request) => handleNextStep(request.params ?? {})
  }),
  route({
    schema: RuntimeCompleteStepRequestSchema,
    tag: 'runtime.complete_step',
    run: async (_request) => handleCompleteStep()
  }),
  route({
    schema: DebugReadLogsRequestSchema,
    tag: 'debug.read_logs',
    run: async (request) => handleDebugReadLogs(request.params ?? {})
  })
] as const;

export function registerAll(server: Server): void {
  for (const routeEntry of ROUTES) {
    register(server, routeEntry as RegisterSpec<unknown>);
  }
}

function register<TResult>(server: Server, spec: RegisterSpec<TResult>): void {
  server.setRequestHandler(spec.schema, wrapHandler(spec.tag, spec.run));
}

function route<TResult>(spec: RegisterSpec<TResult>): RegisterSpec<TResult> {
  return spec;
}
