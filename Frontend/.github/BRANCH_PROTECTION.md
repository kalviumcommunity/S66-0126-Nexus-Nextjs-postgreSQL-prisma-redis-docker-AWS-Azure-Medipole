# Branch Protection Rules Configuration

This document outlines the branch protection rules that should be configured for the Medipole repository to ensure code quality and proper collaboration workflows.

## 🛡️ Required Branch Protection Rules

### Main Branch Protection

The `main` branch should have the following protections enabled:

#### 1. **Require Pull Request Reviews**

- ✅ **Require pull request reviews before merging**
- **Required approving reviews**: 1 (minimum)
- **Dismiss stale pull request approvals when new commits are pushed**: Enabled
- **Require review from Code Owners**: Enabled (if CODEOWNERS file exists)

#### 2. **Require Status Checks**

- ✅ **Require status checks to pass before merging**
- **Require branches to be up to date before merging**: Enabled
- **Status checks required**:
  - `lint` (ESLint validation)
  - `type-check` (TypeScript compilation)
  - `format-check` (Prettier formatting)
  - `build` (Next.js build process)
  - `test` (if test suite exists)

#### 3. **Branch Restrictions**

- ✅ **Include administrators**: Enabled
- ✅ **Allow force pushes**: Disabled
- ✅ **Allow deletions**: Disabled
- ✅ **Require linear history**: Enabled

#### 4. **Additional Security Settings**

- ✅ **Require conversation resolution before merging**: Enabled
- ✅ **Require signed commits**: Optional (recommended for production)

## 🎯 Branch Naming Conventions

### Standard Branch Types

```
feature/<feature-name>          # New features
fix/<bug-name>                 # Bug fixes
hotfix/<critical-fix>          # Urgent production fixes
chore/<maintenance-task>       # Maintenance tasks
docs/<documentation-update>    # Documentation changes
refactor/<refactoring-name>    # Code refactoring
test/<test-addition>           # Adding/updating tests
perf/<performance-improvement> # Performance improvements
```

### Examples:

- `feature/user-authentication`
- `fix/login-button-alignment`
- `hotfix/critical-security-patch`
- `chore/update-dependencies`
- `docs/api-documentation`
- `refactor/state-management`
- `test/unit-test-coverage`

### Naming Guidelines:

- Use lowercase letters and hyphens
- Be descriptive but concise
- Use present tense
- Avoid special characters

## 🔄 Workflow Process

### Feature Development Flow

1. **Create Feature Branch**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/new-feature-name
   ```

2. **Development & Commits**
   - Follow conventional commit messages
   - Make small, focused commits
   - Push regularly to remote branch

3. **Code Quality Checks**

   ```bash
   npm run type-check    # TypeScript validation
   npm run lint          # ESLint checks
   npm run format:check  # Prettier formatting
   npm run build         # Build verification
   ```

4. **Create Pull Request**
   - Use the PR template
   - Fill out all required sections
   - Add screenshots/evidence
   - Request review from team members

5. **Review Process**
   - Reviewer follows code review checklist
   - Address all feedback
   - Ensure all checks pass

6. **Merge to Main**
   - All required checks must pass
   - Required approvals obtained
   - PR is merged by reviewer or maintainer

## ⚙️ GitHub Configuration Steps

### Setting Up Branch Protection Rules

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on "Settings" tab
   - Select "Branches" from the left sidebar

2. **Add Branch Protection Rule**
   - Click "Add rule"
   - **Branch name pattern**: `main`
   - Enable the required settings listed above

3. **Configure Required Status Checks**
   - Scroll to "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Add status checks that match your CI workflow names

4. **Save Protection Rule**
   - Review all settings
   - Click "Create" or "Save changes"

## 📊 Monitoring & Compliance

### Regular Audits

- Monthly review of branch protection compliance
- Verify all PRs follow the established workflow
- Check that no direct commits are made to protected branches

### Team Training

- Ensure all team members understand the workflow
- Provide documentation and examples
- Conduct onboarding sessions for new team members

## 🚨 Emergency Procedures

### Hotfix Process

For critical production issues:

1. Create hotfix branch from main:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue-name
   ```

2. Implement fix and test thoroughly

3. Create PR with high priority label

4. Expedited review process (same quality standards)

5. Merge and deploy immediately after approval

### Bypassing Protections (Emergency Only)

- Only repository administrators can bypass
- Requires justification and documentation
- Must follow up with proper PR process

## 📈 Success Metrics

Track these metrics to measure the effectiveness of branch protection:

- ✅ Percentage of PRs with passing checks
- ✅ Average time from PR creation to merge
- ✅ Number of failed merges due to protection rules
- ✅ Code review coverage percentage
- ✅ Reduction in production bugs

---

_This configuration ensures code quality, team collaboration, and prevents accidental breaking changes from reaching production._
