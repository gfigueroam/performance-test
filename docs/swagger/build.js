import fs from 'fs';
import jsonRefs from 'json-refs';
import jsonFile from 'jsonfile';
import yaml from 'yaml-js';

const resolveRefs = jsonRefs.resolveRefs;

const root = yaml.load(
  fs.readFileSync('docs/swagger/v1/index.yml').toString(),
);

const options = {
  filter: ['relative', 'remote'],
  loaderOptions: {
    processContent: (res, cb) => {
      cb(null, yaml.load(res.text));
    },
  },
};

resolveRefs(root, options).then(results => {
  jsonFile.writeFile(
    'static/swagger/api-docs.json',
    results.resolved,
    { spaces: 4 },
    error => {
      if (error) {
        console.error('Swagger Doc generation failed!', error);
      } else {
        console.log('Generated swagger docs');
      }
    },
  );
});
