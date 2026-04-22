# Auto-docs sync — setup guide

This repo has a GitHub Action that regenerates the TypeDoc documentation every time code is pushed to `main`, then opens a pull request on a separate docs repo with the new output. This doc explains how to set the same flow up for another pair of repos.

---

## If you own both repos

You're the owner of the source repo (where the code lives) AND the docs repo (where generated docs get committed). This is the simpler case.

1. **Create a fine-grained Personal Access Token** at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.
   - Under "Repository access," pick "Only select repositories" and select both the source repo and the docs repo.
   - Under "Repository permissions," set:
     - **Contents**: Read and write
     - **Pull requests**: Read and write
     - **Workflows**: Read and write *(only needed if the workflow file itself will ever be updated via this token — safe to include)*
     - **Metadata**: Read-only *(auto-selected, required)*
   - Generate the token and copy the value immediately — GitHub only shows it once.

2. **Add the token as a secret** in the source repo:
   - Source repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `PAT_TOKEN`
   - Value: the raw token string (e.g. `github_pat_11ABC…`). No quotes, no variables.

3. **Drop the workflow file** into `.github/workflows/update-docs.yml` in the source repo. You can copy the one in this repo and change the docs repo URL on the "Clone docs repo" step and the `--repo` flag on the PR step.

4. **Make sure the docs repo has a `main` branch** that the PR can target. An empty repo with a README is enough to start.

5. **Push a commit** to the source repo's `main`. The workflow kicks off, generates docs, and a PR appears in the docs repo's Pull requests tab.

---

## If the docs repo is owned by someone else (or an org you don't own)

Fine-grained PATs can only be created against repos you own, so you can't directly mint a token that writes to someone else's repo. There are a few ways around this, in rough order of ease:

### Option A — Ask the docs repo owner to add you as a collaborator with write access

Once you're a collaborator:
- You can create a fine-grained PAT on your own account that grants Contents + Pull requests write on *your* source repo AND on the docs repo you're a collaborator on.
- Everything else works the same as the "you own both" flow above.

What to ask the owner for:
> "Can you add me as a collaborator with **Write** access to `<org>/<docs-repo>`? I'm setting up an Action in my API repo that opens docs-update PRs on that repo for you to review and merge."

### Option B — Have the docs repo owner create the token and hand you the value

If they don't want to add you as a collaborator, they can:
1. Create a fine-grained PAT on their account, scoped to the docs repo only, with Contents + Pull requests write.
2. Send you the token value privately (1Password, password manager, encrypted channel — never in chat, email, or a commit).
3. You paste it as the `PAT_TOKEN` secret in your source repo.

What to ask them for:
> "Could you generate a fine-grained PAT scoped to just `<docs-repo>` with **Contents: Read and write** and **Pull requests: Read and write**, and share the value with me via 1Password? It'll power an Action that opens docs-update PRs on your repo."

Heads-up: fine-grained PATs expire (max 1 year), so this handoff needs to happen again each cycle.

### Option C — If the docs repo is in an organization

Two extra things the org needs to do before any of the above works:
- **Allow fine-grained PATs** on the org: Org → Settings → Third-party Access → Personal access tokens → "Allow access via fine-grained personal access tokens."
- **Approve your specific token request** once it's created (the token sits in a pending state until an org admin approves it).

What to ask the org admin for:
> "Can you (1) enable fine-grained PAT access for the org, and (2) approve the token request I'll submit that asks for Contents + Pull requests write on `<docs-repo>`?"

### Option D — GitHub App instead of a PAT (production-grade)

If this flow matters long-term, a GitHub App is cleaner than a PAT: it doesn't expire, it belongs to the repo/org rather than a person, and it's easier to audit. Setup is heavier (create the App, install it on both repos, generate a private key, have the workflow mint an installation token). Worth considering if the PAT handoff becomes a pain.

---

## What this Action actually does, in plain language

Every time you push code to the source repo's `main` branch, GitHub runs a little script on a fresh machine. Here's what that script does, step by step:

1. **Downloads your code** onto the machine.
2. **Installs the packages** your project depends on (the same thing `npm install` does locally).
3. **Runs the docs generator** (TypeDoc) which reads your source files and the comments in them, and produces a folder of markdown files describing everything your code exports.
4. **Downloads the docs repo** into a separate folder on the same machine.
5. **Wipes the old generated docs** from that folder (leaving things like `.gitkeep` and the `.git` folder alone).
6. **Copies the freshly generated docs** into the docs repo folder.
7. **Checks whether anything actually changed** — if the new docs are identical to what was already there, it stops here and does nothing.
8. **If there are changes,** it creates a new branch in the docs repo named something like `docs-update-20260422-143255`, commits the new docs, pushes that branch up to GitHub, and opens a pull request against the docs repo's `main` branch.

You (or whoever owns the docs repo) review the PR, and if the changes look right, you merge it. The docs repo stays in sync with whatever's in your source code.

### The bumps we hit while getting this working

- **The token didn't have the right permissions.** The first token could read both repos but couldn't *write* to the docs repo, so the "download the docs repo" step failed with a 403. Fixed by regenerating the token with Contents + Pull requests set to "Read and write."
- **The "did anything change?" check missed brand-new files.** The original check only compared files git already knew about. On the very first run, every docs file is brand new, so git didn't see them as "changes" and the workflow thought there was nothing to do. Fixed by staging all files first (including new ones) before asking git whether anything differs.

---

## Files involved in this repo

- `.github/workflows/update-docs.yml` — the workflow definition that runs on every push to `main`
- `typedoc.json` — configures how TypeDoc generates the markdown docs
- `package.json` — defines the `docs:generate` script the workflow runs

The docs repo doesn't need anything special beyond an empty `docs/` folder (with a `.gitkeep` if you want) and a `.gitignore` that doesn't exclude `.md` files.
