/**
 * Essay Co-Pilot Automated Test Script
 * Tests the feedback and "Help Me Out" features across all stages
 */

require('dotenv').config();

const API_URL = 'http://localhost:5001/api/ai';

// Dynamic import for fetch (works with Node 18+)
let fetch;
async function loadFetch() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }
  return fetch;
}

// Test question
const TEST_QUESTION = "Critically assess the cosmological argument for the existence of God.";

// Sample content for each stage (varying quality to test feedback accuracy)
const TEST_CONTENT = {
  planning: {
    good: {
      thesis: "While the cosmological argument provides a logically coherent framework for God's existence through the necessity of a first cause, it ultimately fails due to its unwarranted leap from 'uncaused cause' to the God of classical theism.",
      argumentsFor: `1. Aquinas' Five Ways - especially the argument from motion and causation, everything in motion must be moved by another, leading to an unmoved mover
2. Leibniz's Principle of Sufficient Reason - the universe requires an explanation for its existence outside itself
3. Kalam Cosmological Argument (Craig/Al-Ghazali) - whatever begins to exist has a cause; Big Bang supports universe had a beginning`,
      argumentsAgainst: `1. Hume - we cannot apply cause/effect beyond our experience; universe might be a brute fact
2. Russell - fallacy of composition; just because parts have causes doesn't mean the whole does
3. Kant - causation only applies within phenomena, not to things-in-themselves
4. Mackie - even granting a first cause, nothing proves it's the theistic God (gap problem)`
    },
    weak: {
      thesis: "I think there must be a god because the universe needs a cause",
      argumentsFor: "Aquinas said there needs to be a first cause",
      argumentsAgainst: "Some philosophers disagree"
    }
  },
  introduction: {
    good: `The cosmological argument, one of the most enduring arguments for God's existence, attempts to prove that the universe requires an external cause or explanation - namely, God. From Aquinas' medieval formulations to contemporary defenses by William Lane Craig, this argument has remained central to natural theology. However, while it offers a logically structured case, I will argue that it ultimately fails to bridge the gap between establishing a 'first cause' and demonstrating that this cause is the omnipotent, omniscient God of classical theism. This essay will examine the strongest versions of the argument before evaluating the philosophical objections that undermine its conclusions.`,
    weak: `The cosmological argument is about whether God exists. Some people think the universe needs a cause and that cause is God. I will discuss both sides of this argument.`
  },
  argument: {
    good: `The most compelling formulation of the cosmological argument comes from Aquinas' Second Way, which argues from causation. Aquinas observed that nothing can cause itself - for something to cause itself, it would need to exist before it existed, which is impossible. Therefore, every effect must have a prior cause. However, this chain of causes cannot extend infinitely, as this would mean there was no first cause, and consequently no subsequent causes. Thus, there must be a first uncaused cause, which Aquinas identifies as God.

This argument is strengthened by Leibniz's Principle of Sufficient Reason (PSR), which states that everything must have an explanation for its existence. The universe, as a contingent entity (it could have not existed), requires an explanation outside itself. Leibniz argues this explanation must be a necessary being - one whose existence is self-explanatory - which he identifies as God.

Contemporary philosopher William Lane Craig's Kalam argument adds empirical support: "Whatever begins to exist has a cause; the universe began to exist; therefore the universe has a cause." The Big Bang theory, Craig argues, provides scientific evidence that the universe had a temporal beginning, supporting premise two. This convergence of philosophical reasoning and scientific evidence makes a powerful case for a transcendent cause of the universe.`,
    weak: `Aquinas said everything needs a cause and you can't go back forever so there must be a first cause which is God. Leibniz also agreed with this idea. Craig talks about the Big Bang which shows the universe started.`
  },
  counter: {
    good: `However, the cosmological argument faces significant challenges. David Hume fundamentally questions whether causation can be applied beyond our immediate experience. We observe cause and effect within the universe, but extrapolating this principle to the universe itself may be illegitimate. As Hume argues, the universe might simply be a 'brute fact' requiring no external explanation.

Bertrand Russell reinforces this critique with his famous assertion that "the universe is just there, and that's all." He accuses cosmological arguments of committing the fallacy of composition - assuming that because every part of the universe has a cause, the universe as a whole must have one. Just as every human has a mother, but humanity as a whole does not, the universe's parts being caused does not entail the universe itself is caused.

In response to Hume, defenders argue that the PSR is a fundamental principle of rational inquiry - rejecting it would undermine science itself. To Russell, Craig responds that the universe is not like a collection (humanity) but a concrete entity that came into existence, and concrete entities require causes. However, these responses remain contested, and the burden of proof arguably lies with the theist to demonstrate why the universe cannot be self-explanatory.`,
    weak: `Some people like Hume and Russell disagree with the cosmological argument. They say the universe might not need a cause. But supporters of the argument think it does need a cause.`
  },
  alternative: {
    good: `An alternative perspective comes from Kant, who argues that the cosmological argument makes an illegitimate move from the phenomenal to the noumenal realm. For Kant, causation is a category of understanding that structures our experience of the phenomenal world - the world as it appears to us. We cannot legitimately apply these categories beyond experience to things-in-themselves (noumena), including any supposed first cause. Thus, the argument cannot establish the existence of a transcendent God.

Furthermore, J.L. Mackie identifies the 'gap problem': even if we accept a first cause, nothing in the argument demonstrates this cause has the attributes of the theistic God - omnipotence, omniscience, and moral perfection. The first cause could be an impersonal force, multiple deities, or something entirely beyond our comprehension.

While these critiques are powerful, they can be partially addressed. Swinburne argues that God, as the simplest explanation (a single entity with infinite properties), is more probable than complex alternatives. However, this relies on contested assumptions about simplicity in explanation. Ultimately, while the cosmological argument establishes a case for some transcendent cause, it falls short of demonstrating the God of classical theism.`,
    weak: `Kant thought the argument was wrong because we can't know things outside our experience. Mackie said even if there's a first cause it might not be God.`
  },
  conclusion: {
    good: `In conclusion, while the cosmological argument presents a logically coherent case for a transcendent cause of the universe, it ultimately fails to establish the existence of the God of classical theism. Aquinas, Leibniz, and Craig offer compelling reasons to think the universe requires an external explanation, and the Kalam argument's appeal to Big Bang cosmology provides empirical support. However, Hume's and Russell's challenges to the universality of causation remain formidable, Kant's critique of applying phenomenal categories to noumenal reality undermines the argument's metaphysical reach, and Mackie's gap problem reveals that even a successful cosmological argument falls short of theism. The most we can conclude is that there may be some transcendent ground of existence - but whether this is the personal, loving God of religious worship remains undemonstrated.`,
    weak: `In conclusion, the cosmological argument has some good points but also some problems. I think it partly works but doesn't fully prove God exists.`
  }
};

