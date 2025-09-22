// swagger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function setupSwagger(app, route = '/api-docs') {
  // file expected in project root (same folder as index.js)
  const yamlPath = path.resolve(__dirname, 'openapi.yaml');

  let doc = null;

  if (fs.existsSync(yamlPath)) {
    try {
      const file = fs.readFileSync(yamlPath, 'utf8');
      doc = yaml.load(file);
      console.log(`Swagger: Loaded openapi.yaml from ${yamlPath}`);
    } catch (err) {
      console.error('Swagger: Failed to load openapi.yaml -', err);
    }
  } else {
    console.warn(`Swagger: openapi.yaml not found at ${yamlPath}. Using fallback spec.`);
  }

  // fallback minimal spec if YAML missing or failed to load
  if (!doc) {
    doc = {
      openapi: '3.0.3',
      info: { title: 'ParkVech API (fallback)', version: '0.0.0' },
      servers: [{ url: 'http://localhost:5000' }],
      paths: { '/': { get: { summary: 'Server alive', responses: { '200': { description: 'OK' } } } } }
    };
  }

  app.use(route, swaggerUi.serve, swaggerUi.setup(doc));

  // optional: raw JSON endpoint
  app.get('/swagger.json', (req, res) => res.json(doc));
}
