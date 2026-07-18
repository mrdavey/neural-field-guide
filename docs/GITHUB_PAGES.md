# Publishing the course with GitHub Pages

This is the repository-specific publication runbook for the five-course **Neural Field Guide**. It was reviewed against the official GitHub Pages publishing-source guidance and Next.js 16.2.10 static-export and `basePath` documentation on 15 July 2026.

Publication is **not enabled**. The ready-to-copy workflow lives under `docs/`, where GitHub will not execute it. Follow the activation steps only when the repository is ready to become public.

## Readiness status

The course can be published as a static site because its learner state stays in the browser and the course does not require an API, account, database, teacher, or server-side grader.

The repository uses a static-first Next.js architecture:

- `next.config.ts` enables `output: "export"` only for a Pages build;
- `tsconfig.pages.json` limits the Pages type-check to the static course application;
- `app/public-path.ts` keeps downloadable artifacts and the favicon working for both root and project Pages URLs;
- `npm run build:pages` uses Next.js's native static exporter and produces the publishable files in `out/`;
- `npm run verify:pages` rejects incomplete, oversized, secret-bearing, symlinked, or incorrectly prefixed output;
- `docs/github-pages/deploy-pages.yml` is an inert deployment-workflow template.

`npm run dev` provides the local preview and `npm run build` provides a standard Next.js production check. GitHub Pages cannot run a server process, database, authentication service, secret-backed API, or request-dependent route handler. Do not add those features without explicitly changing the hosting architecture.

## 1. Choose the final URL shape

GitHub Pages supports three relevant shapes:

| Choice | Example | Pages base path |
| --- | --- | --- |
| User or organization site | `https://USERNAME.github.io/` from a repository named `USERNAME.github.io` | empty |
| Project site | `https://USERNAME.github.io/llms-from-scratch/` | `/llms-from-scratch` |
| Custom domain | `https://learn.example.com/` | normally empty |

The included workflow reads GitHub's computed `base_path`, so the same source works for all three. A project site is usually the simplest choice when the GitHub account already has another Pages site.

On GitHub Free, use a **public repository**. A private source repository requires an eligible paid plan, and a Pages website should be treated as public regardless of repository visibility.

## 2. Complete the pre-publication audit

Before creating or pushing the repository:

1. Run `git status --short` and decide deliberately which files belong in the public history.
2. Search for secrets and personal data. Never commit `.env` files, API keys, access tokens, private datasets, model credentials, learner data, or unreviewed external-execution output.
3. Check that every item under `public/` is safe to publish. Everything there becomes directly downloadable.
4. Choose and add a `LICENSE` if other people should be allowed to reuse the source or curriculum. No license means normal copyright restrictions remain; repository visibility alone does not grant reuse rights.
5. Review third-party names, quotations, images, model licenses, dataset licenses, and linked resources. The course currently uses original UI, text links, and small machine-readable learning artifacts rather than bundled model weights.
6. Confirm the repository name. Renaming a project repository changes its Pages base path and requires a fresh build, which the workflow handles automatically.

The ignored `external-executions/runs/`, `.env*`, `node_modules/`, and build directories should remain ignored.

## 3. Verify the normal course locally

`npm install` installs the repository hooks automatically. Confirm or repair that configuration, then run the same isolated release contract used by GitHub Actions:

```bash
npm run hooks:install
npm run ci:verify
```

`ci:verify` requires Python 3.12, installs the exact npm graph, creates a fresh temporary Python environment, installs every course lock referenced by `requirements-ci.txt`, records the OS/Node/Python/dependency fingerprint, runs lint and the full test suite, and verifies both root and `/neural-field-guide` Pages URL shapes. The temporary environment starts without NumPy, so a package installed globally cannot hide a missing dependency declaration. Do not publish from a failing command.

The installed pre-push hook runs `ci:verify` before every normal push, including a direct push to `main`. `git push --no-verify` can bypass local hooks and is reserved for an explicitly understood emergency; it cannot make a failing GitHub verification deploy the site.

## 4. Dry-run the static export

First test the simplest root-hosted form:

```bash
NEXT_PUBLIC_BASE_PATH= npm run build:pages
EXPECTED_PAGES_BASE_PATH= npm run verify:pages
python3 -m http.server 4173 --directory out
```

Open `http://localhost:4173/`. The root should forward to the last course (or `/llm/` by default). Check `/llm/`, `/worldmodel/`, `/generative/`, `/rl/`, and `/embodied/`; several canonical lessons in every course; one old flat LLM lesson forward; the course selector; course-isolated progress after refresh; interactive exercises; all capstone downloads and validation dossiers; the favicon; mobile layout; keyboard navigation; and external source links.

Stop the preview with `Ctrl+C`.

For a project site, also verify its exact prefix. Replace `llms-from-scratch` with the intended repository name:

```bash
NEXT_PUBLIC_BASE_PATH=/llms-from-scratch npm run build:pages
EXPECTED_PAGES_BASE_PATH=/llms-from-scratch npm run verify:pages
```

This second check validates emitted URLs. The GitHub Pages environment mounts the uploaded `out/` contents at that prefix; a basic local file server does not emulate that mount automatically.

Do not upload `dist/`. It contains the normal worker/server build. The only Pages artifact is `out/`.

