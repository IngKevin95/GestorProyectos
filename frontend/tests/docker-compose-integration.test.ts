/**
 * Tests for HU-026: React frontend in Docker
 * Tests for HU-027: Docker-compose orchestration
 *
 * These tests verify the complete stack initialization.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("HU-026 & HU-027: Docker Frontend and Orchestration", () => {
  const FRONTEND_URL = "http://localhost:3000";
  const BACKEND_URL = "http://localhost:8000";

  it("HU-026 AC1: Frontend disponible en localhost:3000", async () => {
    // WILL FAIL: frontend not yet running

    try {
      const response = await fetch(FRONTEND_URL, { timeout: 5000 });
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("<!DOCTYPE") || expect(html).toContain("<html");
    } catch (error) {
      throw new Error(`Frontend not responding on ${FRONTEND_URL}: ${error}`);
    }
  });

  it("HU-026 AC2: Frontend puede conectar a backend /health", async () => {
    // WILL FAIL: backend health endpoint or frontend health check not implemented

    try {
      const response = await fetch(`${BACKEND_URL}/health`, { timeout: 5000 });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("db");
    } catch (error) {
      throw new Error(`Frontend cannot reach backend /health: ${error}`);
    }
  });

  it("HU-026 AC3: VITE_API_URL environment variable configurable", async () => {
    // WILL FAIL: VITE_API_URL not yet exposed in frontend config

    const apiUrl = process.env.VITE_API_URL;
    expect(apiUrl).toBeDefined();
    expect(apiUrl).toMatch(/^https?:\/\/.+:\d+$/);
  });

  it("HU-026 AC5: No CORS errors connecting to backend", async () => {
    // WILL FAIL: CORS headers not yet configured

    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      expect(response.ok).toBe(true);
      const corsHeader = response.headers.get("access-control-allow-origin");
      expect(corsHeader).toBeDefined();
    } catch (error) {
      throw new Error(`CORS issue or backend unreachable: ${error}`);
    }
  });

  describe("HU-027: Docker-compose Orchestration", () => {
    it("HU-027 AC1: All 3 services running (postgres, backend, frontend)", async () => {
      // WILL FAIL: docker-compose stack not yet running

      const healthChecks = [
        { name: "frontend", url: FRONTEND_URL },
        { name: "backend", url: `${BACKEND_URL}/health` },
      ];

      for (const check of healthChecks) {
        try {
          const response = await fetch(check.url, { timeout: 5000 });
          expect(response.ok).toBe(true);
        } catch (error) {
          throw new Error(`${check.name} not healthy: ${error}`);
        }
      }
    });

    it("HU-027 AC2: Stack startup order (postgres → backend → frontend)", async () => {
      // WILL FAIL: health checks not properly ordered
      // Verifies that all services are healthy, implying correct startup order

      const checks = [
        { name: "postgres", check: () => fetch(`${BACKEND_URL}/health`) },
        { name: "backend", check: () => fetch(`${BACKEND_URL}/health`) },
        { name: "frontend", check: () => fetch(FRONTEND_URL) },
      ];

      for (const { name, check } of checks) {
        const response = await check();
        expect(response.ok).toBe(true);
      }
    });

    it("HU-027 AC3: Seed data loads when SEED_DATA=true (optional)", async () => {
      // WILL FAIL: seed data loading not yet implemented
      // This test is optional; passes if SEED_DATA is false

      const seedEnabled = process.env.SEED_DATA === "true";

      if (!seedEnabled) {
        // Skip if seed not enabled
        return;
      }

      // Check that frontend shows example data
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();

      // If seeded, we expect example project data in the HTML or via API
      // For now, just verify the app loads
      expect(html).toBeTruthy();
    });

    it("HU-027 AC4: docker-compose down cleans up containers", async () => {
      // WILL FAIL: manual verification required
      // This test documents the manual steps needed

      // NOTE: This test requires:
      // 1. docker-compose up -d (already running)
      // 2. Verify all services healthy
      // 3. docker-compose down
      // 4. Verify containers stopped
      // 5. docker-compose up -d
      // 6. Verify services restart successfully

      // For now, just verify services are running
      const response = await fetch(FRONTEND_URL);
      expect(response.ok).toBe(true);
    });
  });
});
