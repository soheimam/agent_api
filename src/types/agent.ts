/**
 * Core type definitions for the Agent API.
 *
 * This module contains all TypeScript interfaces and types used across
 * the agent management API endpoints.
 *
 * @module types/agent
 */

/**
 * Represents the operational status of an agent.
 *
 * @example
 * ```typescript
 * const status: AgentStatus = "active";
 * ```
 */
export type AgentStatus = "active" | "inactive" | "error" | "provisioning";

/**
 * Supported capability types that an agent can possess.
 *
 * @example
 * ```typescript
 * const caps: AgentCapability[] = ["text-generation", "code-execution"];
 * ```
 */
export type AgentCapability =
  | "text-generation"
  | "code-execution"
  | "image-analysis"
  | "data-retrieval"
  | "tool-use";

/**
 * Configuration settings for an agent instance.
 *
 * Defines runtime parameters that control agent behavior such as
 * response limits, temperature, and timeout durations.
 *
 * @example
 * ```typescript
 * const config: AgentConfig = {
 *   maxTokens: 4096,
 *   temperature: 0.7,
 *   timeoutMs: 30000,
 *   retryAttempts: 3,
 * };
 * ```
 */
export interface AgentConfig {
  /** Maximum number of tokens the agent can generate per response. */
  maxTokens: number;

  /**
   * Sampling temperature for response generation.
   * Values range from 0.0 (deterministic) to 2.0 (highly creative).
   * @defaultValue 1.0
   */
  temperature: number;

  /**
   * Maximum time in milliseconds before the agent request times out.
   * @defaultValue 30000
   */
  timeoutMs: number;

  /**
   * Number of retry attempts on transient failures.
   * @defaultValue 3
   */
  retryAttempts: number;
}

/**
 * Represents a single agent in the system.
 *
 * An agent is a configurable AI entity that can perform tasks based on
 * its assigned capabilities and configuration parameters.
 *
 * @example
 * ```typescript
 * const agent: Agent = {
 *   id: "agent_abc123",
 *   name: "Code Assistant",
 *   description: "An agent that helps with code review and generation",
 *   status: "active",
 *   capabilities: ["text-generation", "code-execution"],
 *   config: {
 *     maxTokens: 4096,
 *     temperature: 0.7,
 *     timeoutMs: 30000,
 *     retryAttempts: 3,
 *   },
 *   createdAt: "2024-01-15T10:30:00.000Z",
 *   updatedAt: "2024-01-15T10:30:00.000Z",
 * };
 * ```
 */
export interface Agent {
  /** Unique identifier for the agent, prefixed with `agent_`. */
  id: string;

  /** Human-readable display name for the agent. */
  name: string;

  /** Detailed description of the agent's purpose and behavior. */
  description: string;

  /** Current operational status of the agent. */
  status: AgentStatus;

  /** List of capabilities this agent supports. */
  capabilities: AgentCapability[];

  /** Runtime configuration parameters for the agent. */
  config: AgentConfig;

  /** ISO 8601 timestamp of when the agent was created. */
  createdAt: string;

  /** ISO 8601 timestamp of the last update to the agent. */
  updatedAt: string;
}

/**
 * Request payload for creating a new agent.
 *
 * Only `name` is required; all other fields have sensible defaults.
 *
 * @example
 * ```typescript
 * const request: CreateAgentRequest = {
 *   name: "Data Analyst",
 *   description: "Analyzes datasets and produces summaries",
 *   capabilities: ["text-generation", "data-retrieval"],
 * };
 * ```
 */
export interface CreateAgentRequest {
  /** Human-readable display name for the new agent. */
  name: string;

  /**
   * Optional description of the agent's purpose.
   * @defaultValue ""
   */
  description?: string;

  /**
   * Initial capabilities to assign to the agent.
   * @defaultValue ["text-generation"]
   */
  capabilities?: AgentCapability[];

  /**
   * Optional configuration overrides. Missing fields use defaults.
   */
  config?: Partial<AgentConfig>;
}

/**
 * Request payload for updating an existing agent.
 *
 * All fields are optional — only provided fields will be updated.
 *
 * @example
 * ```typescript
 * const update: UpdateAgentRequest = {
 *   status: "inactive",
 *   config: { temperature: 0.5 },
 * };
 * ```
 */
export interface UpdateAgentRequest {
  /** Updated display name for the agent. */
  name?: string;

  /** Updated description for the agent. */
  description?: string;

  /** Updated operational status. */
  status?: AgentStatus;

  /** Updated list of capabilities. */
  capabilities?: AgentCapability[];

  /** Partial configuration updates. Only provided fields are changed. */
  config?: Partial<AgentConfig>;
}

/**
 * Standard API response wrapper.
 *
 * All API responses follow this structure to provide consistent
 * success/error handling for clients.
 *
 * @typeParam T - The type of data contained in a successful response.
 *
 * @example
 * ```typescript
 * // Successful response
 * const success: ApiResponse<Agent> = {
 *   success: true,
 *   data: agent,
 * };
 *
 * // Error response
 * const error: ApiResponse<never> = {
 *   success: false,
 *   error: "Agent not found",
 * };
 * ```
 */
export interface ApiResponse<T> {
  /** Whether the request was processed successfully. */
  success: boolean;

  /** The response payload, present when `success` is `true`. */
  data?: T;

  /** Error message, present when `success` is `false`. */
  error?: string;
}

/**
 * Paginated list response for collection endpoints.
 *
 * @typeParam T - The type of items in the list.
 *
 * @example
 * ```typescript
 * const list: PaginatedResponse<Agent> = {
 *   items: [agent1, agent2],
 *   total: 25,
 *   page: 1,
 *   pageSize: 10,
 * };
 * ```
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page. */
  items: T[];

  /** Total number of items across all pages. */
  total: number;

  /** Current page number (1-indexed). */
  page: number;

  /** Number of items per page. */
  pageSize: number;
}
