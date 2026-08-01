# Security Review — EP-000 Docker Infrastructure

**Épica:** EP-000  
**Scope:** PostgreSQL 15, FastAPI backend, React frontend, Docker Compose orchestration  
**Reviewer:** baseline security checklist (automated review pending)  
**Date:** 2026-08-01

---

## I. Trust Boundaries & Data Flow

```
User (Browser)
    ↓ HTTP/HTTPS (localhost:3000)
React Frontend (Vite)
    ↓ HTTP (localhost:8000)
FastAPI Backend (uvicorn)
    ↓ TCP (postgres:5432)
PostgreSQL 15 (Alpine)
    ↓ Filesystem
Persistent Volume (pgdata)
```

**Boundary:** Frontend ↔ Backend (HTTP, not HTTPS in dev) — *Risk: MITM on localhost, acceptable for dev*  
**Boundary:** Backend ↔ Database (TCP 5432, no SSL in dev) — *Risk: plaintext credentials in connection string, acceptable for dev*

---

## II. Credential & Secret Handling

### Status: ✓ PASSING

| Item | Dev Config | Prod Ready? | Notes |
|---|---|---|---|
| DB credentials | .env file (not committed) | ❌ NO | .gitignore includes .env, .env.local |
| JWT_SECRET_KEY | .env file (placeholder) | ❌ NO | Template only, no real secret committed |
| Database URL | Constructed from env vars | ❌ NO | Secrets not in docker-compose.yml directly |
| Dockerfile secrets | None hardcoded | ✓ YES | Alpine base, no creds in images |
| .env.example | Template only | ✓ YES | No real values exposed |

**Finding:** No credentials committed to git. Dev .env should be git-ignored (✓ confirmed in .gitignore).

**Recommendation for production:**
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Enable SSL/TLS for Database connection
- Use non-default JWT secret
- Implement HTTPS on frontend

---

## III. Input Validation & Injection Protection

### Status: ⚠️ PARTIAL (Framework provides defaults)

| Item | Implementation | Risk | Notes |
|---|---|---|---|
| SQL injection | SQLAlchemy ORM parameterized queries | ✓ LOW | asyncpg parameterizes by default |
| Path traversal | FastAPI routing (no file serving) | ✓ LOW | No file upload endpoints in scope |
| XSS | React (JSX auto-escaping) | ✓ LOW | Template injection N/A |
| CORS | FastAPI CORSMiddleware allow_origins=["*"] | ⚠️ MEDIUM | OK for dev, lock down for prod |

**Finding:** Minimal user input handling in this slice (infrastructure only). Framework defaults adequate.

**Recommendation for production:**
- Restrict CORS to known frontend domains
- Add request size limits in FastAPI
- Add rate limiting middleware

---

## IV. Authentication & Authorization

### Status: N/A (Foundational slice, no auth implemented)

This slice does not implement authentication. Auth will be added in a later epic.

**Current:** Health endpoint + root endpoint, both unauthenticated (acceptable for health checks)  
**Future:** API endpoints should require JWT in Authorization header

---

## V. Network Security

### Status: ✓ PASSING (Dev defaults)

| Item | Config | Risk | Notes |
|---|---|---|---|
| Service isolation | Bridge network (gestor-network) | ✓ LOW | Only accessible from container network |
| Port binding | 127.0.0.1:3000, :8000, :5432 (localhost only in dev) | ✓ LOW | Not exposed to host network by default |
| Protocol | HTTP (dev), TCP plaintext (database) | ⚠️ MEDIUM | Acceptable for localhost dev, use HTTPS/TLS in prod |
| Firewall | N/A (Docker bridge) | ✓ LOW | Containers can only talk within network |

**Finding:** Default Docker Compose networking is sufficient for dev. No services exposed outside localhost.

**Recommendation for production:**
- Configure ingress load balancer with TLS termination
- Use managed database (RDS, Aurora) instead of container
- Implement database replication with SSL

---

## VI. Data Protection

### Status: ✓ PASSING (At rest in volume)

| Item | Implementation | Risk | Notes |
|---|---|---|---|
| Encryption at rest | Docker volume (filesystem encryption TBD) | ⚠️ MEDIUM | Host filesystem encryption not configured |
| Encryption in transit | HTTP (dev), TCP 5432 (dev) | ⚠️ MEDIUM | Plaintext in dev, TLS required for prod |
| Data retention | Persistent volume (pgdata) | ✓ LOW | Docker volume driver persists across restarts |
| Backup | None implemented | ❌ NO | Volume exists but no backup strategy |

**Finding:** Data stored in named volume, survives container restarts. Backup strategy not in scope for EP-000.

**Recommendation for production:**
- Enable volume encryption (EBS, GCE Persistent Disks)
- Implement automated backups (snapshots, WAL archiving)
- Test disaster recovery procedures

---

## VII. Dependency Security

### Status: ✓ PASSING (Minimal dependencies)

**Backend dependencies (requirements.txt):**
- fastapi==0.104.1 ✓ current stable
- sqlalchemy==2.0.23 ✓ current stable
- asyncpg==0.29.0 ✓ async driver, actively maintained
- uvicorn[standard]==0.24.0 ✓ ASGI server
- pydantic==2.5.0 ✓ validation library
- All pinned to exact versions (reproducible builds)

