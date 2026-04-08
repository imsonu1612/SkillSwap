// Cross-platform build script for Vercel deployment
const { execSync } = require('child_process');

function runStep(title, command) {
	console.log(`\n==> ${title}`);
	console.log(`$ ${command}`);
	try {
		execSync(command, { stdio: 'inherit' });
	} catch (error) {
		console.error(`\nStep failed: ${title}`);
		console.error(`Command: ${command}`);
		throw error;
	}
}

console.log('Starting Vercel build process...');
runStep('Node version', 'node -v');
runStep('NPM version', 'npm -v');

// Keep installs minimal in Vercel to avoid duplicate root installs and timeout risk.
runStep(
	'Installing client dependencies',
	'npm --prefix client install --legacy-peer-deps --no-audit --no-fund'
);

console.log('\n==> Building client application');
process.env.CI = 'false';
runStep('Client build', 'npm --prefix client run build');

console.log('\nBuild completed successfully!');