#!/usr/bin/env node

const readline = require('readline');
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEPS_DIR = path.join(ROOT_DIR, 'deps', 'whisper.cpp');
const EXTERNAL_BUILD_DIR = path.join(ROOT_DIR, 'external_build');
const WHISPER_CPP_REPO_URL = 'https://github.com/ggerganov/whisper.cpp.git';

// Platform detection
const currentPlatform = os.platform();
const currentArch = os.arch();
const platformDir = path.join(ROOT_DIR, 'platform', `${currentPlatform}-${currentArch}`);

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function getAbi(runtime, version) {
  try {
    const nodeAbi = require('node-abi');
    return nodeAbi.getAbi(version, runtime);
  } catch (e) {
    console.error(
      `Failed to get ABI for ${runtime} v${version}: ${e.message}\n` +
        'Please ensure "node-abi" is installed (npm install node-abi).'
    );
    process.exit(1);
  }
}

function ensureWhisperCppSource() {
  // Try git submodule first
  try {
    execSync('git submodule update --init --recursive', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    if (fs.existsSync(path.join(DEPS_DIR, 'CMakeLists.txt'))) {
      return;
    }
  } catch (_) {
    // Submodule may not work (e.g. installed from npm tarball)
    console.log('Git submodule not available, trying alternative method...');
  }

  // If submodule failed, try cloning
  if (!fs.existsSync(path.join(DEPS_DIR, 'CMakeLists.txt'))) {
    console.log('Git submodule not available, cloning whisper.cpp...');
    fs.mkdirSync(path.join(ROOT_DIR, 'deps'), { recursive: true });
    try {
      execSync(
        `git clone --depth 1 ${WHISPER_CPP_REPO_URL}`,
        {
          cwd: path.join(ROOT_DIR, 'deps'),
          stdio: 'inherit',
        }
      );
    } catch (e) {
      console.error(
        'Failed to clone whisper.cpp. Please ensure git is installed and network is available.'
      );
      process.exit(1);
    }
  }
}

async function promptUser() {
  // Check for environment variables (non-interactive mode)
  let runtime = process.env.WHISPER_RUNTIME;
  let runtimeVersion = process.env.WHISPER_RUNTIME_VERSION;

  if (runtime && runtimeVersion) {
    console.log(
      `Using environment config: runtime=${runtime}, version=${runtimeVersion}`
    );
    return { runtime, runtimeVersion };
  }

  // If not a TTY (e.g. CI, piped), use defaults
  if (!process.stdin.isTTY) {
    runtime = runtime || 'node';
    runtimeVersion = runtimeVersion || process.versions.node;
    console.log(
      `Non-interactive mode: building for ${runtime} v${runtimeVersion}`
    );
    return { runtime, runtimeVersion };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Ask for runtime type
    const runtimeAnswer = await askQuestion(
      rl,
      'Select runtime (node/electron) [node]: '
    );
    runtime = runtimeAnswer || 'node';

    if (runtime !== 'node' && runtime !== 'electron') {
      console.error('Invalid runtime. Please choose "node" or "electron".');
      process.exit(1);
    }

    // Ask for version with smart default
    const defaultVersion = runtime === 'node' ? process.versions.node : '';
    const versionPrompt = defaultVersion
      ? `Enter ${runtime} version [${defaultVersion}]: `
      : `Enter ${runtime} version: `;

    const versionAnswer = await askQuestion(rl, versionPrompt);
    runtimeVersion = versionAnswer || defaultVersion;

    if (!runtimeVersion) {
      console.error('Version is required.');
      process.exit(1);
    }
  } finally {
    rl.close();
  }

  return { runtime, runtimeVersion };
}

function buildNativeAddon(runtime, runtimeVersion, abi) {
  console.log('\nCompiling native addon...');
  const outRelative = path.relative(DEPS_DIR, EXTERNAL_BUILD_DIR);
  const cmakeArgs = [
    'npx',
    'cmake-js',
    'compile',
    `--runtime=${runtime}`,
    `--runtime-version=${runtimeVersion}`,
    `--abi=${abi}`,
    `--out=${outRelative}`,
  ].join(' ');

  try {
    execSync(cmakeArgs, {
      cwd: DEPS_DIR,
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('Build failed:', e.message);
    process.exit(1);
  }
}

function copyBuildOutput() {
  console.log(
    `\nCopying built files to platform/${currentPlatform}-${currentArch}/...`
  );

  fs.mkdirSync(platformDir, { recursive: true });

  // Determine build output directory (Windows uses bin/Release, others use Release)
  let buildOutputDir;
  if (currentPlatform === 'win32') {
    buildOutputDir = path.join(EXTERNAL_BUILD_DIR, 'bin', 'Release');
  } else {
    buildOutputDir = path.join(EXTERNAL_BUILD_DIR, 'Release');
  }

  if (!fs.existsSync(buildOutputDir)) {
    console.error(`Build output directory not found: ${buildOutputDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(buildOutputDir);
  for (const file of files) {
    const src = path.join(buildOutputDir, file);
    if (!fs.statSync(src).isFile()) continue;
    let destName = file;
    // cmake-js outputs the addon as "addon.node.node"; rename to "whisper.node" for runtime loading
    if (file === 'addon.node.node') {
      destName = 'whisper.node';
    }
    const dest = path.join(platformDir, destName);
    fs.copyFileSync(src, dest);
    console.log(
      `  Copied: ${file}${file === 'addon.node.node' ? ' -> whisper.node' : ''}`
    );
  }
}

async function main() {
  console.log('=== whisper-node-addon install ===\n');
  console.log(`Platform: ${currentPlatform}-${currentArch}\n`);

  // Step 1: Ensure whisper.cpp source is available
  ensureWhisperCppSource();

  // Step 2: Prompt for runtime and version
  const { runtime, runtimeVersion } = await promptUser();
  console.log(`\nBuilding for ${runtime} v${runtimeVersion}...`);

  // Step 3: Get ABI number
  const abi = getAbi(runtime, runtimeVersion);
  console.log(`ABI: ${abi}`);

  // Step 4: Build native addon
  buildNativeAddon(runtime, runtimeVersion, abi);

  // Step 5: Copy built files to platform directory
  copyBuildOutput();

  console.log('\n✅ Build complete!');
}

main().catch((err) => {
  console.error('Install failed:', err);
  process.exit(1);
});
