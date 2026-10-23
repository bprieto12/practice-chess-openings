# Practice Chess Openings

A mobile-friendly web app for learning chess openings and chess notation. It will be hosted at https://practice-chess-openings.spixionic.com. See [SPEC.md](SPEC.md) for the full product spec.

## Development

```sh
npm install
npm run dev          # local dev server
npm test             # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright: iPhone SE, Pixel 7, desktop)
npm run validate     # check all opening and notation content
npm run build        # validate + type-check + production build into dist/
```

The first e2e run needs browsers installed: `npx playwright install chromium webkit`.

## Content

- Openings: `src/content/openings/`. Each file holds one opening, with lines of SAN moves and a comment per move. Shared move sequences ("stems") are defined once and spread into the lines that use them.
- Notation lessons: `src/content/notation/index.ts`.

`npm run validate` (also run by `npm run build`) replays every line with chess.js. It fails on an illegal or wrongly written move, a missing comment, or a line outside 8–12 moves. Its warnings mark positions where lines branch on the opening side's own move; these are expected.

## Hosting and deployment

The site is hosted on AWS: a private S3 bucket behind CloudFront, with a free ACM certificate and a Route 53 record for `practice-chess-openings.spixionic.com`. The infrastructure is defined with Terraform in [`infra/`](infra/).

**Deploys happen automatically.** Every push to `main` runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, unit tests, build, end-to-end tests, then upload to S3 and CloudFront cache refresh. Pull requests run the tests only. GitHub signs in to AWS with short-lived OIDC tokens and an IAM role that only trusts this repo's `main` branch, so there are no AWS secrets to store.

### One-time setup

```sh
aws login
cd infra
terraform init
terraform apply       # ~5-10 min; the certificate and CloudFront take a while
terraform output -raw github_variables_command | sh   # gives the workflow its settings
```

If the AWS account already has a GitHub OIDC provider, add `-var create_github_oidc_provider=false` to `terraform apply`.

Terraform state lives in `infra/terraform.tfstate` and is gitignored. Keep a backup of it.

### Manual deploy

```sh
npm run build
S3_BUCKET=$(terraform -chdir=infra output -raw bucket_name) \
CLOUDFRONT_DISTRIBUTION_ID=$(terraform -chdir=infra output -raw cloudfront_distribution_id) \
npm run deploy
```
