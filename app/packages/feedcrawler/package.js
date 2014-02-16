Npm.depends({
  'feedparser': '0.16.5',
  'cheerio': '0.13.1',
  'kue': '0.6.2'
});

Package.on_use(function (api) {
  api.use('underscore', 'server');
  api.use('coffeescript', 'server');
  api.add_files('feedDetector.js', ["server"]);
  // api.export && api.export(['FeedDetector'], ["server", "client"]);
});

Package.on_test(function (api) {
  // api.use('accounts-password');
});