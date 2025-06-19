const path = require('path');
const fs = require('fs');

const packageJson = require(path.join(__dirname, '../../package.json'));

const { execSync } = require('child_process');

console.log(`🚀 Starting deploy process...`);

if (!fs.existsSync(packageJson.config.build.outputDir)) {
    fs.mkdirSync(packageJson.config.build.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${packageJson.config.build.outputDir}`);
}

packageJson.config.build.steps.forEach((step, index) => {
    try {
        console.log(`\n📦 Step ${index + 1}: ${step.name}`);
        console.log('─'.repeat(100));
        
        execSync(`npm run ${step.script}`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '../..')
        });
        
        console.log(`✅ ${step.name} completed`);
    } catch (error) {
        console.error(`❌ ${step.name} failed:`, error.message);
        process.exit(1);
    }
});

console.log('─'.repeat(100));
console.log(`🎉 Deploy process completed!`);
