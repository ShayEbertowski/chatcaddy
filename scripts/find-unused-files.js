// scripts/find-unused-files.js

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// To run: node scripts/find-unused-files.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


const fs = require('fs');
const path = require('path');

// Adjust to point to your repo folders
const SEARCH_DIRS = [
    'src/components',
    'src/stores',
    'src/utils',
    'ChatCaddy/components',
    'ChatCaddy/hooks'
];

// Build index of all files
let files = [];

SEARCH_DIRS.forEach(dir => {
    walk(dir);
});

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            files.push(fullPath);
        }
    });
}

// Build index of all project content
const allCode = fs.readFileSync('./package.json', 'utf8') +
    SEARCH_DIRS.map(dir => readAll(dir)).join('\n');

function readAll(dir) {
    let output = '';
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            output += readAll(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            output += fs.readFileSync(fullPath, 'utf8');
        }
    });
    return output;
}

// Scan for unused files
files.forEach(file => {
    const basename = path.basename(file).replace(/\.(ts|tsx)$/, '');
    const search = new RegExp(basename, 'g');

    if (!search.test(allCode)) {
        console.log(`[UNUSED] ${file}`);
    }
});
