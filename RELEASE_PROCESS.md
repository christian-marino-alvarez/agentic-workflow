# Release Process

The project uses GitHub Actions for automated releases to npm.

### Workflow
1. **Branch Naming**: 
   - Feature/Fix branches should follow Conventional Commits (e.g., `feat/new-thing`, `fix/bug-fix`).
   - Release branches **MUST** start with `ci/publish-` to trigger the publish workflow (e.g., `ci/publish-beta-1.18.0-beta.11`).

2. **Pull Request**:
   - Create a PR from your `ci/publish-*` branch to `develop` (for beta releases) or `main` (for stable releases).
   - Ensure the `package.json` version is updated.

3. **Publishing**:
   - When the PR is **merged**, the `publish.yml` workflow triggers.
   - It validates the package name.
   - It checks if the version is already published.
   - It automatically determines the npm tag:
     - Merges to `develop` -> `beta` tag.
     - Merges to `main` -> `latest` tag.
   - If validations pass, it publishes the package to npm.
### Manual Steps for Release
1. Update version: `npm version prerelease --preid=beta` (or appropriate semver command).
2. Update `CHANGELOG.md`.
3. (Optional) Generate local package: `npm run package`. The `.tgz` file will be moved to `.backups/npm-packages/`.
4. Create a branch: `git checkout -b ci/publish-beta-x.x.x`.
5. Push and create PR.
