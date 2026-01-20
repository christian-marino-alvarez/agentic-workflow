import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { performCreate } from "../cli/commands/create.js";

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

    /**
     * Listado de herramientas disponibles.
     */
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
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
        ],
    }));

    /**
     * Manejador de llamadas a herramientas.
     */
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

        throw new Error(`Herramienta no encontrada: ${name}`);
    });

    // Conexión mediante Standard Input/Output (Stdio)
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Agentic Workflow MCP Server running on stdio");
}
