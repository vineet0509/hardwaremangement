const fs = require('fs');
const path = require('path');

function replaceAlerts(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains `alert(`
    if (!content.includes('alert(')) return;

    // Replace all alert( with Swal.fire(
    content = content.replace(/\balert\(/g, 'Swal.fire(');

    // If Swal is not imported, add it to the top
    if (!content.includes("import Swal from 'sweetalert2'")) {
        // Find the last import statement
        const importRegex = /^import\s+.*?;?\s*$/gm;
        let lastMatch = null;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatch = match;
        }

        const importStatement = "import Swal from 'sweetalert2';\n";
        
        if (lastMatch) {
            const insertPos = lastMatch.index + lastMatch[0].length;
            content = content.slice(0, insertPos) + '\n' + importStatement + content.slice(insertPos);
        } else {
            content = importStatement + content;
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceAlerts(fullPath);
        }
    });
}

processDirectory(path.join(__dirname, 'resources', 'js', 'components'));
processDirectory(path.join(__dirname, 'resources', 'js', 'utils'));
console.log('Finished replacing remaining alerts.');
