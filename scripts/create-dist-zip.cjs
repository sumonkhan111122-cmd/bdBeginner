const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.resolve(__dirname, '../dist');
const zipPath = path.resolve(__dirname, '../dist.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const cmd = `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${distDir.replace(/'/g, "''")}', '${zipPath.replace(/'/g, "''")}');"`;

execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(zipPath)) {
  console.log(`✅ dist.zip successfully created at ${zipPath} (${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB)`);
} else {
  console.error('❌ Failed to create dist.zip');
  process.exit(1);
}
