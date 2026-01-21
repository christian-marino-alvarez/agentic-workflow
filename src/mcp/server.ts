import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execFile } from "node:child_process";
import path from "node:path";
import { performCreate } from "../cli/commands/create.js";
import { ContextManager } from "../core/context/manager.js";
import { resolveCorePath, resolveInstalledCorePath } from "../core/mapping/resolver.js";


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
    const projectRoot = process.cwd();
    const allowedCommands = new Set(["cat", "ls", "rg", "sed", "head", "tail", "pwd"]);

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
                {
                    name: "run_command",
                    description: "Ejecuta comandos de lectura seguros dentro del proyecto (cat/ls/rg/sed/head/tail/pwd).",
                    inputSchema: {
                        type: "object",
                        properties: {
                            command: {
                                type: "string",
                                description: "Comando a ejecutar (ej: cat, rg, ls).",
                            },
                            args: {
                                type: "array",
                                items: { type: "string" },
                                description: "Argumentos del comando.",
                            },
                            cwd: {
                                type: "string",
                                description: "Directorio de trabajo relativo al proyecto (opcional).",
                            },
                        },
                        required: ["command"],
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
            const corePath = (await resolveInstalledCorePath(projectRoot)) ?? await resolveCorePath();
            const manager = new ContextManager(process.cwd(), corePath);
            const bundle = await manager.bootstrapContext();
            return {
                content: [{ type: "text", text: bundle }]
            };
        }

        if (name === "hydrate_context") {
            const corePath = (await resolveInstalledCorePath(projectRoot)) ?? await resolveCorePath();
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

        if (name === "run_command") {
            const { command, args: cmdArgs, cwd } = args as any;
            if (!command) {
                throw new Error("El comando es obligatorio.");
            }

            const baseCommand = path.basename(command);
            if (!allowedCommands.has(baseCommand)) {
                throw new Error(`Comando no permitido: ${baseCommand}`);
            }

            const resolvedCwd = cwd ? path.resolve(projectRoot, cwd) : projectRoot;
            if (!resolvedCwd.startsWith(projectRoot)) {
                throw new Error("El cwd debe estar dentro del proyecto.");
            }

            const output = await execFileAsync(baseCommand, Array.isArray(cmdArgs) ? cmdArgs : [], resolvedCwd);
            return {
                content: [{ type: "text", text: output }],
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

function execFileAsync(command: string, args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        execFile(command, args, { cwd, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                const message = stderr?.trim() || error.message || "Error ejecutando comando.";
                reject(new Error(message));
                return;
            }
            const output = `${stdout ?? ""}${stderr ?? ""}`.trim();
            resolve(output.length > 0 ? output : "(sin salida)");
        });
    });
}
