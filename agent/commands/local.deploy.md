# Command: deploy

> **🤖 Agent Directive**: If you are reading this file, the command `@local.deploy` has been invoked. Follow the steps below to execute this command.

**Namespace**: local
**Version**: 1.0.0
**Created**: 2026-02-18
**Last Updated**: 2026-02-18
**Status**: Active

---

**Purpose**: Build and deploy the brave-search-mcp-server to Google Cloud Run
**Category**: Deployment
**Frequency**: As Needed

---

## What This Command Does

This command automates the deployment process for the brave-search-mcp-server to Google Cloud Run. It builds the project, commits any changes, and triggers a Cloud Build deployment using the project's `cloudbuild.yaml` configuration.

Use this command when you need to deploy updates to production. The command ensures you're deploying the latest code and creates a traceable deployment linked to a specific git commit SHA.

This is a local deployment workflow that requires Google Cloud SDK (`gcloud`) to be installed and configured with appropriate permissions for the target project.

---

## Prerequisites

- [ ] Google Cloud SDK (`gcloud`) installed and configured
- [ ] Authenticated with Google Cloud (`gcloud auth login` completed)
- [ ] Project set to correct GCP project (`gcloud config set project PROJECT_ID`)
- [ ] Cloud Build API enabled in the GCP project
- [ ] Cloud Run API enabled in the GCP project
- [ ] Appropriate IAM permissions (Cloud Build Editor, Cloud Run Admin)
- [ ] Git repository initialized with clean working directory
- [ ] `cloudbuild.yaml` exists in project root
- [ ] `Dockerfile` exists in project root
- [ ] Platform service token configured in Google Secret Manager as `brave-search-platform-service-token`
- [ ] Note: Brave API key is NOT configured in this project - it's passed by the tenant platform (agentbase.me)

---

## Steps

### 1. Verify Build Locally

Ensure the project builds successfully before deploying.

**Actions**:
- Run `npm install` to ensure dependencies are up to date
- Run `npm run build` to compile the project
- Check for any compilation errors or warnings
- Review build output in `dist/` directory
- Optionally test with Docker: `docker build -t brave-search-mcp-server:test .`

**Expected Outcome**: Project builds without errors, `dist/` directory contains compiled JavaScript

**Example**:
```bash
npm install
npm run build
# Optional: Test Docker build
docker build -t brave-search-mcp-server:test .
```

### 2. Commit Changes

Commit any pending changes to git repository.

**Actions**:
- Review changes with `git status`
- Stage relevant files
- Create commit with descriptive message
- Push commit to remote repository

**Expected Outcome**: All changes committed to git with clear commit message

**Example**:
```bash
git status
git add .
git commit -m "feat: add new feature"
git push origin main
```

### 3. Get Current Git SHA

Retrieve the short commit SHA for the deployment tag.

**Actions**:
- Run `git rev-parse --short HEAD` to get short SHA
- Store the SHA value for use in deployment
- Verify SHA matches the latest commit

**Expected Outcome**: Short commit SHA obtained (e.g., `226bc99`)

**Example**:
```bash
SHA=$(git rev-parse --short HEAD)
echo "Deploying commit: $SHA"
```

### 4. Trigger Cloud Build Deployment

Submit the build to Google Cloud Build with the commit SHA.

**Actions**:
- Run `gcloud builds submit` with `cloudbuild.yaml`
- Pass commit SHA as substitution variable
- Monitor build progress in console output
- Wait for build to complete successfully
- Verify Cloud Run service updated

**Expected Outcome**: Cloud Build completes successfully, new revision deployed to Cloud Run

**Example**:
```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=COMMIT_SHA=$(git rev-parse --short HEAD)
```

### 5. Verify Deployment

Confirm the deployment is successful and operational.

**Actions**:
- Check Cloud Run service status
- Test the MCP server endpoint
- Verify new revision is serving traffic
- Check Cloud Run logs for startup errors
- Test a sample search request (optional)

**Expected Outcome**: Service is running, endpoint responds, no errors in logs

**Example**:
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe brave-search-mcp-server \
  --region=us-central1 \
  --format='value(status.url)')

echo "Service URL: $SERVICE_URL"

# Check Cloud Run service status
gcloud run services describe brave-search-mcp-server --region=us-central1

# Check logs
gcloud run services logs read brave-search-mcp-server --region=us-central1 --limit=50
```

### 6. Update Progress Tracking

Document the deployment in progress.yaml.

**Actions**:
- Update `agent/progress.yaml` with deployment details
- Add entry to `recent_work` section
- Note commit SHA and timestamp
- Document any issues or observations

**Expected Outcome**: Progress tracking reflects latest deployment

---

## Verification

- [ ] Project builds successfully (`npm run build` completes)
- [ ] Changes committed to git repository
- [ ] Cloud Build job completed successfully
- [ ] Docker image pushed to Google Container Registry
- [ ] New Cloud Run revision deployed
- [ ] Service endpoint responds successfully
- [ ] No errors in Cloud Run logs
- [ ] `agent/progress.yaml` updated with deployment info

---

## Expected Output

### Files Modified
- `agent/progress.yaml` - Added deployment entry to recent_work

### Console Output
```
🔨 Building project...
✓ Build completed successfully

📝 Committing changes...
✓ Committed: feat: add new feature
✓ Pushed to origin/main

🚀 Deploying to Cloud Run...
✓ Build ID: a1b2c3d4-5678-90ef-ghij-klmnopqrstuv
✓ Commit SHA: 226bc99
✓ Building Docker image...
✓ Pushing to GCR...
✓ Deploying to Cloud Run...
✓ Build time: 120s
✓ Deployment successful

