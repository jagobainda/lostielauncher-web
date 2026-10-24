# TODO

## Pending

- Production CSP: if `script-src` forbids inline scripts, allow the platform detection script in `LandingPage.astro` by hash. Otherwise Android visitors see the Windows version until they switch manually.
- Production CSP: the launcher replicas load game logos and the launcher logo from `https://ericlostie-launcher.jagoba.dev`; `img-src` must allow that origin.
- Android download link: the APK URL is versioned and resolved at build time from `latest.json`, so a new APK needs a site rebuild (or a stable `LostieLauncher.apk` alias on the CDN).
