// Public-domain or freely readable canonical links where possible

export function getEnglishTextURL(topicId, partId) {
  switch (topicId) {
    case 'hamlet':
      return 'https://en.wikisource.org/wiki/The_Tragedy_of_Hamlet,_Prince_of_Denmark';
    case 'heart-of-darkness':
      return 'https://en.wikisource.org/wiki/Heart_of_Darkness';
    case 'keats-selected': {
      // Map poems to Wikisource where available
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
    case 'waiting-for-godot':
    case 'lonely-londoners':
      // Not public domain; return null to trigger in-app notice
      return null;
    default:
      return null;
  }
}





