Npm.depends({
  'feedparser': '0.16.5'
});

Package.on_use(function (api) {
  // api.use('accounts-password');
  api.add_files('feedDetector.js', ["server", "client"]);
  api.export && api.export(['FeedDetector'], ["server", "client"]);
});

Package.on_test(function (api) {
  // api.use('accounts-password');
});