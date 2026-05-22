# npm Supply Chain Security Checklist

A practical checklist for securing your npm/pnpm project against supply chain attacks. Based on real incidents including the TanStack Mini Shai-Hulud campaign (May 2026).

---

## Lockfiles

- [ ] Lockfile exists (`package-lock.json` or `pnpm-lock.yaml`)
- [ ] Lockfile is committed to git
- [ ] CI installs with `--frozen-lockfile` (pnpm) or `ci` (npm) — never `install`
- [ ] Lockfile diffs are reviewed on PRs (unexpected new deps = red flag)

## Dependency Pinning

- [ ] All production deps use exact versions (`1.2.3`, not `^1.2.3`)
- [ ] No `*` or `latest` version ranges anywhere
- [ ] devDependencies can use ranges but production deps should not
- [ ] Run `pnpm outdated` or `npm outdated` periodically to update intentionally

## Install Scripts

- [ ] Root `.npmrc` has `ignore-scripts=true`
- [ ] Per-package `.npmrc` in each deployed sub-package also has `ignore-scripts=true`
- [ ] Packages that legitimately need install scripts (e.g. `sharp`, `bcrypt`) are explicitly allowed
- [ ] CI environment sets `npm_config_ignore_scripts=true` as env var

## Auditing

- [ ] `pnpm audit --audit-level=high` (or `npm audit`) runs in CI for every production package
- [ ] Audit failures block the build
- [ ] Monthly manual review of `pnpm audit` output for new advisories
- [ ] Consider `socket.dev` or `snyk` for deeper behavioral analysis

## GitHub Actions / CI

- [ ] All `uses:` actions pinned by full commit SHA, not tag (`actions/checkout@<sha>` not `@v4`)
- [ ] `pull_request_target` is NOT used (or if used, does not check out PR code)
- [ ] OIDC token permissions are scoped to specific branches and workflows
- [ ] Secrets are not exposed to PR workflows from forks
- [ ] GitHub Actions cache is not trusted for security-sensitive data

## Publishing (if you publish packages)

- [ ] 2FA enabled on npm account
- [ ] `npm_config_provenance=true` for SLSA provenance (but remember: provenance alone is not enough)
- [ ] Publish from CI only, not local machines
- [ ] Use `--dry-run` before every publish to inspect tarball contents
- [ ] Never publish `.env`, credentials, or private keys (check `files` field in package.json)

## Release Age / Cooldowns

- [ ] Don't install packages published < 72 hours ago in production
- [ ] Set `minReleaseAge` if your registry supports it
- [ ] Watch for typosquatting — verify package names letter by letter
- [ ] Prefer packages with > 1 maintainer and active commit history

## Postinstall / Lifecycle Scripts

- [ ] Grep all `node_modules/*/package.json` for `preinstall`, `install`, `postinstall` scripts
- [ ] Review any that exist — legitimate ones include `sharp`, `esbuild`, `bcrypt`
- [ ] Block unknown install scripts with `ignore-scripts=true` + explicit allows

## Monitoring

- [ ] Subscribe to security advisories for your top 10 deps
- [ ] `dependabot` or `renovate` configured for automated security PRs
- [ ] Review `npm ls --all` periodically for unexpected transitive deps
- [ ] pnpm's strict `node_modules` prevents phantom dependency access — prefer pnpm over npm for this reason

## Incident Response

If you suspect a compromised dependency:

1. **Do NOT revoke tokens first** — some malware has dead-man's switches triggered by revocation
2. Check for persistence files: `.claude/settings.json`, `.vscode/tasks.json`, `systemd` services, `LaunchAgent` plists
3. Remove persistence mechanisms
4. Disconnect from network
5. Then rotate: npm tokens, GitHub PATs, AWS/GCP keys, SSH keys
6. Audit git history for unauthorized commits
7. Re-install from clean lockfile on a clean machine

## Quick Wins (do these first)

```bash
# 1. Add ignore-scripts to root
echo "ignore-scripts=true" >> .npmrc

# 2. Pin a GitHub Action by SHA (example)
# Before: uses: actions/checkout@v4
# After:  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

# 3. Audit now
pnpm audit --audit-level=high

# 4. Find caret ranges in package.json
grep -r '"\^' package.json */package.json
```

---

## Why pnpm Over npm (security-specific)

| Feature | pnpm | npm |
|---------|------|-----|
| Phantom dependencies | Blocked (strict node_modules) | Allowed (flat hoisting) |
| Content-addressable store | Yes (tamper-resistant cache) | No |
| Same registry | npmjs.com | npmjs.com |
| Same supply chain risk | Yes | Yes |
| Install scripts | Same risk | Same risk |

pnpm is stricter at the filesystem level, but both pull from the same registry. The supply chain risk is identical — the defenses above apply to both.

---

*Based on the TanStack "Mini Shai-Hulud" attack (May 2026) and general npm security best practices.*
