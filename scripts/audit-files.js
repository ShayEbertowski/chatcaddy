// scripts/audit-files.js


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// To run: node scripts/audit-files.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const fs = require('fs');
const path = require('path');

// Define your project structure rules
const SEARCH_DIRS = [
    'src',
    'ChatCaddy',
    'apps'
];

const COMPONENTS_DIRS = ['components', 'shared', 'editor', 'modals'];
const UTILS_DIRS = ['utils', 'stores', 'hooks', 'types', 'theme'];

// Build full file index
let allFiles = [];
SEARCH_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) walk(dir);
});

function walk(dir) {
    const entries = fs.readdirSync(dir);
    for (const file of entries) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (['node_modules', '.git', 'dist', 'build', '.expo'].includes(file)) {
                continue; // skip ignored folders
            }
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            allFiles.push(fullPath);
        }
    }
}


// Read all code into one big string
let allCode = '';
allFiles.forEach(file => {
    allCode += fs.readFileSync(file, 'utf8');
});

// PHASE 1: Unused files
console.log('\n=== UNUSED FILES ===');
allFiles.forEach(file => {
    const basename = path.basename(file).replace(/\.(ts|tsx)$/, '');
    const importRegex = new RegExp(`['"\`./]${basename}['"\`]`, 'g');
    if (!importRegex.test(allCode)) {
        console.log(`[UNUSED] ${file}`);
    }
});

// PHASE 2: Potential misplaced files
console.log('\n=== POSSIBLY MISPLACED FILES ===');
allFiles.forEach(file => {
    const relPath = file.replace(`${process.cwd()}/`, '');
    const folders = relPath.split(path.sep);

    if (folders.includes('components')) {
        const utilsMatch = UTILS_DIRS.some(dir => relPath.includes(`/${dir}/`));
        if (utilsMatch) {
            console.log(`[COMPONENT IN UTILS] ${file}`);
        }
    }
    if (folders.includes('utils')) {
        const compMatch = COMPONENTS_DIRS.some(dir => relPath.includes(`/${dir}/`));
        if (compMatch) {
            console.log(`[UTIL IN COMPONENTS] ${file}`);
        }
    }
});
