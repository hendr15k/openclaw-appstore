var API_BASE = 'https://api.github.com/repos';

function fetchRelease(owner, repo, tag) {
    var url = API_BASE + '/' + owner + '/' + repo + '/releases/tags/' + tag;
    return fetch(url)
        .then(function(r) { return r.ok ? r.json() : null; })
        .catch(function() { return fetch(API_BASE + '/' + owner + '/' + repo + '/releases/latest').then(function(r) { return r.ok ? r.json() : null; }).catch(function(){ return null; }); });
}

function buildAppCard(app, release) {
    var version = release ? release.tag_name : 'N/A';
    var published = release ? new Date(release.published_at).toLocaleDateString('de-DE') : '';
    var totalDownloads = release ? (release.assets || []).reduce(function(s, a) { return s + (a.download_count || 0); }, 0) : 0;
    var assets = (release && release.assets) || [];
    var apkAssets = assets.filter(function(a) { return a.name && a.name.toLowerCase().endsWith('.apk'); });
    var downloadBtns = '';
    if (apkAssets.length > 0) {
        apkAssets.forEach(function(a) {
            var isDebug = a.name.indexOf('debug') >= 0;
            var isUnsigned = a.name.indexOf('unsigned') >= 0;
            var label = isDebug ? 'Debug APK' : isUnsigned ? 'Unsigned' : 'Release APK';
            var size = a.size ? Math.round(a.size / 1024 / 1024) + ' MB' : '';
            downloadBtns += '<a href="' + a.browser_download_url + '" class="download-btn ' + (isDebug || isUnsigned ? 'secondary' : 'primary') + '" target="_blank" rel="noopener">⬇️ ' + label + ' <span class="size">' + size + '</span></a>';
        });
    } else {
        downloadBtns = '<a href="https://github.com/' + app.owner + '/' + app.repo + '/releases" class="download-btn primary" target="_blank" rel="noopener">⬇️ Alle Releases öffnen</a>';
    }
    var releaseUrl = 'https://github.com/' + app.owner + '/' + app.repo + '/releases';
    var releaseNotes = '';
    if (release && release.body) {
        var bodyText = release.body.replace(/```[\s\S]*?```/g, '').replace(/#{1,6}\s?/g, '').trim();
        var excerpt = bodyText.length > 200 ? bodyText.substring(0, 200) + '...' : bodyText;
        if (excerpt) releaseNotes = '<div style="margin-top:10px;padding:8px 12px;background:rgba(108,99,255,.05);border-radius:8px;font-size:.8em;color:var(--text-muted);max-height:60px;overflow:hidden"><strong style="color:var(--accent);font-size:.85em">Release Notes:</strong> ' + excerpt.replace(/\n/g, ' ') + '</div>';
    }

    return '<div class="app-card" data-category="' + (app.category || 'General') + '">' +
        '<div class="app-header">' +
            '<div class="app-icon" style="background:' + app.iconBg + '">' + app.icon + '</div>' +
            '<div class="app-info">' +
                '<h2>' + app.id + '</h2>' +
                '<div class="subtitle">' + app.tagLine + '</div>' +
                '<div class="app-meta">' +
                    '<span class="badge">v' + version + '</span>' +
                    (published ? '<span>📅 ' + published + '</span>' : '') +
                    (totalDownloads > 0 ? '<span>⬇️ ' + totalDownloads.toLocaleString('de-DE') + ' Downloads</span>' : '') +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="app-features">' +
            '<div class="feature-list">' +
                app.features.map(function(f) { return '<span class="feature">' + f + '</span>'; }).join('') +
            '</div>' +
            '<p style="color:var(--text-muted);font-size:.9em">' + app.description + '</p>' + (app.screenshot ? '<a href="#" onclick="openModal(\'' + app.screenshot + '\');return false"><img src="' + app.screenshot + '" alt="Screenshot" style="width:100%;max-width:200px;border-radius:8px;margin-top:8px;box-shadow:0 4px 15px rgba(0,0,0,.3);cursor:pointer" loading="lazy" /></a>' : '') + releaseNotes +
        '</div>' +
        '<div class="app-downloads">' +
            downloadBtns +
            '<a href="' + releaseUrl + '" class="download-btn secondary" target="_blank" rel="noopener">📂 Release-Seite</a>' +
        '</div>' +
    '</div>';
}

function loadAppStore() {
    var loaded = 0;
    var html = '';
    APPS.forEach(function(app) {
        fetchRelease(app.owner, app.repo, app.releaseTag).then(function(release) {
            html += buildAppCard(app, release);
            loaded++;
            if (loaded === APPS.length) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('appGrid').innerHTML = html;
                initCategoryFilter();
            }
        }).catch(function() {
            html += buildAppCard(app, null);
            loaded++;
            if (loaded === APPS.length) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('appGrid').innerHTML = html;
                initCategoryFilter();
            }
        });
    });
}

loadAppStore();

var activeCategory = 'all';

function filterByCategory(cat, btn) {
    activeCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(function(p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    applyFilters();
}

function initCategoryFilter() {
    var counts = { all: APPS.length };
    var cats = [];
    APPS.forEach(function(app) {
        var cat = app.category || 'General';
        if (!counts[cat]) { counts[cat] = 0; cats.push(cat); }
        counts[cat]++;
    });
    var container = document.getElementById('categoryFilter');
    document.getElementById('count-all').textContent = counts.all;
    cats.forEach(function(cat) {
        var btn = document.createElement('button');
        btn.className = 'cat-pill';
        btn.setAttribute('data-cat', cat);
        btn.innerHTML = cat + ' <span class="count">' + counts[cat] + '</span>';
        btn.onclick = function() { filterByCategory(cat, btn); };
        container.appendChild(btn);
    });
}

function applyFilters() {
    var q = (document.getElementById('searchInput') || {}).value || '';
    var qLower = q.toLowerCase();
    var cards = document.querySelectorAll('.app-card');
    cards.forEach(function(card) {
        var matchCat = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
        var matchSearch = !qLower || card.textContent.toLowerCase().indexOf(qLower) !== -1;
        card.style.display = matchCat && matchSearch ? '' : 'none';
    });
}

function filterApps(query) {
    applyFilters();
}

function openModal(src) {
    document.getElementById('modalImage').src = src;
    document.getElementById('screenshotModal').classList.add('active');
}
function closeModal() {
    document.getElementById('screenshotModal').classList.remove('active');
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function() {});
}

var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'block';
});
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(result) {
            document.getElementById('installBtn').style.display = 'none';
            deferredPrompt = null;
        });
    }
}
