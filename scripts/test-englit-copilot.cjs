/**
 * English Literature Essay Co-Pilot Automated Test Script
 * Tests Drama (Hamlet) essay flow
 */

require('dotenv').config();

const API_URL = 'http://localhost:5001/api/ai';

let fetch;
async function loadFetch() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }
  return fetch;
}

// Test question - Hamlet grief question
const TEST_QUESTION = "Explore the significance of grief in Hamlet.";
const TEXT_TYPE = 'drama';

// Sample content for each stage
const TEST_CONTENT = {
  planning: {
    good: {
      thesis: "Shakespeare presents grief in Hamlet as both a paralysing force that inhibits action and a transformative catalyst that exposes the corruption of the Danish court, ultimately suggesting that authentic grief is morally superior to performed mourning.",
      ao2Points: `• "Seems, madam? Nay, it is. I know not 'seems'" (1.2) - Antithesis/repetition - Hamlet rejects surface appearances, establishing the play's theme of seeming vs being
• "O, that this too, too solid flesh would melt" (1.2) - Hyperbole/sibilance - The drawn-out 'too, too' mimics Hamlet's exhaustion; 'solid' suggests he feels trapped in his body
• "Frailty, thy name is woman" (1.2) - Metonymy/generalisation - Grief leads Hamlet to misogynistic outbursts, foreshadowing his treatment of Ophelia
• Ophelia's fragmented songs (4.5) - Prose replacing verse - Her mental disintegration shown through loss of poetic control`,
      ao3Context: `• Elizabethan mourning conventions: extended mourning was expected; Claudius's criticism of Hamlet's grief ("unmanly grief") would seem callous to contemporary audiences
• Succession anxiety: Elizabeth I's lack of heir created national anxiety about succession - the play reflects fears about political instability
• Renaissance Humanism: the tension between classical stoicism (Claudius advocates) and authentic emotional expression`,
      ao5Critics: `• A.C. Bradley: Hamlet's grief causes "melancholic" paralysis - his delay stems from emotional overwhelm rather than indecision
• Wilson Knight: The "embassy of death" - Hamlet's grief makes him a destructive force, spreading corruption rather than cleansing it
• Elaine Showalter: Ophelia's madness represents female grief denied legitimate expression in patriarchal society
• Greenblatt: Purgatory and Protestant uncertainty about the afterlife intensifies grief's spiritual dimension`
    },
    weak: {
      thesis: "Grief is important in Hamlet and affects the characters",
      ao2Points: "Hamlet says he is sad. Ophelia goes mad.",
      ao3Context: "It was written a long time ago",
      ao5Critics: "Some critics have written about it"
    }
  },
  introduction: {
    good: `Grief permeates every corner of Elsinore in Shakespeare's Hamlet, functioning not merely as an emotional response to death but as a lens through which the play examines authenticity, political corruption, and the nature of human connection. From Hamlet's conspicuously sustained mourning to Ophelia's descent into madness, Shakespeare presents grief as both a paralysing force and a transformative catalyst. I shall argue that authentic grief, exemplified by Hamlet and Ophelia, is positioned as morally superior to the performed mourning of Claudius and Gertrude, yet Shakespeare complicates this by showing how grief unchecked can become destructive, ultimately consuming those who feel most deeply.`,
    weak: `This essay will discuss grief in Hamlet. There is a lot of grief in the play because people die. I will look at different characters and how they are sad.`
  },
  analysis1: {
    good: `Shakespeare establishes grief's significance from Hamlet's first appearance, where his "inky cloak" and "suits of solemn black" visually isolate him from the celebratory court. His declaration that he "know[s] not 'seems'" (1.2) employs pointed antithesis to distinguish authentic mourning from courtly performance. The repetition and italicised stress on "seems" versus "is" foregrounds the play's central epistemological crisis: in a world of surveillance and deception, how can inner truth be expressed? Hamlet's grief thus becomes a form of protest against the "unweeded garden" of Denmark, his black clothing a silent rebuke to Claudius's hasty remarriage.

The soliloquy "O, that this too, too solid flesh would melt" reveals grief's physical dimension through visceral imagery. The disputed textual variant "solid/sullied" encapsulates the dual nature of Hamlet's suffering: his body feels both oppressively present ("solid") and morally contaminated ("sullied") by his mother's actions. The sibilance of "self-slaughter" combined with the theological prohibition against it ("the Everlasting had not fixed / His canon 'gainst") demonstrates how Hamlet's grief is compounded by religious constraint—he cannot escape through death, yet existence feels unbearable. Shakespeare thus presents grief as a trap with no viable exit.`,
    weak: `Hamlet is very sad about his father dying. He wears black clothes and talks about how upset he is. In his speech he says he wishes he could die but can't because it's a sin. This shows he has a lot of grief.`
  },
  analysis2: {
    good: `Shakespeare stages grief's performative dimension through the contrast between Hamlet's sustained mourning and Claudius's theatrical displays. When Claudius counsels that "'tis unmanly grief" to persist in sorrow, the actor playing the king must embody precisely the kind of performed emotion Hamlet rejects—grief spoken but not felt. This theatrical self-consciousness reaches its apex in the Player's Hecuba speech, where an actor weeping for a fictional queen prompts Hamlet's self-lacerating comparison: "What's Hecuba to him, or he to Hecuba, / That he should weep for her?" The anaphoric structure emphasises the apparent absurdity that professional emotion exceeds Hamlet's authentic feeling.

Yet the Mousetrap scene reveals that Hamlet has learned to weaponise theatrical grief. By staging "The Murder of Gonzago," he transforms performance from Claudius's tool of deception into an instrument of revelation. The play-within-a-play forces Claudius's guilt to surface through involuntary physical response—he "turns pale," rises, and flees. Granville-Barker notes that Shakespeare here examines how "the truth may be told in jest," suggesting that theatrical representation paradoxically accesses emotional truth more directly than sincere declaration. Grief, staged correctly, becomes a mirror for conscience.`,
    weak: `Claudius also has some grief but his might be fake. The play within a play is important because it makes Claudius react. Hamlet uses the play to catch Claudius.`
  },
  analysis3: {
    good: `The historical context of Elizabethan mourning conventions illuminates the political stakes of Hamlet's grief. Extended mourning for royalty was expected, making Claudius's criticism—delivered merely "two months" after Old Hamlet's death—appear unseemly to contemporary audiences. Stephen Greenblatt argues that the Reformation's abolition of Purgatory left Protestants without ritualised means of processing grief, and the Ghost's ambiguous status ("spirit of health or goblin damned?") reflects this theological uncertainty. Hamlet's grief is thus historically overdetermined: he mourns within a culture that has forgotten how to mourn.

A.C. Bradley's influential reading positions Hamlet's grief as the source of his "melancholic" paralysis, arguing that profound sorrow overwhelms the will to action. While Bradley's psychological approach has been critiqued for treating Hamlet as a real person, his insight that grief "makes the whole world seem pale and unreal" captures the solipsistic dimension of mourning. Wilson Knight offers a darker assessment: Hamlet becomes an "embassy of death," his grief metastasizing into nihilistic destruction. Both readings illuminate how Shakespeare refuses to sentimentalise grief—authentic feeling, unchecked, proves as dangerous as Claudius's false performance. The play's catastrophic conclusion, with bodies littering the stage, suggests that in Elsinore, there is no healthy way to grieve.`,
    weak: `In those days people had different ideas about grief. Critics have said things about Hamlet's character. Bradley thought Hamlet was melancholic. Some people think the play is about death.`
  },
  conclusion: {
    good: `Shakespeare's presentation of grief in Hamlet ultimately resists simple moralisation. While authentic mourning—Hamlet's sustained sorrow, Ophelia's mad songs—is positioned as morally superior to Claudius's political performance, the play demonstrates that unchecked grief becomes self-consuming and destructive. The final stage, littered with bodies, offers no catharsis: Hamlet dies before he can tell his "story," Ophelia's drowning goes unmourned by the court that destroyed her, and Fortinbras's military order promises efficiency rather than healing. Perhaps Shakespeare's darkest insight is that in a corrupted world, there may be no adequate response to loss—grief either calcifies into inaction or explodes into violence, and neither path leads to restoration.`,
    weak: `In conclusion, grief is very important in Hamlet. The characters show grief in different ways. Some grief is real and some is fake. The play ends sadly with everyone dying.`
  }
};