// Stage prompts (copied from EssayCoPilot.jsx for consistency)
function getStagePrompt(stage, content, question) {
  const baseContext = `You are an expert OCR A-Level Religious Studies coach, helping a student write a 40-mark essay (16 AO1, 24 AO2).

Question: "${question}"

OCR Marking Criteria:
- AO1 (16 marks): Knowledge & Understanding - select and deploy relevant knowledge accurately
- AO2 (24 marks): Analysis & Evaluation - construct coherent argument with clear line of reasoning

The essay should follow a DIALECTICAL structure:
1. Clear thesis
2. Arguments supporting position (with scholars)
3. Challenge/counter-argument (with response)
4. Alternative view (with critique)
5. Synthesis conclusion with verdict`;

  const stagePrompts = {
    planning: `${baseContext}

The student is in the PLANNING stage. They have provided:

Thesis: "${content.thesis || '(not provided)'}"

Arguments FOR their position:
${content.argumentsFor || '(not provided)'}

Arguments AGAINST (to address):
${content.argumentsAgainst || '(not provided)'}

Evaluate their planning:
1. Is the thesis clear and directly addresses the question?
2. Do they have enough arguments FOR (aim for 2-3 with named scholars)?
3. Do they have enough counter-arguments to address (2-3 with scholars)?
4. Are they ready to write, or need more material?

Give specific feedback - name scholars they should add, concepts they're missing, etc.
End with: "Ready to write ✅" or "Needs more work ⚠️"`,

    intro: `${baseContext}

The student is writing their INTRODUCTION:

"${content}"

Evaluate:
1. Does it define key terms clearly?
2. Does it state a clear thesis/position?
3. Does it signpost the essay structure?
4. Is it appropriately concise (80-120 words ideal)?

Give specific feedback. What's working? What needs improvement?`,

    argument: `${baseContext}

The student is writing their MAIN ARGUMENT section:

"${content}"

Evaluate:
1. Are named scholars used with their specific arguments?
2. Is knowledge accurate and relevant (AO1)?
3. Is there analysis/explanation, not just assertion?
4. Does it build toward their thesis?
5. Word count appropriate (150-250 words)?

Be specific - which scholars are used well? What's missing?`,

    counter: `${baseContext}

The student is writing their CHALLENGE & RESPONSE section:

"${content}"

Evaluate:
1. Is a genuine challenge presented (not a straw man)?
2. Is the counter-argument attributed to a named scholar?
3. Is there a meaningful RESPONSE defending the thesis?
4. Does this show genuine engagement with opposition (AO2)?

Give specific feedback on the dialectical quality.`,

    alternative: `${baseContext}

The student is writing their ALTERNATIVE VIEW & CRITIQUE section:

"${content}"

Evaluate:
1. Is a distinct alternative position presented fairly?
2. Is it attributed to named scholars?
3. Is there effective CRITIQUE of this view?
4. Does this strengthen the overall argument?

Be specific about what works and what needs development.`,

    conclusion: `${baseContext}

The student is writing their CONCLUSION:

"${content}"

Evaluate:
1. Is there a clear VERDICT answering the question?
2. Does it synthesize (not just repeat)?
3. Does it acknowledge counter-arguments while maintaining position?
4. Is it appropriately concise (80-120 words)?

Give specific feedback on the conclusion's effectiveness.`
  };

  return stagePrompts[stage] || baseContext;
}

