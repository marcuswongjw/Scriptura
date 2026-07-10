// Pure / near-pure helpers (Phase 1 extract)

export function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function formatMarkdown(content) {
  if (!content) return '';
  return content.split('\n\n').map(p => {
    const lines = p.split('\n');
    let isList = false;
    let isNumbered = false;
    const listItems = [];
    const nonListItems = [];
    
    const applyInline = t => t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Replace single asterisks that are not part of a ** pair.
      .replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, '$1<em>$2</em>$3')
      .replace(/^###\s*(.+)/, '<h3>$1</h3>')
      .replace(/^##\s*(.+)/, '<h2>$1</h2>')
      .replace(/^#\s*(.+)/, '<h1>$1</h1>')
      .replace(/^> (.+)/, '<blockquote>$1</blockquote>');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^\d+\.\s/)) {
        isNumbered = true;
        listItems.push(`<li>${applyInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        isList = true;
        listItems.push(`<li>${applyInline(trimmed.substring(2))}</li>`);
      } else if (trimmed.startsWith('> ')) {
        nonListItems.push(`<blockquote>${applyInline(trimmed.substring(2))}</blockquote>`);
      } else if (trimmed.startsWith('### ')) {
        nonListItems.push(`<h3>${applyInline(trimmed.substring(4))}</h3>`);
      } else if (trimmed.startsWith('## ')) {
        nonListItems.push(`<h2>${applyInline(trimmed.substring(3))}</h2>`);
      } else if (trimmed.startsWith('# ')) {
        nonListItems.push(`<h1>${applyInline(trimmed.substring(2))}</h1>`);
      } else {
        nonListItems.push(applyInline(line));
      }
    });
    
    if (isNumbered) {
      return `${nonListItems.length > 0 ? `<p>${nonListItems.join('<br>')}</p>` : ''}<ol>${listItems.join('')}</ol>`;
    } else if (isList) {
      return `${nonListItems.length > 0 ? `<p>${nonListItems.join('<br>')}</p>` : ''}<ul>${listItems.join('')}</ul>`;
    } else {
      return `<p>${nonListItems.join('<br>')}</p>`;
    }
  }).join('');
}
