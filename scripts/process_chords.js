/**
 * Phase 1: Process raw chord data from third-party/chords-db
 * Generate cleaned, optimized JSON files for shared/data/
 */

const fs = require('fs');
const path = require('path');

// Read raw data
const guitarRaw = JSON.parse(fs.readFileSync('third-party/chords-db/lib/guitar.json', 'utf8'));
const pianoRaw = JSON.parse(fs.readFileSync('third-party/chords-db/lib/piano.json', 'utf8'));
const ukuleleRaw = JSON.parse(fs.readFileSync('third-party/chords-db/lib/ukulele.json', 'utf8'));

function processGuitarChords(raw) {
  const result = {};
  
  // raw.chords has format: { "C": [{key, suffix, positions}, ...], "C#": {...}, ... }
  const keys = raw.chords || {};
  
  for (const [note, chordList] of Object.entries(keys)) {
    result[note] = [];
    
    for (const chord of chordList) {
      const { key, suffix, positions } = chord;
      
      // Optimize positions - keep only unique ones, remove duplicates
      const uniquePositions = positions.filter((pos, index, self) => 
        index === self.findIndex(p => 
          p.frets.join(',') === pos.frets.join(',') &&
          p.fingers.join(',') === pos.fingers.join(',') &&
          p.baseFret === pos.baseFret &&
          JSON.stringify(p.barres) === JSON.stringify(pos.barres)
        )
      );
      
      result[note].push({
        key,
        suffix,
        displayName: `${note} ${suffix}`,
        positions: uniquePositions
      });
    }
  }
  
  return result;
}

function processPianoChords(raw) {
  const result = {};
  const keys = raw.chords || {};
  
  for (const [note, chordList] of Object.entries(keys)) {
    result[note] = [];
    
    for (const chord of chordList) {
      const { key, suffix, positions } = chord;
      
      // Piano has single position per chord, just normalize
      const position = positions[0];
      if (!position) continue;
      
      result[note].push({
        key,
        suffix,
        displayName: `${key} ${suffix}`,
        positions: [{
          frets: position.frets, // note names like ["C", "E", "G"]
          fingers: position.fingers,
          midi: position.midi
        }]
      });
    }
  }
  
  return result;
}

function processUkuleleChords(raw) {
  const result = {};
  const keys = raw.chords || {};
  
  for (const [note, chordList] of Object.entries(keys)) {
    result[note] = [];
    
    for (const chord of chordList) {
      const { key, suffix, positions } = chord;
      
      // Ukulele has 4 strings, optimize positions
      const uniquePositions = positions.filter((pos, index, self) => 
        index === self.findIndex(p => 
          p.frets.join(',') === pos.frets.join(',') &&
          p.fingers.join(',') === pos.fingers.join(',')
        )
      );
      
      result[note].push({
        key,
        suffix,
        displayName: `${note} ${suffix}`,
        positions: uniquePositions
      });
    }
  }
  
  return result;
}

// Generate cleaned files
const guitarChords = processGuitarChords(guitarRaw);
const pianoChords = processPianoChords(pianoRaw);
const ukuleleChords = processUkuleleChords(ukuleleRaw);

// Write output files
fs.writeFileSync('shared/data/guitar_chords.json', JSON.stringify(guitarChords, null, 2));
fs.writeFileSync('shared/data/piano_chords.json', JSON.stringify(pianoChords, null, 2));
fs.writeFileSync('shared/data/ukulele_chords.json', JSON.stringify(ukuleleChords, null, 2));

console.log('✅ Phase 1 data processing complete!');
console.log('   - shared/data/guitar_chords.json');
console.log('   - shared/data/piano_chords.json');
console.log('   - shared/data/ukulele_chords.json');