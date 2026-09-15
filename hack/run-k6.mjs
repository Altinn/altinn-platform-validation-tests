import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
function main() {
  const [environment, target, ...args] = process.argv.slice(2);
  if (environment === '--help' || !environment || !target) {
    console.log('Usage: npm run k6 -- <environment> <test.js> [k6 run flags]\n'
      + '       npm run k6 -- <environment> <test.js> --inspect\n'
      + 'Loads .env.<environment> automatically. Use --inspect alone to validate imports without running tests.');
    return environment === '--help' ? 0 : 1;
  }
  if (!/^[a-z0-9-]+$/.test(environment)) throw new Error('Invalid environment name.');
  const inspect = args.includes('--inspect');
  if (inspect && args.length !== 1) {
    throw new Error('The runner accepts --inspect only on its own, without additional flags or arguments. '
      + 'Remove the other arguments to inspect imports, or remove --inspect to run the test with k6 run flags.');
  }
  const envFile = resolve(root, `.env.${environment}`);
  if (!existsSync(envFile)) throw new Error(`Create ${envFile} using .env.at23.example as a template.`);
  // Parse dotenv syntax without executing shell commands or changing the parent shell.
  // File values override inherited variables so switching environments is reliable.
  const localEnv = parseEnv(readFileSync(envFile, 'utf8'));
  if (localEnv.ENVIRONMENT !== undefined && localEnv.ENVIRONMENT !== environment) {
    throw new Error(`ENVIRONMENT in ${envFile} must be ${environment}.`);
  }
  const test = resolve(root, target);
  if (!existsSync(test)) throw new Error(`Test does not exist: ${target}`);
  const env = { ...process.env, ...localEnv };
  console.log(`\n${inspect ? 'Inspecting' : 'Running'} ${target} (${environment})`);
  const command = inspect
    ? ['inspect', '--include-system-env-vars', test]
    : ['run', ...args, test];
  const result = spawnSync('k6', command, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw new Error(`Cannot start k6: ${result.error.message}. Ensure k6 is installed and on PATH.`);
  if (result.signal) {
    process.kill(process.pid, result.signal);
    return 1;
  }
  return result.status ?? 1;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
