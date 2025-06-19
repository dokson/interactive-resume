const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPTS = [
    { name: 'Minify Sources', script: 'node src/build/minify.js' },
    { name: 'Generate Manifest', script: 'node src/build/generate-manifest.js' }
];

console.log(`🚀 Starting deploy process...`);

const distDir = path.join(__dirname, '../../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`📁 Created output directory: ${distDir}`);
}

SCRIPTS.forEach((step, index) => {
    try {
        console.log(`\n📦 Step ${index + 1}: ${step.name}`);
        console.log('─'.repeat(100));
        
        execSync(step.script, { 
            stdio: 'inherit', 
            cwd: path.join(__dirname, '../..') 
        });
        
        console.log(`✅ ${step.name} completed`);
    } catch (error) {
        console.error(`❌ ${step.name} failed:`, error.message);
        process.exit(1);
    }
});

console.log(`🎉 Deploy process completed!`);

console.log('─'.repeat(100));

if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    console.log(`📋 ${distDir}:`);
    files.forEach(file => {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`   • ${file} (${size} KB)`);
    });
}