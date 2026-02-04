#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "--help" ]; then
  echo "Usage: $0 [--list] [--workflows]"
  exit 0
fi

run_request() {
  local payload="$1"
  printf '%s\n' "$payload" | node bin/cli.js mcp
}

init_payload='{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{"tools":{},"resources":{}},"clientInfo":{"name":"mcp-quick-test","version":"1.0.0"}}}'
init_request() {
  printf '%s\n' "$init_payload"
}

if [ "${1:-}" = "--list" ]; then
  { init_request; run_request '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'; } | node bin/cli.js mcp
  exit 0
fi

if [ "${1:-}" = "--workflows" ]; then
  { init_request; run_request '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"runtime.list_workflows","arguments":{}}}'; } | node bin/cli.js mcp
  exit 0
fi

{ init_request; run_request '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'; run_request '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"runtime.list_workflows","arguments":{}}}'; } | node bin/cli.js mcp
