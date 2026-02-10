import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentRegistryService } from '../../../../backend/agents/registry.js';
import fs from 'fs/promises';
import path from 'path';

describe('AgentRegistryService Integration', () => {
  const testDir = path.resolve(process.cwd(), '.runtime_test_roles');
  let registry: AgentRegistryService;

  beforeEach(async () => {
    // Prepare test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch { }
    await fs.mkdir(testDir, { recursive: true });

    // Initialize registry with test directory
    registry = new AgentRegistryService(testDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch { }
  });

  it('should load an agent from a markdown file', async () => {
    const agentFile = path.join(testDir, 'test-agent.md');
    const content = `---
id: role.test-agent
type: rule
owner: architect-agent
version: 1.0.0
---
# ROLE: test-agent

You are a test agent.
`;
    await fs.writeFile(agentFile, content, 'utf-8');

    await registry.loadAgents();

    const agent = registry.getAgent('role.test-agent');
    expect(agent).toBeDefined();
    // Check instructions
    expect(agent?.instructions).toContain('You are a test agent.');
    expect(agent?.name).toBe('test-agent');
  });

  it('should skip files without ID', async () => {
    const invalidFile = path.join(testDir, 'invalid.md');
    const content = `---
type: rule
---
No ID here.
`;
    await fs.writeFile(invalidFile, content, 'utf-8');
    await registry.loadAgents();

    const agents = registry.listAgents();
    expect(agents.length).toBe(0);
  });

  it('should handle complex frontmatter', async () => {
    const agentFile = path.join(testDir, 'complex-agent.md');
    const content = `---
id: role.complex-agent
capabilities:
  skills: ["skill-a", "skill-b"]
  tools:
    web: supported
---
Complex agent instructions.
`;
    await fs.writeFile(agentFile, content, 'utf-8');
    await registry.loadAgents();

    const agent = registry.getAgent('role.complex-agent');
    expect(agent).toBeDefined();
    expect(agent?.instructions).toContain('Complex agent instructions.');
  });
});
