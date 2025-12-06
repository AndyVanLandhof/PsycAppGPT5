// Allowed sources for Edexcel English Literature (9ET0)

export const ENGLIT_PRIMARY_TEXTS = [
  { id: 'hamlet', label: 'Hamlet — William Shakespeare' },
  { id: 'waiting-for-godot', label: 'Waiting for Godot — Samuel Beckett' },
  { id: 'heart-of-darkness', label: 'Heart of Darkness — Joseph Conrad' },
  { id: 'lonely-londoners', label: 'The Lonely Londoners — Sam Selvon' },
  {
    id: 'poems-of-the-decade',
    label: 'Poems of the Decade (Edexcel anthology)',
    poems: [
      'Eat Me — Patience Agbabi',
      'Chainsaw Versus the Pampas Grass — Simon Armitage',
      'Material — Ros Barber',
      'History — John Burnside',
      'An Easy Passage — Julia Copus',
      'The Deliverer — Tishani Doshi',
      'The Lammas Hireling — Ian Duhig',
      'To My Nine-Year-Old Self — Helen Dunmore',
      'A Minor Role — U A Fanthorpe',
      'The Gun — Vicki Feaver',
      "The Furthest Distances I've Travelled — Leontia Flynn",
      'Giuseppe — Roderick Ford',
      'Out of the Bag — Seamus Heaney',
      'Effects — Alan Jenkins',
      'Genetics — Sinéad Morrissey',
      'From the Journal of a Disappointed Man — Andrew Motion',
      'Look We Have Coming to Dover! — Daljit Nagra',
      'Please Hold — Ciaran O’Driscoll',
      'On Her Blindness — Adam Thorpe',
      'Ode on a Grayson Perry Urn — Tim Turnbull'
    ]
  },
  { id: 'keats-selected', label: 'Selected Poems — John Keats (e.g., major Odes)' }
];

export const ENGLIT_CRITICAL_WORKS = [
  { author: 'A. C. Bradley', title: 'Shakespearean Tragedy', year: 1904 },
  { author: 'T. S. Eliot', title: 'Hamlet and His Problems', year: 1919 },
  { author: 'Harold Bloom', title: 'Shakespeare: The Invention of the Human', year: 1998 },
  { author: 'Martin Esslin', title: 'The Theatre of the Absurd', year: 1961 },
  { author: 'Chinua Achebe', title: 'An Image of Africa: Racism in Conrad’s Heart of Darkness', year: 1977 },
  { author: 'Edward Said', title: 'Culture and Imperialism', year: 1993 },
  { author: 'F. R. Leavis', title: 'The Great Tradition', year: 1948 }
];

export function buildEnglishSourcePolicy() {
  const primary = ENGLIT_PRIMARY_TEXTS.map(t => `- ${t.label}`).join('\n');
  const critics = ENGLIT_CRITICAL_WORKS.map(c => `- ${c.author}, ${c.title} (${c.year})`).join('\n');
  return (
    `Source Policy (English Literature 9ET0):\n\n` +
    `Use ONLY these primary texts and recognised critical works. Do not introduce other texts or critics. ` +
    `If information is not available from this set, say you cannot answer with the approved sources.\n\n` +
    `PRIMARY TEXTS:\n${primary}\n\n` +
    `RECOGNISED CRITICAL WORKS:\n${critics}\n\n` +
    `Quoting policy: For copyrighted works, provide only short quotations (<= 90 characters) and prefer paraphrase with precise act/scene/line (or chapter/section) references. ` +
    `Avoid block quotes. If a longer quotation is requested, refuse and offer a summary.\n`);
}





