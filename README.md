# ShipGate

ShipGate blocks public pull requests until the author passes an AI-generated quiz about their own diff.

No LLM key. No database. No hosted app setup. Install the GitHub App, add one workflow, and require the `shipgate/comprehension` status check.

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

4. Add `shipgate/comprehension` as a required status check in your branch protection rules.

## Public beta

ShipGate currently supports public repositories only. Private repository support will require an explicit opt-in plan because PR diffs are sent to ShipGate's hosted servers to generate quizzes.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `shipgate-url` | `https://shipgate.me` | Hosted ShipGate app URL. |
| `fail-on-error` | `true` | Set to `false` to avoid failing the workflow if ShipGate is unavailable. |

## Permissions

The workflow needs `id-token: write` so ShipGate can verify the request came from GitHub Actions. The ShipGate-AI GitHub App handles PR diff reads, PR comments, and commit status updates.

## License

MIT
