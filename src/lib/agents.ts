/**
 * In-memory agent store and data access utilities.
 *
 * Provides CRUD operations for agent management. In a production environment,
 * this would be backed by a database; here we use an in-memory Map for
 * demonstration purposes.
 *
 * @module lib/agents
 */

import {
  Agent,
  AgentConfig,
  CreateAgentRequest,
  UpdateAgentRequest,
} from "@/types/agent";

/**
 * Default agent configuration values applied when creating a new agent
 * without explicit configuration overrides.
 */
const DEFAULT_CONFIG: AgentConfig = {
  maxTokens: 4096,
  temperature: 1.0,
  timeoutMs: 30000,
  retryAttempts: 3,
};

/** In-memory store for agent records, keyed by agent ID. */
const agentStore = new Map<string, Agent>();

/**
 * Generates a unique agent identifier.
 *
 * Produces a string in the format `agent_<random>` using a combination
 * of timestamp and random characters for collision resistance.
 *
 * @returns A unique agent ID string.
 *
 * @example
 * ```typescript
 * const id = generateId();
 * // "agent_k7f2m9x1"
 * ```
 */
function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const random = Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `agent_${random}`;
}

/**
 * Retrieves all agents from the store.
 *
 * Returns the complete list of agents sorted by creation date (newest first).
 *
 * @returns An array of all {@link Agent} records.
 *
 * @example
 * ```typescript
 * const agents = getAllAgents();
 * console.log(`Found ${agents.length} agents`);
 * ```
 */
export function getAllAgents(): Agent[] {
  return Array.from(agentStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Retrieves a single agent by its unique identifier.
 *
 * @param id - The unique agent identifier to look up.
 * @returns The matching {@link Agent} record, or `undefined` if not found.
 *
 * @example
 * ```typescript
 * const agent = getAgentById("agent_k7f2m9x1");
 * if (agent) {
 *   console.log(`Found agent: ${agent.name}`);
 * }
 * ```
 */
export function getAgentById(id: string): Agent | undefined {
  return agentStore.get(id);
}

/**
 * Creates a new agent with the given parameters.
 *
 * Applies default values for any fields not specified in the request.
 * The new agent starts with `status: "provisioning"` and receives a
 * generated unique ID.
 *
 * @param request - The {@link CreateAgentRequest} containing agent details.
 * @returns The newly created {@link Agent} record.
 *
 * @example
 * ```typescript
 * const newAgent = createAgent({
 *   name: "Research Assistant",
 *   description: "Helps with literature reviews",
 *   capabilities: ["text-generation", "data-retrieval"],
 * });
 * console.log(`Created agent: ${newAgent.id}`);
 * ```
 */
export function createAgent(request: CreateAgentRequest): Agent {
  const now = new Date().toISOString();
  const agent: Agent = {
    id: generateId(),
    name: request.name,
    description: request.description ?? "",
    status: "provisioning",
    capabilities: request.capabilities ?? ["text-generation"],
    config: {
      ...DEFAULT_CONFIG,
      ...request.config,
    },
    createdAt: now,
    updatedAt: now,
  };

  agentStore.set(agent.id, agent);
  return agent;
}

/**
 * Updates an existing agent with the provided partial data.
 *
 * Only fields present in the update request are modified. The `updatedAt`
 * timestamp is automatically refreshed. Config updates are merged with
 * the existing configuration.
 *
 * @param id - The unique identifier of the agent to update.
 * @param request - The {@link UpdateAgentRequest} containing fields to update.
 * @returns The updated {@link Agent} record, or `undefined` if the agent was not found.
 *
 * @example
 * ```typescript
 * const updated = updateAgent("agent_k7f2m9x1", {
 *   status: "active",
 *   config: { temperature: 0.5 },
 * });
 * ```
 */
export function updateAgent(
  id: string,
  request: UpdateAgentRequest
): Agent | undefined {
  const existing = agentStore.get(id);
  if (!existing) return undefined;

  const updated: Agent = {
    ...existing,
    ...(request.name !== undefined && { name: request.name }),
    ...(request.description !== undefined && {
      description: request.description,
    }),
    ...(request.status !== undefined && { status: request.status }),
    ...(request.capabilities !== undefined && {
      capabilities: request.capabilities,
    }),
    ...(request.config !== undefined && {
      config: { ...existing.config, ...request.config },
    }),
    updatedAt: new Date().toISOString(),
  };

  agentStore.set(id, updated);
  return updated;
}

/**
 * Deletes an agent from the store by its unique identifier.
 *
 * @param id - The unique identifier of the agent to delete.
 * @returns `true` if the agent was found and deleted, `false` otherwise.
 *
 * @example
 * ```typescript
 * const wasDeleted = deleteAgent("agent_k7f2m9x1");
 * if (wasDeleted) {
 *   console.log("Agent removed successfully");
 * }
 * ```
 */
export function deleteAgent(id: string): boolean {
  return agentStore.delete(id);
}