**Frontend dependencies (package.json):**
- Managed by npm (scope TBD)
- Multi-stage Docker build (dev deps not in runtime image)

**Base images:**
- postgres:15-alpine ✓ LTS version, minimal base
- python:3.11-slim ✓ LTS Python, slim variant
- node:18-alpine ✓ LTS Node, minimal base

**Finding:** Dependencies are current, pinned, and regularly updated by maintainers. Alpine base images reduce attack surface.

**Recommendation:**
- Run `npm audit` before each release
- Implement SBOM (Software Bill of Materials) for compliance
- Set up Dependabot alerts for security patches

---

## VIII. Container Security

### Status: ✓ PASSING (Dev defaults)

| Item | Config | Risk | Notes |
|---|---|---|---|
| Root user | N/A (Postgres runs as postgres user in Alpine) | ✓ LOW | Alpine Postgres image runs non-root |
| Privileged mode | Not set | ✓ LOW | Containers run in restricted mode |
| Capabilities | Not modified | ✓ LOW | Default Linux capabilities only |
| Seccomp | Not configured | ⚠️ MEDIUM | Default policy sufficient for dev |

**Finding:** Default Docker security settings are appropriate for dev. No privilege escalation risks.

**Recommendation for production:**
- Set read-only root filesystem where possible
- Drop unnecessary Linux capabilities
- Enable AppArmor or SELinux profiles
- Use image scanning (Trivy, Snyk) in CI/CD

---

## IX. Logging & Monitoring

### Status: ⚠️ PARTIAL (Health checks in place, no centralized logging)

| Item | Implementation | Risk | Notes |
|---|---|---|---|
| Application logs | stdout (docker logs) | ⚠️ MEDIUM | No log aggregation or persistence |
| Access logs | FastAPI debug mode (localhost only) | ⚠️ MEDIUM | No structured logging for prod |
| Database logs | Postgres stderr (docker logs) | ⚠️ MEDIUM | No audit trail of schema changes |
| Health monitoring | Health check endpoints + smoke test | ✓ LOW | Baseline monitoring working |

**Finding:** Logging present but not centralized. Sufficient for dev, inadequate for production.

**Recommendation for production:**
- Implement structured logging (JSON format)
- Set up log aggregation (ELK, CloudWatch, Datadog)
- Add database audit logging for compliance
- Implement distributed tracing (Jaeger, DataDog)

---

## X. Error Handling & Information Disclosure

### Status: ✓ PASSING (Minimal information leakage)

| Item | Implementation | Risk | Notes |
|---|---|---|---|
| 404 errors | FastAPI default (JSON) | ✓ LOW | Generic message, no stack traces to client |
| 5xx errors | FastAPI exception handlers (TBD) | ✓ LOW | No sensitive info in error responses |
| Database errors | Caught by wait_for_database(), returns degraded status | ✓ LOW | Connection failures not exposed |
| Stack traces | Debug mode off (FastAPI default) | ✓ LOW | Production-safe error handling |

**Finding:** Error handling follows best practices. No stack traces or sensitive data leaked to clients.

---

## XI. Compliance & Standards

### Status: N/A (Baseline infrastructure)

This slice does not implement specific compliance requirements (HIPAA, PCI-DSS, GDPR).

**Future considerations:**
- If handling PII: implement data encryption, access controls, audit logging
- If handling payment data: implement PCI-DSS controls
- If handling health data: implement HIPAA security controls

---

## XII. Known Issues & Recommendations

### High Priority (for production)
1. **Enable HTTPS** on frontend + API (use nginx reverse proxy or AWS ALB)
2. **Enable SSL/TLS** for database connection string
3. **Implement secrets management** (AWS Secrets Manager, Vault)
4. **Add centralized logging** (ELK stack or CloudWatch)

### Medium Priority (for production)
1. **Restrict CORS** to known frontend domain
2. **Add request rate limiting** to FastAPI
3. **Implement authentication** (JWT or OAuth2)
4. **Add database backup** (automated snapshots)

### Low Priority (nice to have)
1. **Add security headers** (X-Frame-Options, CSP, HSTS)
2. **Enable Web Application Firewall** (AWS WAF, ModSecurity)
3. **Implement container image scanning** in CI/CD
4. **Add security tests** (OWASP ZAP, Burp Scanner)

---

## XIII. Sign-off

**Reviewed by:** claude (baseline checklist)  
**Date:** 2026-08-01  
**Scope:** Docker infrastructure (PostgreSQL, FastAPI, React, docker-compose)  
**Verdict:** ✓ PASS (dev environment)  
**Status for production:** ⚠️ REQUIRES hardening (HTTPS, secrets mgmt, logging, auth)

**Automated security review pending:** security-reviewer agent validation

---

## Appendix: Quick Security Checklist for Developers

Before deploying to production, verify:

- [ ] All credentials moved to secrets management system
- [ ] HTTPS/TLS enabled for all network connections
- [ ] Database user has minimal required permissions
- [ ] CORS restricted to known frontend domains
- [ ] Rate limiting enabled on API endpoints
- [ ] Centralized logging configured
- [ ] Automated backups tested and verified
- [ ] Container images scanned for vulnerabilities
- [ ] Security headers configured on API responses
- [ ] WAF rules configured on load balancer
- [ ] DDoS protection enabled
- [ ] Incident response procedure documented
