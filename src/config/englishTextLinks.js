// Public-domain or freely readable canonical links where possible
//
// Prefer local chunked texts when available to avoid external links.
// These map to files under /public/vault/English Literature/.
export function getEnglishTextURL(topicId, partId) {
  switch (topicId) {
    case 'hamlet':
      return '/vault/English%20Literature/The%20Tragedy%20of%20Hamlet_extracted.txt';
    case 'heart-of-darkness':
      // The filename is long; ensure URL encoding of special chars/spaces
      return '/vault/English%20Literature/InsideArc%20%E2%80%94%20https:cdn.fulltextarchive.com:wp-content:uploads:wp-advanced-pdf:1:Heart-of-Darkness_extracted.txt';
    case 'waiting-for-godot':
      return '/vault/English%20Literature/waiting%20for%20godot_extracted.txt';
    case 'lonely-londoners':
      return '/vault/English%20Literature/the-lonely-londoners-by-selvon-sam-z-lib-org_extracted.txt';
    case 'keats-selected': {
      // For Keats, fall back to public-domain links
      const m = {
        'poem-ode-to-a-nightingale': 'https://en.wikisource.org/wiki/Ode_to_a_Nightingale_(Keats)',
        'poem-ode-on-a-grecian-urn': 'https://en.wikisource.org/wiki/Ode_on_a_Grecian_Urn_(Keats)',
        'poem-ode-on-melancholy': 'https://en.wikisource.org/wiki/Ode_on_Melancholy_(Keats)',
        'poem-ode-to-psyche': 'https://en.wikisource.org/wiki/Ode_to_Psyche_(Keats)',
        'poem-to-autumn': 'https://en.wikisource.org/wiki/To_Autumn_(Keats)',
        'poem-la-belle-dame': 'https://en.wikisource.org/wiki/La_Belle_Dame_sans_Merci_(Keats)',
        'poem-bright-star': 'https://en.wikisource.org/wiki/Bright_star!_would_I_were_steadfast_as_thou_art',
        'poem-chapmans-homer': 'https://en.wikisource.org/wiki/On_First_Looking_into_Chapman%27s_Homer',
        'poem-eve-of-st-agnes': 'https://en.wikisource.org/wiki/The_Eve_of_St._Agnes'
      };
      return m[partId] || 'https://en.wikisource.org/wiki/John_Keats';
    }
    case 'poems-of-the-decade':
      // Anthology is copyrighted; no public-domain text
      return null;
    default:
      return null;
  }
}

// Chunked JSON paths (used to slice to the specific act/scene/section)
export function getEnglishChunksURL(topicId) {
  switch (topicId) {
    case 'hamlet':
      return '/vault/English%20Literature/The%20Tragedy%20of%20Hamlet_chunks.json';
    case 'waiting-for-godot':
      return '/vault/English%20Literature/waiting%20for%20godot_chunks.json';
    case 'heart-of-darkness':
      return '/vault/English%20Literature/InsideArc%20%E2%80%94%20https:cdn.fulltextarchive.com:wp-content:uploads:wp-advanced-pdf:1:Heart-of-Darkness_chunks.json';
    case 'lonely-londoners':
      return '/vault/English%20Literature/the-lonely-londoners-by-selvon-sam-z-lib-org_chunks.json';
    default:
      return null;
  }
}





