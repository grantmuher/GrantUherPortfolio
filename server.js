import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Configure custom MIME types for 3D models and documents
express.static.mime.define({
  'model/gltf-binary': ['glb'],
  'model/gltf+json': ['gltf'],
  'application/step': ['step', 'stp'],
  'application/pdf': ['pdf', 'PDF']
});

app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    } else if (filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio server running on http://0.0.0.0:${PORT}`);
});
