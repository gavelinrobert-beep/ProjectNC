# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline implemented for the SYLON (AEGIS Light) platform using GitHub Actions.

## Overview

The CI/CD pipeline consists of four main workflows that automatically validate code quality, run tests, build artifacts, and scan for security vulnerabilities:

1. **Backend CI** - Tests and validates Python backend
2. **Frontend CI** - Tests and validates React/TypeScript frontend
3. **Docker Build** - Validates Docker images and deployment configuration
4. **Security Scanning** - Periodic security vulnerability scanning

## Workflows

### 1. Backend CI (`backend-ci.yml`)

**Triggers:** Push to any branch, Pull requests

**What it does:**
- Sets up Python 3.11 environment
- Installs dependencies from `backend/requirements.txt`
- Runs PostgreSQL service for database tests
- Executes pytest test suite with coverage reporting
- Enforces minimum 60% test coverage threshold
- Uploads coverage reports to Codecov
- Runs Bandit security scanner for Python code
- Uploads security scan results as artifacts

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string (provided by CI)
- `JWT_SECRET` - Secret key for JWT tokens (provided by CI)
- `CORS_ORIGINS` - Allowed CORS origins (provided by CI)
- `CODECOV_TOKEN` - Token for Codecov integration (optional, from secrets)

**Artifacts Generated:**
- `bandit-security-report` - JSON report of security findings

### 2. Frontend CI (`frontend-ci.yml`)

**Triggers:** Push to any branch, Pull requests

**What it does:**
- Sets up Node.js 20.x environment
- Installs dependencies via npm
- Runs TypeScript type checking (`npm run type-check`)
- Runs ESLint for code quality checks
- Executes unit tests with Vitest
- Builds production bundle to validate deployment readiness
- Uploads build artifacts

**Artifacts Generated:**
- `frontend-build` - Production build output (retained for 7 days)

### 3. Docker Build Validation (`docker-build.yml`)

**Triggers:** Push to master/main branch, Pull requests to master/main

**What it does:**
- Validates `compose.yaml` syntax
- Builds backend Docker image
- Builds frontend Docker image
- Tests docker-compose up scenario
- Verifies service health endpoints
- Scans Docker images for vulnerabilities using Trivy
- Displays service logs for debugging

