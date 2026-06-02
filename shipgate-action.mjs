import { readFileSync } from "node:fs";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function getOidcToken(audience) {
  const requestUrl = new URL(requireEnv("ACTIONS_ID_TOKEN_REQUEST_URL"));
  requestUrl.searchParams.set("audience", audience);

  const response = await fetch(requestUrl, {
    headers: {
      Authorization: `Bearer ${requireEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN")}`
    }
  });

  const body = await response.json();
  if (!response.ok || !body.value) {
    throw new Error(body.message || `Unable to request GitHub OIDC token: ${response.status}`);
  }
  return body.value;
}

async function main() {
  const event = JSON.parse(readFileSync(requireEnv("GITHUB_EVENT_PATH"), "utf8"));
  if (!event.pull_request) {
    throw new Error("ShipGate must run on pull_request events");
  }
  if (event.repository?.private) {
    throw new Error(
      "ShipGate free beta only supports public repositories. Private repositories are rejected before quiz generation."
    );
  }

  const appUrl = (process.env.SHIPGATE_URL || "https://shipgate.me").replace(/\/$/, "");
  console.log("ShipGate free beta supports public repositories only.");
  console.log(`Creating an AI-generated comprehension quiz for ${event.repository.full_name}#${event.pull_request.number}.`);
  console.log(`ShipGate hosted service at ${appUrl} will read the public PR diff to generate the quiz.`);

  const oidcToken = await getOidcToken(appUrl);
  const payload = {
    oidcToken,
    repository: event.repository.full_name,
    pullNumber: event.pull_request.number,
    headSha: event.pull_request.head.sha
  };

  const response = await fetch(`${appUrl}/api/github/actions/shipgate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.error ||
        `ShipGate could not create a quiz from the hosted service (${response.status}). ` +
          "Check that the ShipGate-AI GitHub App is installed and that this workflow has id-token: write permission."
    );
  }

  if (body.quizUrl) {
    console.log(`ShipGate quiz created: ${body.quizUrl}`);
  } else {
    console.log("ShipGate quiz created. Check the pull request comment for the quiz link.");
  }
}

main().catch((error) => {
  console.error(`ShipGate failed: ${error.message || error}`);
  if (process.env.SHIPGATE_FAIL_ON_ERROR === "false") {
    console.error("Continuing because fail-on-error is false.");
    process.exit(0);
  }
  process.exit(1);
});
