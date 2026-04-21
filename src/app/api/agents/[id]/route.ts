/**
 * API route handlers for the `/api/agents/[id]` resource endpoint.
 *
 * Supports retrieving (GET), updating (PUT), and deleting (DELETE)
 * individual agent records by their unique identifier.
 *
 * @module app/api/agents/[id]/route
 */

import { NextRequest, NextResponse } from "next/server";
import { getAgentById, updateAgent, deleteAgent } from "@/lib/agents";
import { ApiResponse, Agent, UpdateAgentRequest } from "@/types/agent";

/** Route parameters containing the agent ID from the URL path. */
interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Handles GET requests to retrieve a single agent by ID.
 *
 * @param _request - The incoming {@link NextRequest} (unused).
 * @param context - Route context containing the `id` path parameter.
 * @returns A {@link NextResponse} with the agent data or a 404 error.
 *
 * @example
 * ```
 * GET /api/agents/agent_k7f2m9x1
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": { "id": "agent_k7f2m9x1", "name": "Code Reviewer", ... }
 * }
 *
 * Response (404):
 * {
 *   "success": false,
 *   "error": "Agent not found"
 * }
 * ```
 */
export async function GET(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse<Agent>>> {
  try {
    const { id } = await context.params;
    const agent = getAgentById(id);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
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
 * Handles PUT requests to update an existing agent.
 *
 * Accepts a partial update payload — only the provided fields will be
 * modified. The `updatedAt` timestamp is automatically refreshed.
 *
 * @param request - The incoming {@link NextRequest} containing the update JSON body.
 * @param context - Route context containing the `id` path parameter.
 * @returns A {@link NextResponse} with the updated agent or a 404 error.
 *
 * @example
 * ```
 * PUT /api/agents/agent_k7f2m9x1
 * Content-Type: application/json
 *
 * {
 *   "status": "active",
 *   "config": { "temperature": 0.5 }
 * }
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": { "id": "agent_k7f2m9x1", "status": "active", ... }
 * }
 * ```
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse<Agent>>> {
  try {
    const { id } = await context.params;
    const body: UpdateAgentRequest = await request.json();

    if (body.status) {
      const validStatuses = ["active", "inactive", "error", "provisioning"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
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

    const agent = updateAgent(id, body);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
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
 * Handles DELETE requests to remove an agent by ID.
 *
 * Permanently removes the agent from the store. This action cannot be undone.
 *
 * @param _request - The incoming {@link NextRequest} (unused).
 * @param context - Route context containing the `id` path parameter.
 * @returns A {@link NextResponse} confirming deletion or a 404 error.
 *
 * @example
 * ```
 * DELETE /api/agents/agent_k7f2m9x1
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": { "message": "Agent deleted successfully" }
 * }
 * ```
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const { id } = await context.params;
    const deleted = deleteAgent(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Agent deleted successfully" },
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
