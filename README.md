# ShipGate

ShipGate blocks supported pull requests until the author passes an AI-generated quiz about their own diff.

No LLM key. No database. No self-hosted app setup. Install the ShipGate-AI GitHub App, add one workflow, and require the `shipgate/comprehension` status check.

ShipGate is a hosted public beta at https://shipgate.me. It supports public repositories and explicitly allowlisted private repositories. Pull request diffs are sent to ShipGate hosted servers so the service can generate quiz content.

## How it works

1. A pull request opens or updates in a supported repository.
2. This action asks GitHub Actions for an OIDC token and sends the PR identity to ShipGate.
3. The hosted ShipGate service verifies the workflow request, checks repository access, reads the PR diff through the ShipGate-AI GitHub App, and generates four AI-generated multiple-choice questions.
4. ShipGate comments with a quiz link and sets the `shipgate/comprehension` status.
5. The PR author passes the quiz, then ShipGate marks the status successful.

## Install

1. Install the ShipGate-AI GitHub App:

   https://github.com/apps/shipgate-ai

2. Add this workflow at `.github/workflows/shipgate.yml`:

   ```yaml
   name: ShipGate

   on:
     pull_request:
       types: [opened, synchronize]

   permissions:
     id-token: write
     contents: read
     pull-requests: read

   jobs:
     shipgate:
       runs-on: ubuntu-latest
       steps:
         - uses: aaryanporwal/shipgate@v1
   ```

3. Open a pull request. ShipGate will post a quiz link and create the `shipgate/comprehension` status.

4. Add `shipgate/comprehension` as a required status check:

   - Open your repository settings.
   - Go to Branches, then edit the branch protection rule for your protected branch.
   - Enable required status checks and select `shipgate/comprehension`.
   - Save the rule.

## Public beta

ShipGate currently supports public repositories and explicitly allowlisted private repositories. Unsupported private repositories are rejected before quiz generation.

Pull request diffs go to ShipGate hosted servers at `https://shipgate.me` and may be sent to an AI model provider to generate quiz questions, answer choices, correct answers, and explanations. Quiz content is AI-generated and can be incomplete, incorrect, ambiguous, or unsuitable for a specific repository.

Passing ShipGate is a comprehension signal. It is not a security review, correctness guarantee, or replacement for human code review.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `shipgate-url` | `https://shipgate.me` | Hosted ShipGate app URL. |
| `fail-on-error` | `true` | Set to `false` to avoid failing the workflow if ShipGate is unavailable. |

## Permissions

The workflow needs `id-token: write` so ShipGate can verify the request came from GitHub Actions. The ShipGate-AI GitHub App handles PR diff reads, PR comments, and commit status updates.

## Policies and reports

- Terms: https://shipgate.me/terms
- Privacy: https://shipgate.me/privacy
- AI disclosure: https://shipgate.me/ai

Report bugs, improper AI outputs, privacy requests, legal requests, and security concerns to legal@shipgate.me.

## Marketplace publishing

This repository is intentionally minimal for GitHub Marketplace publication: one root `action.yml`, the action script, this README, the NOTICE file, and the AGPL-3.0 license. Do not add workflow files before publishing the Marketplace action.

GitHub Marketplace requires a unique action metadata `name`. Before publishing the release, confirm that `ShipGate` is still available in the Marketplace publish flow.

## License

AGPL-3.0
