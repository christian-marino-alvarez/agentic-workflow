import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { performCreate } from "../cli/commands/create.js";
import { ContextManager } from "../core/context/manager.js";
import { resolveCorePath } from "../core/mapping/resolver.js";


/**
 * Servidor MCP para el framework Agentic Workflow.
 * Proporciona herramientas estructuradas para extender el sistema.
 */
export async function runMcpServer() {
    const server = new Server(
        {
            name: "agentic-workflow-server",
            version: "1.3.0",
        },
        {
            capabilities: {
                tools: {},
            },
        }
    );

    // Configuración del Ciclo de Vida (Lifecycle)
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            console.error("MCP Server shutting down due to inactivity...");
            process.exit(0);
        }, INACTIVITY_TIMEOUT);
    };

    // Iniciar timer inicial
    resetInactivityTimer();

    /**
     * Listado de herramientas disponibles.
     */
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        resetInactivityTimer();
        return {
            tools: [
                {
                    name: "create_role",
                    description: "Crea un nuevo rol (agente) en el proyecto local bajo la carpeta espejo .agent/roles/.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Nombre del rol (ej: devops, qa, reviewer)",
                            },
                        },
                        required: ["name"],
                    },
                },
                {
                    name: "create_workflow",
                    description: "Crea un nuevo workflow personalizado en el proyecto local bajo la carpeta espejo .agent/workflows/.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Nombre del workflow (ej: refactor, release, triage)",
                            },
                        },
                        required: ["name"],
                    },
                },
                {
                    name: "bootstrap_context",
                    description: "Genera un bundle consolidado con el índice maestro, índices de dominio, constitución base y roles esenciales en un solo paso (Best Practice).",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
                {
                    name: "hydrate_context",
                    description: "Carga dinámicamente el contenido de todos los ficheros asociados a un alias (ej: rules.constitution) de forma consolidada.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            alias: {
                                type: "string",
                                description: "Alias del dominio a hidratar (ej: rules.constitution, workflows.modules)",
                            },
                        },
                        required: ["alias"],
                    },
                },
                {
                    name: "stop_server",
                    description: "Detiene el servidor MCP inmediatamente.",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
            ],
        };
    });

    /**
     * Manejador de llamadas a herramientas.
     */
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        resetInactivityTimer();
        const { name, arguments: args } = request.params;

        if (name === "create_role" || name === "create_workflow") {
            const type = name === "create_role" ? "role" : "workflow";
            const entityName = (args as any).name;

            if (!entityName) {
                throw new Error("El nombre de la entidad es obligatorio.");
            }

            const result = await performCreate(type, entityName);

            return {
                content: [
                    {
                        type: "text",
                        text: result.message,
                    },
                ],
                isError: !result.success,
            };
        }

        if (name === "bootstrap_context") {
            const corePath = await resolveCorePath();
            const manager = new ContextManager(process.cwd(), corePath);
            const bundle = await manager.bootstrapContext();
            return {
                content: [{ type: "text", text: bundle }]
            };
        }

        if (name === "hydrate_context") {
            const corePath = await resolveCorePath();
            const manager = new ContextManager(process.cwd(), corePath);
            const alias = (args as any).alias;
            const files = await manager.resolveAlias(alias);

            if (files.length === 0) {
                return {
                    content: [{ type: "text", text: `No se encontraron ficheros para el alias: ${alias}` }],
                    isError: true
                };
            }

            const bundle = (manager as any).formatBundle(files);
            return {
                content: [{ type: "text", text: bundle }]
            };
        }

        if (name === "stop_server") {
            setTimeout(() => process.exit(0), 100);
            return {
                content: [{ type: "text", text: "Servidor deteniéndose..." }]
            };
        }

        throw new Error(`Herramienta no encontrada: ${name}`);
    });

    // Conexión mediante Standard Input/Output (Stdio)
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Agentic Workflow MCP Server running on stdio");
}
