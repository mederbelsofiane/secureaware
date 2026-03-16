# Security Documentation — SecureAware Platform

This document outlines the security architecture, protections implemented, and areas requiring hardening for production deployment.

## 1. Authentication & Session Security

### Implemented
- **NextAuth.js** with credentials provider and JWT strategy
- **bcryptjs** with 12 rounds for password hashing
- **HTTP-only cookies** for session tokens (NextAuth default)
- **SameSite=Lax** cookie attribute
- **Session expiration** configured (24-hour max age)
- **Secure logout** flow that destroys session
- **Password validation** requiring uppercase, lowercase, number, special character, min 8 chars

### Production Hardening
- [ ] Add rate limiting to login endpoint (e.g., `express-rate-limit` or Cloudflare rate limiting)
- [ ] Implement account lockout after N failed attempts
- [ ] Add CAPTCHA for registration and login forms
- [ ] Enable `Secure` cookie flag (requires HTTPS)
- [ ] Consider switching to database sessions for revocation capability
- [ ] Implement refresh token rotation
- [ ] Add forgot password / reset password flow

## 2. Authorization

### Implemented
- **Server-side role checks** on every API route via `requireAuth()` and `requireRole()`
- **Middleware-based route protection** at `/middleware.ts` for `/dashboard/*` and `/admin/*`
- **IDOR prevention**: All resource access verifies ownership or admin role
- **Quiz visibility enforcement**: Employees only see quizzes assigned to their department or directly to them
- **Admin-only endpoints**: User management, quiz creation/assignment, campaign management, reports
- **No client-side-only security**: All authorization decisions made server-side

### Architecture
```
Client Request → Middleware (route check) → API Route → requireAuth/requireRole → Business Logic
```

### Production Hardening
- [ ] Add attribute-based access control (ABAC) for finer-grained permissions
- [ ] Implement API key authentication for service-to-service calls
- [ ] Add audit logging for all admin actions (structure exists)

## 3. Input Validation

### Implemented
- **Zod schemas** for all form inputs (login, register, contact, profile, quiz creation)
- **Server-side validation** on every API route that accepts input
- **Client-side validation** via react-hook-form with zodResolver
- **Parameterized queries** via Prisma (prevents SQL injection)
- **Type-safe API handlers** with TypeScript
- **sanitizeHtml()** utility for user-generated content

### Production Hardening
- [ ] Add Content-Security-Policy headers
- [ ] Implement request body size limits
- [ ] Add file upload validation if file uploads are added

## 4. CSRF Protection

### Implemented
- **SameSite=Lax cookies** prevent cross-site request forgery for state-changing operations
- **NextAuth CSRF token** included in all auth operations
- **Origin/Referer checking** available via middleware

### Production Hardening
- [ ] Consider SameSite=Strict for highest protection
- [ ] Add custom CSRF tokens for non-auth forms

## 5. API & Backend Security

### Implemented
- **Centralized auth helpers** (`server-auth.ts`) with consistent error responses
- **Minimal error details** returned to clients (no stack traces, internal IDs)
- **Consistent HTTP status codes** (401, 403, 400, 404, 500)
- **No secrets in client bundles** — all sensitive config server-side only
- **Prisma field selection** — password hashes never returned in API responses

### Production Hardening
- [ ] Add rate limiting middleware
- [ ] Implement request logging and monitoring
- [ ] Add WAF (Web Application Firewall)
- [ ] Implement API versioning

## 6. Data Protection

### Implemented
- **Environment variables** for all secrets (DATABASE_URL, NEXTAUTH_SECRET)
- **`.env.example`** with placeholder values (no real secrets committed)
- **Password hashing** with bcryptjs (12 rounds)
- **Selective field returns** — sensitive data excluded from API responses
- **No sensitive data in localStorage** — sessions managed via HTTP-only cookies

### Production Hardening
- [ ] Enable database encryption at rest
- [ ] Implement field-level encryption for PII
- [ ] Add data retention policies
- [ ] Implement GDPR compliance features (data export, deletion)

## 7. Security Headers

### Recommended Next.js Config
Add to `next.config.mjs`:
```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" },
];
```

## 8. Abuse Prevention

### Implemented
- **Quiz submission validation**: Answers validated server-side, scores calculated server-side
- **No client-provided scores accepted**: All scoring done on the backend
- **Role tampering prevention**: Roles verified from session, not request body
- **Mass assignment protection**: Prisma select/update only whitelisted fields
- **Safe pagination**: Page size limits enforced server-side
- **Department-based quiz visibility**: Enforced at query level

### Production Hardening
- [ ] Add rate limiting to quiz submissions
- [ ] Implement anomaly detection for suspicious activity patterns
- [ ] Add IP-based throttling

## 9. Dependency Security

### Recommendations
- Run `npm audit` regularly
- Use Dependabot or Snyk for automated vulnerability scanning
- Pin dependency versions in production
- Review and update dependencies monthly

## 10. Deployment Security

### Checklist
- [ ] Use HTTPS everywhere
- [ ] Enable security headers
- [ ] Use non-root containers
- [ ] Rotate NEXTAUTH_SECRET and database credentials
- [ ] Remove demo seed accounts
- [ ] Enable database connection pooling with SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable access logging
- [ ] Implement backup strategy
