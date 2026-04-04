const fs = require('fs');
const path = require('path');
const www = path.join(__dirname, '..', 'www');
const html = fs.readFileSync(path.join(www, 'index.html'), 'utf-8');

// Also check JS files for features that moved to app.js
const jsFiles = fs.readdirSync(www).filter(function(f) { return f.endsWith('.js'); });
var allCode = html;
jsFiles.forEach(function(f) {
    allCode += '\n' + fs.readFileSync(path.join(www, f), 'utf-8');
});

let score = 0;
let lines = [];
function report(category, pass, msg) {
  score += pass ? 1 : 0;
  lines.push(category + (pass ? '  \u2713 ' : '  \u2717 ') + msg);
}

// PERF 1: Total file size < 10KB
const fsize = fs.statSync(path.join(www, 'index.html')).size;
report('PERF', fsize < 10240, 'File size < 10KB (' + fsize + ')');

// PERF 2: Non-blocking scripts (external JS with defer/async; inline data scripts OK)
const hasExternalScriptTag = html.indexOf('<script defer src=') !== -1 || html.indexOf('<script async src=') !== -1;
// Count inline JS scripts that are NOT just data assignment
const inlineScripts = html.split('<script>');
let heavyInlineScripts = 0;
for (var i = 1; i < inlineScripts.length; i++) {
  var content = inlineScripts[i].split('</script>')[0].trim();
  if (content.length > 200) heavyInlineScripts++; // data blobs < 200 chars are fine
}
report('PERF', hasExternalScriptTag && heavyInlineScripts === 0, 'Non-blocking scripts (external code with defer/async)');

// PERF 3: All images lazy-loaded
const imgTags = (allCode.match(/<img[^>]*>/g) || []);
const lazyCount = imgTags.filter(function(t) { return t.indexOf('loading="lazy"') !== -1; }).length;
report('PERF', imgTags.length > 0 && lazyCount === imgTags.length, 
  'All images lazy-loaded (' + lazyCount + '/' + imgTags.length + ')');

// FEAT 1: Release notes excerpt
report('FEAT', /releaseNote|release_notes|release.*body/i.test(allCode), 'Release notes excerpt');

// FEAT 2: App search/filter
report('FEAT', /searchInput|searchBox|searchBar|oninput.*filter/i.test(allCode), 'App search/filter');

// FEAT 3: Full-screen screenshot modal
report('FEAT', (allCode.indexOf('modal') !== -1 || allCode.indexOf('lightbox') !== -1) && allCode.indexOf('screenshot') !== -1, 'Screenshot modal');

// FEAT 4: PWA install prompt UI
report('FEAT', /beforeinstallprompt|installPrompt|install.*button/i.test(allCode), 'PWA install prompt UI');

// FEAT 5: Category/tag grouping
report('FEAT', /data-category|category.*group|categoryFilter/i.test(allCode), 'Category/tag grouping');

// VIS 1: Entrance animations (@keyframes with animation timing, excluding only spinner)
const hasKeyframes = allCode.indexOf('@keyframes') !== -1;
// find animation properties that are NOT just the spinner
const animLines = allCode.match(/animation[^;]*;/g) || allCode.match(/animation[^;}]*[;}]/g) || [];
const nonSpinner = animLines.filter(function(a) { return a.indexOf('spin') === -1; });
report('VIS', hasKeyframes && nonSpinner.length > 0, 'Entrance animations (' + nonSpinner.length + ' non-spinner)');

// VIS 2: Skeleton loading state
report('VIS', allCode.indexOf('skeleton') !== -1 || allCode.indexOf('shimmer') !== -1, 'Skeleton loading state');

// VIS 3: Responsive grid (2+ columns)
report('VIS', /grid-template-columns.*repeat|repeat.*auto-fill|repeat.*minmax|grid-template-columns.*[2-9]|minmax\(\d+px.*1fr/i.test(allCode), 'Responsive 2+ column grid');

// VIS 4: Version history tooltip
report('VIS', /versionHistory|version-history|historyTooltip/i.test(allCode), 'Version history tooltip');

console.log('SCORE: ' + score + '/12');
lines.forEach(function(l) { console.log(l); });
