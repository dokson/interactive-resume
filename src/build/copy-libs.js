const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const packageJson = require(path.join(rootDir, 'package.json'));

const outputDir = path.join(rootDir, packageJson.config.build.outputDir);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const nodeModulesDir = path.join(rootDir, 'node_modules');

const declaredDependencies = Object.keys(packageJson.dependencies || {});
const filesToCopyConfig = packageJson.config.build.externalLibs || [];
const configuredPackages = filesToCopyConfig.map(lib => lib.from);

let hasError = false;

// Check 1: Dependencies declared but not configured for copying.
const unconfiguredDeps = declaredDependencies.filter(dep => !configuredPackages.includes(dep));
if (unconfiguredDeps.length > 0) {
    console.warn(`🟡 Warning: The following dependencies are not configured in 'externalLibs':`);
    unconfiguredDeps.forEach(dep => console.warn(`  - ${dep}`));
    console.warn(`   If they are not needed in 'dist', you can ignore this. Otherwise, add them to 'config.build.externalLibs' in package.json.`);
}

// Check 2: Packages configured for copying but not declared as dependencies. This is an error.
const obsoleteConfigs = configuredPackages.filter(pkg => !declaredDependencies.includes(pkg));
if (obsoleteConfigs.length > 0) {
    console.error(`❌ Error: The following packages are configured in 'externalLibs' but are NOT in 'dependencies':`);
    obsoleteConfigs.forEach(pkg => console.error(`  - ${pkg}`));
    console.error(`   Please run 'npm install ${obsoleteConfigs.join(' ')}' or remove them from 'config.build.externalLibs'.`);
    hasError = true;
}

if (hasError) process.exit(1);

console.log('🔄 Copy external libs...');

filesToCopyConfig.forEach(lib => {
    const packageName = lib.from;
    const relativePath = lib.file;
    const srcPath = path.join(nodeModulesDir, packageName, relativePath);
    const destPath = path.join(outputDir, path.basename(srcPath));

    try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${path.basename(srcPath)} from ${packageName} to ${outputDir}`);
    } catch (error) {
        console.error(`❌ Error copying ${path.basename(srcPath)} from ${packageName}: ${error.message}`);
        process.exit(1);
    }
});
