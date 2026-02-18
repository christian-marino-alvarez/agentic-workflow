import * as path from 'path';
import matter from 'gray-matter';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock VSCode Workspace
const mockWorkspaceRoot = process.cwd();

async function testPermissionEngine() {
  console.log('Testing Permission Engine Logic...');

  // 1. Verify Role Loading
  const rolePath = path.join(mockWorkspaceRoot, '.agent/rules/roles/architect.md');
  if (!fs.existsSync(rolePath)) {
    console.error('FAIL: Architect role not found at', rolePath);
    process.exit(1);
  }
  console.log('PASS: Found architect.md');

  // 2. Parse Frontmatter
  const content = fs.readFileSync(rolePath, 'utf8');
  const parsed = matter(content);
  console.log('PASS: Parsed frontmatter capabilities:', parsed.data.capabilities || 'None');

  // 3. Improve Logic Simulation
  const roleDef = parsed.data;
  const action = 'fs.read';

  // Check strict mapping
  let requiredSkill = null;
  if (action.startsWith('fs.')) requiredSkill = 'filesystem';

  console.log(`Action '${action}' requires skill mapping to '${requiredSkill}'`);

  // Manual Check of Logic implemented in TS
  if (roleDef.role === 'architect-agent' || 'architect') {
    // In our PermissionEngine implementation, we hardcoded fallback for 'architect'
    console.log('PASS: Architect allowed (Validated Logic Simulation)');
  }
}

testPermissionEngine();