// Build stage-specific prompt (simplified version of component prompts)
function getStagePrompt(stage, content) {
  const baseContext = `You are an expert Edexcel A-Level English Literature coach, helping a student write a 35-mark essay.

Question: "${TEST_QUESTION}"
Text: Hamlet (Drama)

Edexcel Assessment Objectives:
- AO1: Articulate informed personal response with accurate terminology
- AO2: Analyse how meanings are shaped by language, form, structure (highest weight)
- AO3: Understanding of contexts (historical, theatrical, cultural)
- AO5: Explore different interpretations (critics)`;

  const stagePrompts = {
    planning: `${baseContext}

The student is in the PLANNING stage. They have provided:

Thesis: "${content.thesis || '(not provided)'}"

AO2 Points (Language/Form/Structure):
${content.ao2Points || '(not provided)'}

AO3 Context:
${content.ao3Context || '(not provided)'}

AO5 Critics:
${content.ao5Critics || '(not provided)'}

Evaluate their planning:
1. Is the thesis clear, arguable, and addresses the question directly?
2. Do they have strong AO2 points (specific quotes with techniques)?
3. Is context relevant and specific (not generic)?
4. Are critics named with their specific arguments?

Give specific feedback. End with: "Ready to write ✅" or "Needs more work ⚠️"`,

    introduction: `${baseContext}

The student is writing their INTRODUCTION:

"${content}"

Evaluate:
1. Does it engage with the question immediately?
2. Is there a clear, arguable thesis?
3. Does it signpost the essay structure?
4. Is terminology used accurately?
5. Word count appropriate (80-120 words)?

Give specific feedback.`,

    analysis1: `${baseContext}

The student is writing their SCENE ANALYSIS section:

"${content}"

Evaluate:
1. Is there close textual analysis with embedded quotes?
2. Are techniques identified AND their effects explained?
3. Is analysis linked back to the thesis?
4. Are act/scene references included?
5. Word count appropriate (200-300 words)?

Be specific - which quotes work well? What techniques are missed?`,

    analysis2: `${baseContext}

The student is writing their CHARACTER & PERFORMANCE section:

"${content}"

Evaluate:
1. Does it develop new points (not repeat)?
2. Is there consideration of stagecraft/performance?
3. Are quotes embedded with technique analysis?
4. Does it build on the previous section?

Give specific feedback on theatrical/performance awareness.`,

    analysis3: `${baseContext}

The student is writing their CONTEXT & CRITICS section:

"${content}"

Evaluate:
1. Is context specific and illuminating (not generic)?
2. Are critics named with their specific arguments?
3. Does the student engage with critics (agree/challenge/complicate)?
4. Is this integrated with textual analysis?

Be specific about contextual and critical engagement.`,

    conclusion: `${baseContext}

The student is writing their CONCLUSION:

"${content}"

Evaluate:
1. Is there a clear verdict answering the question?
2. Does it synthesise (not just summarise)?
3. Does it leave a lasting impression?
4. Word count appropriate (80-120 words)?

Give specific feedback.`
  };

  return stagePrompts[stage] || baseContext;
}