**Services Tested:**
- Backend API (http://localhost:8000/health)
- Frontend (http://localhost:5173)
- PostgreSQL database

### 4. Security Scanning (`security.yml`)

**Triggers:** 
- Weekly schedule (Mondays at 9:00 AM UTC)
- Manual workflow dispatch
- Push to master/main branch

**What it does:**
- Scans Python dependencies with Safety
- Scans Node.js dependencies with npm audit
- Runs CodeQL SAST analysis for multi-language code security
- Runs Bandit for Python static analysis
- Creates GitHub issues for critical vulnerabilities (if failures detected)

**Artifacts Generated:**
- `python-safety-report` - Python dependency vulnerability report
- `nodejs-audit-report` - Node.js dependency vulnerability report
- `bandit-sast-report` - Python SAST findings

**Automated Issue Creation:**
- Creates issues with label `security`, `automated`, `vulnerability`
- Only creates new issue if no similar open issue exists within last 7 days
- Includes links to workflow run and detailed reports

## Test Infrastructure

### Backend Testing

**Framework:** pytest with pytest-asyncio and pytest-cov

**Configuration:** `backend/pytest.ini`

**Test Location:** `backend/tests/`

**Key Features:**
- Comprehensive fixtures in `conftest.py`:
  - Database connection pooling
  - Test client (sync and async)
  - Authentication fixtures for all user roles (admin, contractor, operator, viewer)
  - Mock data generators for assets, facilities, tasks, inventory, alerts
- Isolated test transactions (automatic rollback)
- Support for both sync and async test cases

**Running Tests Locally:**
```bash
cd backend
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
export JWT_SECRET=test-secret-key
pytest --cov=app --cov-report=term-missing
```

**Current Coverage:** 34% (target: 60%)

### Frontend Testing

**Framework:** Vitest with React Testing Library

**Configuration:** `frontend/vitest.config.ts`

**Test Location:** `frontend/src/__tests__/`

**Key Features:**
- Setup configuration in `setupTests.ts`:
  - Mock Service Worker (MSW) for API mocking
  - Pre-configured mock endpoints for all major API routes
  - Mock browser APIs (matchMedia, IntersectionObserver, geolocation)
  - React Testing Library integration
- ESLint configuration for code quality
- Coverage reporting with v8

**Running Tests Locally:**
```bash
cd frontend
npm test                    # Run tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run with coverage report
```

**Linting:**
```bash
cd frontend
npm run lint                # Check for linting issues
```

## Build Status Badges

The following badges are displayed in the README:

- ![Backend CI](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/backend-ci.yml/badge.svg)
- ![Frontend CI](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/frontend-ci.yml/badge.svg)
- ![Docker Build](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/docker-build.yml/badge.svg)
- ![Security Scanning](https://github.com/gavelinrobert-beep/SYLON/actions/workflows/security.yml/badge.svg)
- ![Codecov](https://codecov.io/gh/gavelinrobert-beep/SYLON/branch/master/graph/badge.svg)

## Branch Protection

To enforce quality standards, configure branch protection rules on main/master branch:

**Recommended Settings:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Required status checks:
  - `test` (Backend CI)
  - `test` (Frontend CI)
  - `docker-build` (Docker Build Validation)
- ✅ Require pull request reviews before merging
- ✅ Dismiss stale pull request approvals when new commits are pushed

## Secrets Configuration

The following GitHub Secrets should be configured in repository settings:

### Optional Secrets
- `CODECOV_TOKEN` - Token for uploading coverage to Codecov.io
  - Get token from https://codecov.io after adding the repository
  - Workflow will continue without error if not configured

### Future Secrets (for deployment)
- `DOCKER_USERNAME` - Docker Hub username (for publishing images)
- `DOCKER_PASSWORD` - Docker Hub password or access token
- `DEPLOY_KEY` - SSH key for deployment to servers

## Continuous Improvement

### Increasing Test Coverage

To improve coverage to meet the 60% threshold:

1. **Backend:**
   - Add tests for route handlers in `backend/app/routes/`
   - Test database operations and models
   - Test authentication and authorization logic
   - Test business logic in service modules

2. **Frontend:**
   - Add component tests for pages and components
   - Test user interactions and state management
   - Test API integration with mocked responses
   - Test form validation and error handling

### Adding More Checks

Consider adding these additional workflows:

1. **Performance Testing** - Load testing with Locust or k6
2. **E2E Testing** - Playwright or Cypress for end-to-end tests
3. **Dependency Updates** - Dependabot or Renovate for automated updates
4. **Code Quality** - SonarCloud integration for detailed code analysis
5. **Deployment** - Automated deployment to staging/production

## Troubleshooting

### Backend Tests Failing

1. Check PostgreSQL service is running in CI
2. Verify `DATABASE_URL` environment variable is set correctly
3. Check for import errors - ensure all app modules are importable
4. Review test logs for specific assertion failures

### Frontend Build Failing

1. Check Node.js version matches (20.x)
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors with `npm run type-check`
4. Review build logs for missing files or configuration issues

### Docker Build Failing

1. Check Dockerfile syntax
2. Verify all required files are present in build context
3. Review docker-compose.yml for service configuration
4. Check service health endpoints are accessible

### Security Scan Issues

1. Review security reports in workflow artifacts
2. Assess severity of vulnerabilities
3. Update dependencies to patched versions
4. Consider adding exceptions for false positives

## Support

For issues with the CI/CD pipeline:
1. Check workflow run logs in GitHub Actions tab
2. Review this documentation
3. Create an issue with the `ci/cd` label
4. Contact the DevOps team

---

**Last Updated:** 2025-11-13  
**Pipeline Version:** 1.0.0