// Help Me Out prompts
function getHelpPrompt(stage, question, essayContent) {
  const helpPrompts = {
    planning: `You are helping an A-Level student plan an OCR Religious Studies essay (40 marks: 16 AO1, 24 AO2).

Question: "${question}"

Give them SPECIFIC, CONCRETE suggestions:

1. Suggested Thesis (1-2 sentences they could use or adapt)

2. Key Arguments FOR (3 bullet points with specific scholars):
   - [Scholar]: [Their specific argument]

3. Key Arguments AGAINST (3 bullet points with specific scholars):
   - [Scholar]: [Their counter-argument]

Be specific with names, concepts, and brief explanations.`,

    intro: `You are helping an A-Level student write their introduction for an OCR Religious Studies essay.

Question: "${question}"

Give them a MODEL INTRODUCTION (80-100 words) they can learn from:

[Write a strong introduction that defines key terms, states a clear thesis, and briefly signposts the argument]

Then explain briefly WHY this introduction works.`,

    argument: `You are helping an A-Level student write their main argument section.

Question: "${question}"

Give them a MODEL PARAGRAPH (200-250 words) with:
- 2-3 named scholars with their specific arguments
- Explanation of WHY these arguments support the thesis
- Analysis woven in, not just description

Then list the KEY SCHOLARS they should definitely mention.`
  };

  return helpPrompts[stage] || 'Help is not available for this stage.';
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
  console.log('ESSAY CO-PILOT AUTOMATED TEST');
  console.log('='.repeat(80));
  console.log(`\nQuestion: "${TEST_QUESTION}"\n`);

  const stages = ['planning', 'intro', 'argument', 'counter', 'alternative', 'conclusion'];
  const results = [];

  for (const stage of stages) {
    console.log('\n' + '─'.repeat(80));
    console.log(`STAGE: ${stage.toUpperCase()}`);
    console.log('─'.repeat(80));

    // Test with GOOD content
    console.log('\n📗 Testing with GOOD content...');
    const goodContent = stage === 'planning' 
      ? TEST_CONTENT.planning.good 
      : TEST_CONTENT[stage === 'intro' ? 'introduction' : stage]?.good;
    
    if (goodContent) {
      const goodPrompt = getStagePrompt(stage, goodContent, TEST_QUESTION);
      const goodResponse = await callAI(goodPrompt);
      console.log('\nGOOD CONTENT FEEDBACK:');
      console.log(stripMarkdown(goodResponse).substring(0, 800) + '...\n');
      
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
      : TEST_CONTENT[stage === 'intro' ? 'introduction' : stage]?.weak;
    
    if (weakContent) {
      const weakPrompt = getStagePrompt(stage, weakContent, TEST_QUESTION);
      const weakResponse = await callAI(weakPrompt);
      console.log('\nWEAK CONTENT FEEDBACK:');
      console.log(stripMarkdown(weakResponse).substring(0, 800) + '...\n');
      
      results.push({
        stage,
        quality: 'weak',
        response: stripMarkdown(weakResponse)
      });
    }

    // Test "Help Me Out" for first 3 stages
    if (['planning', 'intro', 'argument'].includes(stage)) {
      console.log('\n🆘 Testing HELP ME OUT...');
      const helpPrompt = getHelpPrompt(stage, TEST_QUESTION, TEST_CONTENT.planning.good);
      const helpResponse = await callAI(helpPrompt);
      console.log('\nHELP ME OUT RESPONSE:');
      console.log(stripMarkdown(helpResponse).substring(0, 1000) + '...\n');
      
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
  console.log('='.repeat(80));
}

// Run tests
runTests().catch(console.error);
