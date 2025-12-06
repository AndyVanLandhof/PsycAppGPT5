// Structured parts per text for Edexcel English Literature (9ET0)
// Provide conservative, commonly accepted segmentations to avoid edition mismatches.

export function getEnglishParts(topicId) {
  switch (topicId) {
    // Drama
    case 'hamlet':
      return [
        { id: 'summary', label: 'Summary', desc: 'Plot overview and key arcs' },
        // Acts I–V with conventional scene descriptors
        { id: 'act-1-scene-1', label: 'Act I, Scene 1', desc: 'Elsinore battlements; Ghost appears' },
        { id: 'act-1-scene-2', label: 'Act I, Scene 2', desc: 'Court/Marriage scene; Hamlet in mourning' },
        { id: 'act-1-scene-3', label: 'Act I, Scene 3', desc: 'Laertes & Polonius advise Ophelia' },
        { id: 'act-1-scene-4', label: 'Act I, Scene 4', desc: 'Ghost beckons Hamlet' },
        { id: 'act-1-scene-5', label: 'Act I, Scene 5', desc: 'Ghost reveals murder; vow of revenge' },
        { id: 'act-2-scene-1', label: 'Act II, Scene 1', desc: 'Reynaldo; Ophelia reports Hamlet’s “madness”' },
        { id: 'act-2-scene-2', label: 'Act II, Scene 2', desc: 'R&G arrive; Players; “What a piece of work”' },
        { id: 'act-3-scene-1', label: 'Act III, Scene 1', desc: '“To be, or not to be”; Nunnery scene' },
        { id: 'act-3-scene-2', label: 'Act III, Scene 2', desc: '“The Mousetrap”; Claudius jolted' },
        { id: 'act-3-scene-3', label: 'Act III, Scene 3', desc: 'Claudius at prayer; Hamlet spares him' },
        { id: 'act-3-scene-4', label: 'Act III, Scene 4', desc: 'Closet scene; Polonius slain' },
        { id: 'act-4-scene-1', label: 'Act IV, Scene 1', desc: 'Claudius hears of Polonius’ death' },
        { id: 'act-4-scene-2', label: 'Act IV, Scene 2', desc: 'Hamlet and Rosencrantz & Guildenstern' },
        { id: 'act-4-scene-3', label: 'Act IV, Scene 3', desc: 'Claudius sends Hamlet to England' },
        { id: 'act-4-scene-4', label: 'Act IV, Scene 4', desc: 'Fortinbras’ army; “How all occasions…”' },
        { id: 'act-4-scene-5', label: 'Act IV, Scene 5', desc: 'Ophelia’s madness; Laertes returns' },
        { id: 'act-4-scene-6', label: 'Act IV, Scene 6', desc: 'Hamlet’s letter; pirates' },
        { id: 'act-4-scene-7', label: 'Act IV, Scene 7', desc: 'Plot with Laertes; poisoned foil; Ophelia’s death' },
        { id: 'act-5-scene-1', label: 'Act V, Scene 1', desc: 'Graveyard scene; Yorick' },
        { id: 'act-5-scene-2', label: 'Act V, Scene 2', desc: 'Duel; deaths; Fortinbras' }
      ];
    case 'waiting-for-godot':
      // Beckett is typically divided into two acts without scenes
      return [
        { id: 'summary', label: 'Summary', desc: 'Plot overview, themes, structure' },
        { id: 'act-1', label: 'Act I', desc: 'Waiting; Pozzo & Lucky arrive; boy’s message' },
        { id: 'act-1-opening', label: 'Act I — Opening', desc: 'Boots, hat, tree; waiting begins' },
        { id: 'act-1-pozzo-lucky-arrive', label: 'Act I — Pozzo & Lucky arrive', desc: 'First encounter; master/servant dynamic' },
        { id: 'act-1-lucky-speech', label: 'Act I — Lucky’s speech', desc: 'Monologue; breakdown of logic/meaning' },
        { id: 'act-1-departure', label: 'Act I — Departure', desc: 'Pozzo & Lucky leave; circularity resumes' },
        { id: 'act-1-boy-message', label: 'Act I — The Boy’s message', desc: 'Godot will not come today' },
        { id: 'act-2', label: 'Act II', desc: 'Return to waiting; Pozzo blind/Lucky mute; ending' },
        { id: 'act-2-tree-leaves', label: 'Act II — The tree', desc: 'Leaves appear; time/game of memory' },
        { id: 'act-2-pozzo-blind', label: 'Act II — Pozzo blind/Lucky mute', desc: 'Roles altered; dependence exposed' },
        { id: 'act-2-memory-forgetting', label: 'Act II — Memory/forgetting', desc: 'Repetition; uncertainty persists' },
        { id: 'act-2-boy-returns', label: 'Act II — The Boy returns', desc: 'Same message; deferred arrival' },
        { id: 'act-2-ending', label: 'Act II — Ending', desc: 'Resolve to go; they do not move' }
      ];

    // Prose
    case 'heart-of-darkness':
      // Commonly presented in three parts
      return [
        { id: 'summary', label: 'Summary', desc: 'Frame narrative; imperial backdrop' },
        { id: 'part-1', label: 'Part I', desc: 'Thames frame; voyage begins; Company station' },
        { id: 'part-1-thames-frame', label: 'Part I — Thames frame', desc: 'Nellie on the Thames; Marlow’s frame narrative begins' },
        { id: 'part-1-company-offices', label: 'Part I — Company offices', desc: 'Brussels; ivory company; “whited sepulchre”' },
        { id: 'part-1-outer-station', label: 'Part I — Outer Station', desc: 'Mismanagement; chain-gang; blasted hillside' },
        { id: 'part-1-grove-of-death', label: 'Part I — “Grove of death”', desc: 'Starving labourers in the shade' },
        { id: 'part-2', label: 'Part II', desc: 'Up-river; rumours of Kurtz; jungle intensifies' },
        { id: 'part-2-eldorado-expedition', label: 'Part II — Eldorado Expedition', desc: 'Manager’s uncle; reckless ivory venture' },
        { id: 'part-2-up-river', label: 'Part II — Up-river', desc: 'Steamer journey; cannibals aboard; restraint' },
        { id: 'part-2-fog-attack', label: 'Part II — Fog & attack', desc: 'Impenetrable fog; mysterious arrows; helmsman killed' },
        { id: 'part-2-brickmaker', label: 'Part II — Brickmaker', desc: 'Paperwork, “papier-mâché Mephistopheles”' },
        { id: 'part-3', label: 'Part III', desc: 'Meeting Kurtz; “The horror!”; return to Europe' },
        { id: 'part-3-inner-station', label: 'Part III — Inner Station', desc: 'Ornamented posts; Russian disciple; Kurtz’s domain' },
        { id: 'part-3-kurtz-encounter', label: 'Part III — Kurtz encountered', desc: 'Emaciated figure; charisma; “Exterminate all the brutes”' },
        { id: 'part-3-the-horror', label: 'Part III — “The horror!”', desc: 'Kurtz’s last words; judgment/epiphany' },
        { id: 'part-3-the-intended', label: 'Part III — The Intended', desc: 'Return to Europe; visit to the Intended; the lie' }
      ];
    case 'lonely-londoners':
      // Editions vary; expose a whole-novel focus and leave finer segmentation for future update
      return [
        { id: 'summary', label: 'Summary', desc: 'Plot overview; migrants’ experiences' },
        { id: 'whole', label: 'Whole Novel', desc: 'Episodic vignettes of West Indian life in London' },
        { id: 'episode-arrival', label: 'Arrival — Newcomers & Moses', desc: 'Moses meets newcomers; first impressions of London' },
        { id: 'episode-moses', label: 'Moses — Routine & mediation', desc: 'Moses Aloetta’s routines; community mediator' },
        { id: 'episode-galahad', label: 'Galahad — City & racism', desc: 'Galahad’s wanderings; encounters with prejudice' },
        { id: 'episode-cap', label: 'Cap — Hustle & resourcefulness', desc: 'Captain’s schemes; survival strategies' },
        { id: 'episode-bart', label: 'Bart — Status & colorism', desc: 'Bart’s aspirations; internalised bias and class' },
        { id: 'episode-summer-sequence', label: 'Summer sequence — Carnival', desc: 'Long, lyrical flow; celebration and alienation' },
        { id: 'episode-tanty', label: 'Tanty — Community & remittances', desc: 'Tanty Bessy; kinship, money, obligation' },
        { id: 'episode-hyde-park', label: 'Hyde Park — Leisure & gaze', desc: 'Looking/being looked at; performance of self' },
        { id: 'episode-winter', label: 'Winter — Cold & hardship', desc: 'Seasonal precarity; work, housing, illness' },
        { id: 'episode-closing', label: 'Closing — Moses’s reflection', desc: 'Ambivalence; endurance; open-ended future' }
      ];

    // Poetry
    case 'poems-of-the-decade':
      // Full anthology listing for selection
      return [
        { id: 'summary', label: 'Summary', desc: 'Anthology overview; recurrent themes/methods' },
        { id: 'poem-eat-me', label: 'Eat Me — Patience Agbabi' },
        { id: 'poem-chainsaw', label: 'Chainsaw Versus the Pampas Grass — Simon Armitage' },
        { id: 'poem-material', label: 'Material — Ros Barber' },
        { id: 'poem-history', label: 'History — John Burnside' },
        { id: 'poem-easy-passage', label: 'An Easy Passage — Julia Copus' },
        { id: 'poem-deliverer', label: 'The Deliverer — Tishani Doshi' },
        { id: 'poem-lammas-hireling', label: 'The Lammas Hireling — Ian Duhig' },
        { id: 'poem-nine-year-old-self', label: 'To My Nine-Year-Old Self — Helen Dunmore' },
        { id: 'poem-minor-role', label: 'A Minor Role — U A Fanthorpe' },
        { id: 'poem-gun', label: 'The Gun — Vicki Feaver' },
        { id: 'poem-furthest-distances', label: "The Furthest Distances I've Travelled — Leontia Flynn" },
        { id: 'poem-giuseppe', label: 'Giuseppe — Roderick Ford' },
        { id: 'poem-out-of-the-bag', label: 'Out of the Bag — Seamus Heaney' },
        { id: 'poem-effects', label: 'Effects — Alan Jenkins' },
        { id: 'poem-genetics', label: 'Genetics — Sinéad Morrissey' },
        { id: 'poem-disappointed-man', label: 'From the Journal of a Disappointed Man — Andrew Motion' },
        { id: 'poem-look-we-have-coming', label: 'Look We Have Coming to Dover! — Daljit Nagra' },
        { id: 'poem-please-hold', label: 'Please Hold — Ciaran O’Driscoll' },
        { id: 'poem-on-her-blindness', label: 'On Her Blindness — Adam Thorpe' },
        { id: 'poem-grayson-perry-urn', label: 'Ode on a Grayson Perry Urn — Tim Turnbull' }
      ];

    case 'keats-selected':
      // Major odes and key lyric selections
      return [
        { id: 'summary', label: 'Summary', desc: 'Keats’s themes; odes as sequence; negative capability' },
        { id: 'poem-ode-to-a-nightingale', label: 'Ode to a Nightingale' },
        { id: 'poem-ode-on-a-grecian-urn', label: 'Ode on a Grecian Urn' },
        { id: 'poem-ode-on-melancholy', label: 'Ode on Melancholy' },
        { id: 'poem-ode-to-psyche', label: 'Ode to Psyche' },
        { id: 'poem-to-autumn', label: 'To Autumn' },
        { id: 'poem-la-belle-dame', label: 'La Belle Dame sans Merci' },
        { id: 'poem-bright-star', label: 'Bright Star' },
        { id: 'poem-chapmans-homer', label: "On First Looking into Chapman's Homer" },
        { id: 'poem-eve-of-st-agnes', label: 'The Eve of St Agnes' }
      ];

    default:
      // Fallback
      return [
        { id: 'summary', label: 'Summary' }
      ];
  }
}

export function getEnglishPair(topicId) {
  // Return the paired comparison text for drama/prose where applicable
  switch (topicId) {
    case 'hamlet':
      return { partnerId: 'waiting-for-godot', partnerLabel: 'Waiting for Godot (Beckett)' };
    case 'waiting-for-godot':
      return { partnerId: 'hamlet', partnerLabel: 'Hamlet (Shakespeare)' };
    case 'heart-of-darkness':
      return { partnerId: 'lonely-londoners', partnerLabel: 'The Lonely Londoners (Selvon)' };
    case 'lonely-londoners':
      return { partnerId: 'heart-of-darkness', partnerLabel: 'Heart of Darkness (Conrad)' };
    default:
      return null;
  }
}


