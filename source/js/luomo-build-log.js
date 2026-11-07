(() => {
  const section = document.getElementById('build-log-merges');
  if (!section || section.dataset.requested) return;
  section.dataset.requested = 'true';

  const formatDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' });
  const repository = 'https://github.com/luomo66ccff/hexo';

  async function showMerges() {
    const response = await fetch('/build-log/merges.json', { credentials: 'omit' });
    if (!response.ok) return;
    const { entries } = await response.json();
    if (!Array.isArray(entries) || !section.isConnected) return;

    const fragment = document.createDocumentFragment();
    const seen = new Set();
    for (const entry of entries) {
      if (!entry || !Number.isSafeInteger(entry.number) || entry.number < 1 ||
          typeof entry.title !== 'string' || !entry.title.trim() ||
          typeof entry.mergedAt !== 'string' || seen.has(entry.number)) continue;
      const date = new Date(entry.mergedAt);
      if (Number.isNaN(date.getTime())) continue;
      seen.add(entry.number);

      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = '<div class="timeline-dot"></div><time class="timeline-date"></time>' +
        '<div class="timeline-content"><h3><a></a></h3></div>';
      const time = item.querySelector('time');
      time.dateTime = date.toISOString();
      time.textContent = formatDate.format(date);
      const link = item.querySelector('a');
      link.href = `${repository}/pull/${entry.number}`;
      link.textContent = `${entry.title.trim()} · #${entry.number}`;
      fragment.append(item);
    }

    if (!fragment.childElementCount) return;
    section.querySelector('.timeline').replaceChildren(fragment);
    section.hidden = false;
  }

  showMerges().catch(() => {
    // The authored timeline remains readable if the public feed is unavailable.
  });
})();