## 5. Create the GitHub repository

Create a repository with the URL shape chosen in step 1. For GitHub Free, make it public. Do not initialize the remote with unrelated starter files if this local directory will be pushed as its source.

If this directory does not yet have the intended remote, connect it using the repository URL GitHub shows you. Confirm rather than assuming the branch name:

```bash
git branch --show-current
git remote -v
```

The workflow template watches `main`. If the default branch has another name, update `branches: [main]` in the copied workflow before pushing it.

## 6. Activate the deployment workflow

The supplied template is intentionally inactive. Activate it only when publishing is intended:

```bash
mkdir -p .github/workflows
cp docs/github-pages/deploy-pages.yml .github/workflows/deploy-pages.yml
```

Review the copied file before committing. It will:

1. run on pinned Ubuntu 24.04 with Node 22.13.0 and Python 3.12;
2. ask GitHub Pages for the correct base path on push and manual runs;
3. run the shared `npm run ci:verify` contract in a clean environment;
4. upload only the verified `out/` directory;
5. deploy through the protected `github-pages` environment only after verification passes;
6. run the same clean verification every Monday without uploading or deploying.

Once committed, every push to `main` will attempt a deployment. The `workflow_dispatch` trigger also provides a manual **Run workflow** button.

## 7. Enable Pages in repository settings

On GitHub:

1. Open the repository's **Settings**.
2. Select **Pages** under **Code and automation**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Push the activation commit or manually run **Deploy course to GitHub Pages** from the **Actions** tab.
5. Open the deployment URL shown in the completed workflow and in **Settings → Pages**.

The deploy job needs `pages: write` and `id-token: write`; these permissions are already declared in the template. If organization policy disables Actions or Pages, an owner must enable them.

## 8. Perform the live acceptance check

Do not treat a green deployment alone as proof that the course works. In a private/incognito window, verify:

- the exact Pages URL and trailing slash load without a 404;
- `/llm/`, `/worldmodel/`, `/generative/`, `/rl/`, and `/embodied/` load directly, the selector changes among all five, and canonical lesson URLs include their course segment;
- a legacy flat LLM lesson URL visibly forwards to the matching `/llm/<lesson-id>/` URL;
- styles and JavaScript load rather than producing an unstyled page;
- several lessons in every course open and close correctly;
- quizzes, simulations, workspaces, progress, and reset controls work without a server;
- a refresh preserves browser-local progress separately for all five courses;
- every capstone and validation JSON link includes the repository prefix when using a project site;
- direct navigation and browser back/forward behavior work;
- no console or network request points at `localhost`, a secret endpoint, or a missing root-level artifact;
- mobile, keyboard, focus, contrast, and reduced-motion behavior remain usable.

Learner progress is device- and browser-specific. GitHub Pages does not synchronize it between devices. Clearing site storage removes it.

## Updating or rolling back

After activation, a passing push to `main` publishes a new version. For a safer release process, change the workflow trigger to a dedicated branch or retain only `workflow_dispatch`.

To roll back, revert the problematic commit and let the workflow deploy the reverted state. To stop automatic deployment, remove or rename `.github/workflows/deploy-pages.yml`; disabling Pages in settings removes the public site.

## Optional custom domain

Configure a custom domain in **Settings → Pages before changing DNS**. Verify the domain at the account or organization level, avoid wildcard DNS records, retain the verification TXT record, and enable **Enforce HTTPS** after GitHub provisions the certificate. A custom Actions workflow does not need a committed `CNAME` file; repository settings are authoritative.

If the domain changes the Pages base path, rerun the workflow so links are rebuilt for the new path.

## Troubleshooting

### The home page is unstyled or interactive controls do nothing

Inspect the browser network panel for 404s under `/_next/`. Confirm the workflow passed `${{ steps.pages.outputs.base_path }}` to `NEXT_PUBLIC_BASE_PATH` and published `out/`, not `dist/` or the repository root.

### JSON downloads or the favicon return 404

Run the project-prefix dry run and `npm run verify:pages`. New public files must use `publicPath(...)`; a hard-coded root URL such as `/validation-artifacts/file.json` bypasses the project base path.

### The workflow succeeds but GitHub shows no site

Confirm **Settings → Pages → Source** is **GitHub Actions**, inspect the `deploy` job, and confirm the repository or organization permits Pages and Actions.

### The deployment fails before upload

Fix the first failed lint, test, artifact, build, or Pages-verification step locally. The workflow deliberately refuses to publish an unverified course.

If a capstone execution test reports that NumPy is missing, confirm the workflow still runs `actions/setup-python@v6`, calls `npm run ci:verify`, and that `requirements-ci.txt` includes every `public/capstone-artifacts/*/requirements-capstones.txt` lock. The verifier deliberately rejects a fresh environment that already contains NumPy, then installs the aggregate lock before running tests.

### A route or feature works locally but not on Pages

Pages is static hosting. Remove the server-only dependency, precompute the data into `public/`, keep the interaction in the browser, or choose a host/backend that supports the required runtime.

## Primary documentation

- [GitHub: Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub: Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub: Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub: Securing Pages with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [GitHub: Verifying a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Next.js: Static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js: `basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
