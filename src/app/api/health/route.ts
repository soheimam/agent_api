/**
 * API route handler for the `/api/health` endpoint.
 *
 * Provides a simple health check that can be used by load balancers,
 * monitoring systems, and orchestrators to verify service availability.
 *
 * @module app/api/health/route
 */

import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/agent";

/**
 * Health check response payload.
 *
 * @example
 * ```typescript
 * const health: HealthStatus = {
 *   status: "healthy",
 *   version: "1.0.0",
 *   timestamp: "2024-01-15T10:30:00.000Z",
 *   uptime: 3600,
 * };
 * ```
 */
export interface HealthStatus {
  /** Current service health status. */
  status: "healthy" | "degraded" | "unhealthy";

  /** Application version from package.json. */
  version: string;

  /** ISO 8601 timestamp of the health check. */
  timestamp: string;

  /** Server uptime in seconds since process start. */
  uptime: number;
}

/** Timestamp of when the server process started, used to calculate uptime. */
const startTime = Date.now();

/**
 * Handles GET requests to check service health.
 *
 * Returns the current health status, version, timestamp, and uptime.
 * This endpoint does not require authentication.
 *
 * @returns A {@link NextResponse} containing the {@link HealthStatus}.
 *
 * @example
 * ```
 * GET /api/health
 *
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "status": "healthy",
 *     "version": "1.0.0",
 *     "timestamp": "2024-01-15T10:30:00.000Z",
 *     "uptime": 3600
 *   }
 * }
 * ```
 */
export async function GET(): Promise<NextResponse<ApiResponse<HealthStatus>>> {
  const health: HealthStatus = {
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  return NextResponse.json({ success: true, data: health });
}