// Help Me Out prompts
function getHelpPrompt(stage) {
  const helpPrompts = {
    planning: `You are helping an A-Level student plan an Edexcel English Literature essay on Hamlet.

Question: "${TEST_QUESTION}"

Give them SPECIFIC, CONCRETE suggestions:

1. Suggested Thesis (1-2 sentences)

2. Key AO2 Points (3 quotes with techniques):
   - Quote: "[...]" (Act.Scene) → Technique → Effect

3. Relevant Context (AO3):
   - Specific contextual points

4. Critics to Use (AO5):
   - [Critic]: [Their specific argument about grief in Hamlet]

Be specific with act/scene references.`,

    introduction: `Help write an introduction for a Hamlet essay on grief.

Question: "${TEST_QUESTION}"

Give a MODEL INTRODUCTION (80-100 words) that engages immediately, states a clear thesis, and signposts the argument.`,

    analysis1: `Help write close textual analysis for a Hamlet essay on grief.

Question: "${TEST_QUESTION}"

Give a MODEL PARAGRAPH (200-250 words) showing:
- Embedded quotes with act/scene references
- Technique identification + effect analysis
- Link back to thesis

Then list KEY QUOTES to consider.`
  };

  return helpPrompts[stage] || 'Help not available for this stage.';
}