🏥 Verifying deployment...
✓ Service status: READY
✓ Revision: brave-search-mcp-server-00042-226bc99
✓ URL: https://brave-search-mcp-server-xxxxx-uc.a.run.app

✅ Deployment complete!
```

### Status Update
- Recent work entry added documenting the deployment
- Build ID and duration recorded
- Commit SHA documented

---

## Examples

### Example 1: Routine Deployment After Code Changes

**Context**: You've made changes to the code and want to deploy to production.

**Invocation**: `@local.deploy`

**Result**: Code built successfully, changes committed with SHA `226bc99`, Cloud Build triggered, Docker image built and pushed, deployment completed in 120 seconds, service operational.

### Example 2: Deployment After Dependency Update

**Context**: Updated dependencies (like removing Zod) and need to deploy the changes.

**Invocation**: `@local.deploy`

**Result**: New version (3.0.0) built and deployed, all verification steps passed, service operational.

### Example 3: Emergency Hotfix Deployment

**Context**: Critical bug fix needs to be deployed immediately.

**Invocation**: `@local.deploy`

**Result**: Hotfix deployed within 3 minutes, service operational, issue resolved.

---

## Related Commands

- [`@acp.proceed`](acp.proceed.md) - Use after deployment to continue with next task
- [`@acp.status`](acp.status.md) - Use to check project status before deployment
- [`@git.commit`](git.commit.md) - Use to create proper version-aware commits before deploying

---

## Troubleshooting

### Issue 1: Cloud Build authentication error

**Symptom**: Error message "ERROR: (gcloud.builds.submit) User does not have permission to access project"

**Cause**: Not authenticated with Google Cloud or wrong project selected

**Solution**: Run `gcloud auth login` to authenticate, then `gcloud config set project PROJECT_ID` to set the correct project. Verify with `gcloud config list`.

### Issue 2: Build fails with npm install error

**Symptom**: npm install fails during Cloud Build with dependency resolution error

**Cause**: Dependency version conflict or network issue

**Solution**: Verify `package-lock.json` is committed. Test build locally with `docker build .`. Check Cloud Build logs for specific error. Ensure all dependencies are available in npm registry.

### Issue 3: Deployment succeeds but service fails to start

**Symptom**: Cloud Build completes but Cloud Run service shows errors

**Cause**: Missing environment variables, incorrect Dockerfile configuration, or application startup error

**Solution**: Check Cloud Run logs with `gcloud run services logs read brave-search-mcp-server --region=us-central1 --limit=50`. Verify `BRAVE_API_KEY` secret is configured in Secret Manager. Check Dockerfile ENTRYPOINT is correct.

### Issue 4: Secret not found error

**Symptom**: Deployment fails with "Secret 'brave-search-platform-service-token' not found"

**Cause**: Platform service token not configured in Google Secret Manager

**Solution**: Create the secret in Secret Manager:
```bash
# Create platform service token secret (for agentbase.me authentication)
# Generate a secure random token: openssl rand -hex 32
echo -n "YOUR_PLATFORM_SERVICE_TOKEN" | gcloud secrets create brave-search-platform-service-token --data-file=-
```

**Note**: The Brave API key is NOT stored in this project. It's passed by the tenant platform (agentbase.me) when connecting to this MCP server. The platform stores the API key in its MCP server configuration database.

### Issue 5: Docker build fails

**Symptom**: Cloud Build fails during Docker image build step

**Cause**: Dockerfile error, missing files, or build context issue

**Solution**: Test Docker build locally: `docker build -t test .`. Check Dockerfile syntax. Ensure all required files are present and not in `.dockerignore`. Review Cloud Build logs for specific error.

---

## Security Considerations

### File Access
- **Reads**: `package.json`, `package-lock.json`, `cloudbuild.yaml`, `Dockerfile`, all source files in `src/`
- **Writes**: `agent/progress.yaml`
- **Executes**: `npm` commands, `git` commands, `gcloud` commands, `docker` commands

### Network Access
- **APIs**: npm registry (registry.npmjs.org), Google Cloud Build API, Google Cloud Run API, Google Container Registry
- **Repositories**: Git remote repository

### Sensitive Data
- **Secrets**: Never reads `.env` files or credential files. Brave API key is managed by Google Secret Manager and injected by Cloud Run at runtime.
- **Credentials**: Uses gcloud authentication. Does not handle application credentials directly.

**Important**: This command does not access secrets directly. The only secret stored in this project is:
- `brave-search-platform-service-token`: Token for agentbase.me platform authentication

The Brave API key is NOT stored here - it's passed by the tenant platform (agentbase.me) when connecting to this MCP server. Cloud Run injects the platform service token as an environment variable at runtime.

---

## Notes

- This command requires active Google Cloud authentication and appropriate IAM permissions
- Build typically takes 90-150 seconds depending on dependency cache and Docker layers
- The deployment uses the commit SHA from `git rev-parse --short HEAD` as the Docker image tag
- Cloud Run automatically routes traffic to the new revision after successful deployment
- Old revisions are retained for rollback capability (configure retention in Cloud Run settings)
- Consider running `@acp.status` before deployment to ensure project is in a good state
- Always verify the service after deployment before considering it complete
- If deployment fails, Cloud Run will continue serving the previous revision
- Build logs are available in Google Cloud Console under Cloud Build history
- This is a local deployment workflow; consider setting up CI/CD with GitHub Actions for automated deployments
- The Dockerfile uses multi-stage builds for smaller image size and better security
- The service runs as non-root user (`node`) for security

---

**Namespace**: local
**Command**: deploy
**Version**: 1.0.0
**Created**: 2026-02-18
**Last Updated**: 2026-02-18
**Status**: Active
**Compatibility**: ACP 1.4.3+
**Author**: brave-search-mcp-server project
