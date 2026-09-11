import {
  catalogFileName,
  emptySongDraft,
  isValidDraft,
  parseCatalogText,
  slugify,
  songSlug,
  validateSongDraft,
} from '../song/authoring';

function draft(overrides: Partial<ReturnType<typeof emptySongDraft>> = {}) {
  return { ...emptySongDraft(), title: 'Como el ciervo', artist: 'Marcos Witt', body: 'G\nLetra', ...overrides };
}

describe('validateSongDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateSongDraft(draft())).toEqual({});
    expect(isValidDraft(draft())).toBe(true);
  });

  it('requires title, artist and body', () => {
    const errors = validateSongDraft(draft({ title: '  ', artist: '', body: '\n' }));
    expect(errors.title).toMatch(/required/i);
    expect(errors.artist).toMatch(/required/i);
    expect(errors.body).toBeTruthy();
  });

  it('bounds bpm and capo', () => {
    expect(validateSongDraft(draft({ bpm: 401 })).bpm).toMatch(/between 0 and 400/);
    expect(validateSongDraft(draft({ bpm: -1 })).bpm).toBeTruthy();
    expect(validateSongDraft(draft({ capo: 13 })).capo).toMatch(/between 0 and 12/);
    expect(validateSongDraft(draft({ capo: -1 })).capo).toBeTruthy();
    // Boundary values are valid.
    expect(validateSongDraft(draft({ bpm: 400, capo: 12 }))).toEqual({});
  });

  it('rejects an oversized body', () => {
    expect(validateSongDraft(draft({ body: 'x'.repeat(50001) })).body).toMatch(/too large/i);
  });
});

describe('slugify / songSlug', () => {
  it('strips accents and punctuation', () => {
    expect(slugify('A quién iré')).toBe('a-quien-ire');
    expect(slugify('  ¡Gracia   Sublime Es!  ')).toBe('gracia-sublime-es');
  });

  it('builds a title+artist slug and file name', () => {
    expect(songSlug({ title: 'A quién iré', artist: 'Luis Enrrique Espinosa' })).toBe(
      'a-quien-ire-luis-enrrique-espinosa',
    );
    expect(catalogFileName({ title: 'A quién iré', artist: 'Luis Enrrique Espinosa' })).toBe(
      'a-quien-ire-luis-enrrique-espinosa.json',
    );
  });

  it('falls back to untitled when there is nothing to slug', () => {
    expect(songSlug({ title: '   ', artist: '' })).toBe('untitled');
  });
});

describe('parseCatalogText', () => {
  const FILE = [
    'A quién iré',
    'Luis Enrrique Espinosa',
    '',
    '[Intro]',
    'G A Bm F#m',
    '',
    '[Verso]',
    'D\t                       Bm',
    '¿A quién iré en necesidad?',
  ].join('\n');

  it('reads title, artist and key from the file name', () => {
    const { draft: parsed, warnings } = parseCatalogText(FILE, 'A quién iré - Luis Enrrique Espinosa (D).txt');
    expect(parsed.title).toBe('A quién iré');
    expect(parsed.artist).toBe('Luis Enrrique Espinosa');
    expect(parsed.key).toBe('D');
    expect(parsed.body.startsWith('[Intro]')).toBe(true);
    expect(warnings).toEqual([]);
  });

  it('reads a capo marker', () => {
    const { draft: parsed } = parseCatalogText('Hay Libertad\n\n[Coro]\nG D', 'Hay Libertad (Capo5).txt');
    expect(parsed.capo).toBe(5);
    expect(parsed.title).toBe('Hay Libertad');
  });

  it('keeps non-metadata parentheses out of the title', () => {
    const { draft: parsed, warnings } = parseCatalogText('[Coro]\nG', 'Abre mis ojos - Vertical (E) v2.txt');
    expect(parsed.title).toBe('Abre mis ojos');
    expect(parsed.artist).toBe('Vertical');
    expect(parsed.key).toBe('E');
    expect(warnings.some((w) => /revision marker/i.test(w))).toBe(true);
  });

  it('takes the artist from the content when the file name has none', () => {
    const { draft: parsed, warnings } = parseCatalogText(FILE, 'A quién iré (D).txt');
    expect(parsed.artist).toBe('Luis Enrrique Espinosa');
    expect(warnings.some((w) => /file name has no artist/i.test(w))).toBe(true);
  });

  it('warns when there is no section header', () => {
    const source = 'Poema de salvación\nAutor\n\nG  D\nLetra aquí';
    const { draft: parsed, warnings } = parseCatalogText(source, 'Poema de salvación.txt');
    expect(parsed.title).toBe('Poema de salvación');
    expect(parsed.body).toBe('G  D\nLetra aquí');
    expect(warnings.some((w) => /Section/i.test(w))).toBe(true);
  });

  it('returns a valid draft for a well-formed file', () => {
    const { draft: parsed } = parseCatalogText(FILE, 'A quién iré - Luis Enrrique Espinosa (D).txt');
    expect(isValidDraft(parsed)).toBe(true);
  });
});
