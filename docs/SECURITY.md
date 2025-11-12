# AEGIS Light - Security Guide

## Overview

AEGIS Light is designed for civilian use with security best practices built in. This guide covers security considerations for deployment and operation.

---

## Authentication & Authorization

### JWT Token Security

**Token Configuration**:
```bash
# Generate a strong secret
openssl rand -hex 32

# Set in .env
JWT_SECRET=your-generated-secret-here
JWT_EXP_MIN=240  # Token expiration (minutes)
```

**Best Practices**:
- Change JWT_SECRET immediately in production
- Use minimum 32-character random secret
- Set appropriate token expiration (4 hours recommended)
- Rotate secrets periodically (quarterly recommended)

### Password Policy

**Default Requirements**:
- Minimum 8 characters
- Change on first login required
- No password reuse

**Recommended Enhancements**:
- Enforce complexity (uppercase, numbers, symbols)
- Implement password history (last 5)
- Enable two-factor authentication (2FA)
- Set password expiration (90 days)

### Role-Based Access Control (RBAC)

**Roles and Permissions**:

1. **Municipality Admin**
   - Full system access
   - User management
   - Configuration changes
   - Data export

2. **Contractor**
   - View assigned assets
   - Update assigned resources
   - Submit reports
   - Limited mission planning

3. **Field Operator**
   - Update asset status
   - Submit field reports
   - View assigned missions
   - No admin access

4. **Viewer**
   - Read-only access
   - View dashboards
   - Export own reports
   - No modifications

**Implementation**:
- Enforce principle of least privilege
- Regular access reviews (quarterly)
- Revoke access immediately on termination
- Audit role assignments

---

## Network Security

### HTTPS/SSL Configuration

**Production Requirements**:
- SSL/TLS certificates required
- Minimum TLS 1.2
- Strong cipher suites only

**Setup with Let's Encrypt**:
```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### CORS Configuration

**Development**:
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Production**:
```bash
# Specific domains only
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**Security**:
- Never use `*` in production
- List only trusted origins
- Include subdomains explicitly
- Validate all origins

### Firewall Rules

**Required Ports**:
- 443 (HTTPS): Public access
- 80 (HTTP): Redirect to HTTPS only

**Blocked Ports**:
- 5432 (PostgreSQL): Internal only
- 8000 (API): Behind reverse proxy only

**UFW Example**:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Database Security

### PostgreSQL Configuration

**Authentication**:
```bash
# Use strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Restrict connections
# In postgresql.conf:
listen_addresses = 'localhost'
```

**Encryption**:
- Enable SSL for connections
- Encrypt sensitive columns
- Use parameterized queries (prevent SQL injection)

**Backups**:
```bash
# Encrypted backup
pg_dump aegis | gpg --encrypt --recipient admin@org.com > backup.sql.gpg

# Automate daily
0 2 * * * /opt/backup-script.sh
```

**Access Control**:
- Separate user for application
- Minimal permissions (no SUPERUSER)
- Connection limits enforced

---

## Application Security

### Environment Variables

**Secure Storage**:
- Never commit `.env` to version control
- Use secrets management (Vault, AWS Secrets Manager)
- Restrict file permissions: `chmod 600 .env`
- Separate configs for dev/staging/prod

### API Security

**Rate Limiting**:
```python
# Implement in backend
from fastapi_limiter import FastAPILimiter

@app.on_event("startup")
async def startup():
    await FastAPILimiter.init(redis_url)
```

**Input Validation**:
- Validate all user inputs
- Sanitize before database storage
- Use Pydantic models for type safety
- Reject malformed requests

**Output Encoding**:
- Escape HTML in responses
- Sanitize user-generated content
- Prevent XSS attacks

### Session Management

**Security Settings**:
```bash
# Session timeout
JWT_EXP_MIN=240  # 4 hours

# Require re-auth for sensitive operations
# Implement in code for:
# - User deletion
# - Permission changes
# - Data export
```

---

## Data Protection

### Sensitive Data

**Classification**:
- **Public**: Dashboard stats
- **Internal**: Asset locations
- **Confidential**: User credentials
- **Restricted**: Audit logs

**Encryption**:
- At rest: Database encryption
- In transit: TLS/HTTPS only
- Backups: Encrypted storage

### Data Retention

**Policies**:
```bash
# Set retention period
DATA_RETENTION_DAYS=90

# Automatic cleanup
# - Archived data: 1 year
# - Audit logs: 2 years
# - Deleted accounts: 30 days
```

### GDPR Compliance

**Requirements**:
- Right to access: Export user data
- Right to deletion: Purge on request
- Data portability: CSV/JSON export
- Consent management: Track permissions

**Implementation**:
- Privacy policy visible
- Cookie consent banner
- Data processing agreement
- DPO contact information

---

## Logging & Monitoring

### Audit Logging

**Events to Log**:
- User login/logout
- Failed authentication attempts
- Permission changes
- Data exports
- Configuration changes
- Asset status updates

**Log Format**:
```json
{
  "timestamp": "2025-01-12T10:30:00Z",
  "user": "admin@org.com",
  "action": "user.create",
  "resource": "user:123",
  "ip": "192.168.1.100",
  "status": "success"
}
```

### Security Monitoring

**Alerts**:
- Multiple failed logins (5 in 15 min)
- Unusual access patterns
- Privilege escalation attempts
- Large data exports
- Configuration changes

**Tools**:
- ELK Stack for log aggregation
- Prometheus for metrics
- Grafana for visualization
- PagerDuty for alerts

---

## Incident Response

### Breach Procedures

**Immediate Actions**:
1. Isolate affected systems
2. Preserve evidence (logs)
3. Notify security team
4. Change all credentials
5. Review access logs

**Communication**:
- Notify affected users (24 hours)
- Report to authorities (if required)
- Document incident
- Post-mortem analysis

### Recovery

**Steps**:
1. Identify vulnerability
2. Apply security patches
3. Restore from clean backup
4. Verify system integrity
5. Monitor for reinfection

---

## Security Checklist

### Pre-Deployment

- [ ] Change default credentials
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS with valid certificate
- [ ] Configure firewall rules
- [ ] Set up database encryption
- [ ] Enable audit logging
- [ ] Configure CORS properly
- [ ] Set up automated backups
- [ ] Test disaster recovery
- [ ] Document security procedures

### Regular Maintenance

- [ ] Review user access (quarterly)
- [ ] Rotate secrets (quarterly)
- [ ] Update dependencies (monthly)
- [ ] Security patches (immediately)
- [ ] Review logs (weekly)
- [ ] Test backups (monthly)
- [ ] Penetration testing (annually)
- [ ] Security training (annually)

---

## Compliance

### Standards

**ISO 27001**: Information security management
**SOC 2**: Service organization controls
**GDPR**: Data protection (EU)
**Local Regulations**: Municipal data handling

### Documentation

Required for compliance:
- Security policies
- Access control procedures
- Incident response plan
- Data protection policy
- Backup and recovery procedures
- Training records

---

## Vulnerability Reporting

**Report Security Issues**:
- Email: security@sylon.com
- PGP Key: Available on website
- Response time: 24 hours
- Bug bounty: Available for verified issues

**Include**:
- Detailed description
- Steps to reproduce
- Impact assessment
- Proof of concept (if safe)

---

## Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **CIS Controls**: https://www.cisecurity.org/controls

---

**Security Contact**: security@sylon.com
**Last Updated**: Q1 2025
**Version**: 1.0.0
