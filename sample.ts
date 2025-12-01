import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'output', 'jobs.json');

try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    if (Array.isArray(jsonData)) {
        console.log(jsonData.length);
    } else if (typeof jsonData === 'object' && jsonData !== null) {
        console.log(Object.keys(jsonData).length);
    } else {
        console.log(0); // For primitive JSON values (string, number, boolean, null)
    }
} catch (error: any) {
    console.error(`Error reading or parsing ${filePath}: ${error.message}`);
}
