/**
 * API route handlers for the `/api/agents` collection endpoint.
 *
 * Supports listing all agents (GET) and creating new agents (POST).
 *
 * @module app/api/agents/route
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllAgents, createAgent } from "@/lib/agents";
import {
  ApiResponse,
  Agent,
  CreateAgentRequest,
  PaginatedResponse,
} from "@/types/agent";

/**
 * Handles GET requests to list all agents.
 *
 * Supports optional pagination via `page` and `pageSize` query parameters.
 * Returns agents sorted by creation date (newest first).
 *
 * @param request - The incoming {@link NextRequest} object.
 * @returns A {@link NextResponse} containing a paginated list of agents.
 *
 * @example
 * ```
 * GET /api/agents?page=1&pageSize=10
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "items": [...],
 *     "total": 25,
 *     "page": 1,
 *     "pageSize": 10
 *   }
 * }
 * ```
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResponse<Agent>>>> {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10))
    );

    const allAgents = getAllAgents();
    const start = (page - 1) * pageSize;
    const items = allAgents.slice(start, start + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: allAgents.length,
        page,
        pageSize,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new agent.
 *
 * Validates the request body and creates an agent with the provided
 * configuration. The `name` field is required; all other fields are optional
 * and receive sensible defaults.
 *
 * @param request - The incoming {@link NextRequest} containing a JSON body.
 * @returns A {@link NextResponse} containing the newly created agent.
 *
 * @example
 * ```
 * POST /api/agents
 * Content-Type: application/json
 *
 * {
 *   "name": "Code Reviewer",
 *   "description": "Reviews pull requests for best practices",
 *   "capabilities": ["text-generation", "code-execution"]
 * }
 *
 * Response (201):
 * {
 *   "success": true,
 *   "data": { "id": "agent_k7f2m9x1", "name": "Code Reviewer", ... }
 * }
 * ```
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Agent>>> {
  try {
    const body: CreateAgentRequest = await request.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Field 'name' is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (body.capabilities) {
      const validCapabilities = [
        "text-generation",
        "code-execution",
        "image-analysis",
        "data-retrieval",
        "tool-use",
      ];
      const invalid = body.capabilities.filter(
        (c) => !validCapabilities.includes(c)
      );
      if (invalid.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid capabilities: ${invalid.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    const agent = createAgent(body);

    return NextResponse.json({ success: true, data: agent }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
