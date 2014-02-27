Package.describe({
  summary: 'Logging logic"'
});

Npm.depends({
    "winston": "0.7.2"
});

Package.on_use(function (api, where) {
  api.add_files('winston.js', 'server');
  if (api.export) {
  api.export("Winston", "server");
  }
});