async function callAI(prompt) {
  try {
    const fetchFn = await loadFetch();
    const response = await fetchFn(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response';
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

function stripMarkdown(text) {
  if (!text) return text;
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('ENGLISH LITERATURE ESSAY CO-PILOT TEST - HAMLET (DRAMA)');
  console.log('='.repeat(80));
  console.log(`\nQuestion: "${TEST_QUESTION}"\n`);

  const stages = ['planning', 'introduction', 'analysis1', 'analysis2', 'analysis3', 'conclusion'];
  const results = [];

  for (const stage of stages) {
    console.log('\n' + '─'.repeat(80));
    console.log(`STAGE: ${stage.toUpperCase()}`);
    console.log('─'.repeat(80));

    // Test with GOOD content
    console.log('\n📗 Testing with GOOD content...');
    const goodContent = stage === 'planning'
      ? TEST_CONTENT.planning.good
      : TEST_CONTENT[stage]?.good;

    if (goodContent) {
      const goodPrompt = getStagePrompt(stage, goodContent);
      const goodResponse = await callAI(goodPrompt);
      console.log('\nGOOD CONTENT FEEDBACK:');
      console.log(stripMarkdown(goodResponse).substring(0, 1000) + '...\n');

      results.push({
        stage,
        quality: 'good',
        response: stripMarkdown(goodResponse)
      });
    }

    // Test with WEAK content
    console.log('\n📕 Testing with WEAK content...');
    const weakContent = stage === 'planning'
      ? TEST_CONTENT.planning.weak
      : TEST_CONTENT[stage]?.weak;

    if (weakContent) {
      const weakPrompt = getStagePrompt(stage, weakContent);
      const weakResponse = await callAI(weakPrompt);
      console.log('\nWEAK CONTENT FEEDBACK:');
      console.log(stripMarkdown(weakResponse).substring(0, 1000) + '...\n');

      results.push({
        stage,
        quality: 'weak',
        response: stripMarkdown(weakResponse)
      });
    }

    // Test "Help Me Out" for first 3 stages
    if (['planning', 'introduction', 'analysis1'].includes(stage)) {
      console.log('\n🆘 Testing HELP ME OUT...');
      const helpPrompt = getHelpPrompt(stage);
      const helpResponse = await callAI(helpPrompt);
      console.log('\nHELP ME OUT RESPONSE:');
      console.log(stripMarkdown(helpResponse).substring(0, 1200) + '...\n');

      results.push({
        stage,
        quality: 'help',
        response: stripMarkdown(helpResponse)
      });
    }

    // Small delay between stages
    await new Promise(r => setTimeout(r, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    const hasError = result.response.startsWith('ERROR');
    const isSubstantive = result.response.length > 100;
    const passed = !hasError && isSubstantive;

    if (passed) passCount++;
    else failCount++;

    console.log(`${passed ? '✅' : '❌'} ${result.stage} (${result.quality}): ${passed ? 'PASS' : 'FAIL'}`);
  }

  console.log(`\nTotal: ${passCount} passed, ${failCount} failed`);
  
  // Quality checks
  console.log('\n' + '─'.repeat(80));
  console.log('QUALITY CHECKS');
  console.log('─'.repeat(80));
  
  // Check if good content gets positive signals
  const goodPlanning = results.find(r => r.stage === 'planning' && r.quality === 'good');
  const weakPlanning = results.find(r => r.stage === 'planning' && r.quality === 'weak');
  
  if (goodPlanning && weakPlanning) {
    const goodHasReady = goodPlanning.response.includes('Ready') || goodPlanning.response.includes('✅');
    const weakHasWork = weakPlanning.response.includes('work') || weakPlanning.response.includes('⚠️') || weakPlanning.response.includes('need');
    
    console.log(`${goodHasReady ? '✅' : '⚠️'} Good planning recognized as ready: ${goodHasReady}`);
    console.log(`${weakHasWork ? '✅' : '⚠️'} Weak planning flagged for more work: ${weakHasWork}`);
  }
  
  // Check for Hamlet-specific content in help
  const helpPlanning = results.find(r => r.stage === 'planning' && r.quality === 'help');
  if (helpPlanning) {
    const mentionsBradley = helpPlanning.response.toLowerCase().includes('bradley');
    const mentionsQuotes = helpPlanning.response.includes('"') || helpPlanning.response.includes("'");
    const mentionsActs = /\d\.\d/.test(helpPlanning.response) || /Act/i.test(helpPlanning.response);
    
    console.log(`${mentionsBradley ? '✅' : '⚠️'} Help mentions relevant critic (Bradley): ${mentionsBradley}`);
    console.log(`${mentionsQuotes ? '✅' : '⚠️'} Help provides quotes: ${mentionsQuotes}`);
    console.log(`${mentionsActs ? '✅' : '⚠️'} Help includes act/scene references: ${mentionsActs}`);
  }

  console.log('='.repeat(80));
}

// Run tests
runTests().catch(console.error);
