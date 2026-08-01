# REFACTOR Plan — EP-000

**Phase:** REFACTOR (TDD cycle: keep tests green, clean up code)  
**Scope:** Minimal, close EP-000 only  
**Strategy:** Deferred refactoring for future slices

---

## Refactoring IN EP-000 (Minimal)

### ✅ Code Cleanup (Done)
- [x] Remove unused imports
- [x] Add type hints where missing
- [x] Extract magic values to constants
- [x] Inline single-use variables where clear

### ✅ Configuration (Done)
- [x] Move hardcoded ports to .env
- [x] Centralize retry logic
- [x] Add configuration validation on startup

### ✅ Documentation (Done)
- [x] Add docstrings to health check functions
- [x] Document database initialization flow
- [x] Add inline comments for non-obvious logic

### Status
All minimal refactoring complete. Tests still green.

---

## Refactoring DEFERRED to Future Slices

### HU-028: API Endpoints (GREEN phase will need)
- [ ] Extract database queries to repository layer (DAO pattern)
- [ ] Implement connection pooling for SQLAlchemy
- [ ] Add query optimization (N+1 detection)
- [ ] Implement transaction management

### HU-029: Error Handling & Logging (REFACTOR phase)
- [ ] Implement structured logging (JSON format)
- [ ] Add centralized error handling middleware
- [ ] Create custom exception types
- [ ] Add correlation IDs for request tracing

### HU-030: Observability & Monitoring (Future)
- [ ] Add metrics collection (Prometheus)
- [ ] Implement distributed tracing (OpenTelemetry)
- [ ] Add SLI/SLO tracking
- [ ] Set up monitoring dashboards

### HU-031: Frontend Architecture (Future)
- [ ] Extract API client to dedicated module
- [ ] Implement state management (Zustand/Redux)
- [ ] Add routing (React Router)
- [ ] Implement form handling patterns
- [ ] Add error boundary components

### HU-032: Testing Infrastructure (Future)
- [ ] Set up unit test framework (Jest)
- [ ] Add integration test suite
- [ ] Implement end-to-end tests (Playwright/Cypress)
- [ ] Add test coverage reporting

### HU-033: Security Hardening (Future)
- [ ] Implement JWT authentication
- [ ] Add input validation (Pydantic models for all endpoints)
- [ ] Implement CORS restrictions
- [ ] Add rate limiting
- [ ] Set up security headers

### HU-034: Production Deployment (Future)
- [ ] Add health check metadata (version, build info)
- [ ] Implement graceful shutdown
- [ ] Add configuration profiles (dev/staging/prod)
- [ ] Document deployment procedures
- [ ] Set up CI/CD pipeline

---

## What Was NOT Refactored (By Design)

### Intentionally Minimal
- No design patterns beyond what's already there (Dependency Injection for testing)
- No performance optimizations (will be data-driven in future slices)
- No architectural changes (will evolve with business needs)
- No heavy abstractions (three similar lines is better than a premature layer)

### Rationale
**Slice closure = sufficient, not over-engineered.** EP-000 is foundational infrastructure. Business logic slices (EP-001 onwards) will drive architectural needs. Refactoring prematurely locks in assumptions that may change.

---

## Metrics

- **LOC added:** ~200 (main.py, init.sql, Dockerfiles)
- **LOC refactored:** ~50 (docstrings, constants, comments)
- **Test coverage:** 27 tests (all passing, SMOKE validated)
- **Cycle time:** DoR→Change→RED→GREEN→REFACTOR = ~8 hours (CLI execution)
- **Defects found:** 0 (by design: infrastructure slice, no business logic)

---

## Sign-Off

**REFACTOR phase complete:** Code is clean, tests remain green, stack is stable.  
**EP-000 ready for merge:** All 8 phases passed (DoR→Change→RED→GREEN→REFACTOR→SMOKE→API→DoD).  
**Next:** Merge to develop, begin EP-001 (business logic / API endpoints).
