// Shared markdown helpers for preview/post rendering
export function underscoreToUnderline(md: string) {
  if (!md) return md;
  let i = 0;
  let out = '';
  let inFence = false;
  let inInlineCode = false;
  while (i < md.length) {
    if (!inInlineCode && md.startsWith('```', i)) {
      inFence = !inFence;
      out += '```';
      i += 3;
      continue;
    }
    const ch = md[i];
    if (!inFence && ch === '`') {
      inInlineCode = !inInlineCode;
      out += ch;
      i += 1;
      continue;
    }
    if (!inFence && !inInlineCode && md.startsWith('__', i)) {
      const start = i + 2;
      const end = md.indexOf('__', start);
      if (end !== -1) {
        const inner = md.slice(start, end);
        out += `<u>${inner}</u>`;
        i = end + 2;
        continue;
      }
    }
    out += md[i];
    i += 1;
  }
  return out;
}

export function convertSingleNewlinesToParagraphs(md: string) {
  if (!md) return md;
  const lines = md.split('\n');
  let inFence = false;
  const outLines: string[] = [];

  const isListLine = (s: string) => /^\s*([*\-+]\s+|\d+\.\s+)/.test(s);

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      outLines.push(line);
      continue;
    }
    if (inFence) {
      outLines.push(line);
      continue;
    }
    const next = lines[idx + 1];
    outLines.push(line);
    if (typeof next !== 'undefined' && line.trim() !== '' && next.trim() !== '' && !isListLine(line) && !isListLine(next)) {
      outLines.push('');
    }
  }

  return outLines.join('\n');
}

export function transformForPreview(md: string) {
  if (!md) return md;
  return underscoreToUnderline(convertSingleNewlinesToParagraphs(md));
}
