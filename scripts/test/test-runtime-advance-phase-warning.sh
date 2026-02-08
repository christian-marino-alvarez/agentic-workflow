#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 /ABS/PATH/TO/.agent/artifacts/candidate/task.md"
  exit 1
fi

task_path="$1"

payload="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"runtime.advance_phase\",\"arguments\":{\"taskPath\":\"$task_path\",\"agent\":\"architect-agent\",\"expectedPhase\":\"short-phase-1-brief\"}}}"
printf 'Content-Length: %s\r\n\r\n%s' "${#payload}" "$payload" | \
  node /Users/milos/Documents/workspace/agentic-workflow/bin/cli.js mcp
