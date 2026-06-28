export function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj');
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function createPuzzle(level) {
  const final = randomItem(level.finals);
  const selectedColumns = shuffle(final.columns).slice(0, 4);

  return {
    finalAnswer: final.answer,
    columns: selectedColumns.map((column) => ({
      answer: column.answer,
      clues: shuffle(column.clues).slice(0, 4),
    })),
  };
}

export async function createBlitzPuzzle(level, clueCount = 4) {
  const final = randomItem(level.finals);
  const column = randomItem(final.columns);

  return {
    answer: column.answer,
    categoryTitle: level.title,
    clues: shuffle(column.clues).slice(0, clueCount),
  };
}
