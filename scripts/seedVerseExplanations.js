// Seed script (Node) for verse explanations (Psalm 105:1)
// Run from project root: node web/scripts/seedVerseExplanations.js

const BASE_URL = process.env.DEV ? 'http://localhost:5001' : 'https://exegesisbackend-production.up.railway.app';

const entries = [
  {
    bookName: 'Psalm',
    chapter: 105,
    verseNumber: 1,
    bibleVersion: 'BSB',
    exegesis: {
      explanationText: `Psalm 105:1 opens with three closely connected commands: give thanks, call upon the LORD, and make His deeds known. Thanksgiving begins by recognizing God as the source of His people’s blessings and remembering His faithful actions. Calling upon His name expresses dependence, worship, prayer, and confidence in the God who has revealed Himself. These commands show that biblical remembrance is active: remembering what God has done should move His people toward gratitude and renewed reliance upon Him.

The third command expands worship outward: “make known His deeds among the nations.” God’s people are not meant to keep the knowledge of His works to themselves. Psalm 105 will recount His covenant dealings with Abraham, Isaac, Jacob, Joseph, Moses, and Israel so that His faithfulness is remembered and proclaimed. The BSB specifically says “among the nations,” giving the opening verse a broad horizon. God’s mighty acts are worthy of being declared beyond the immediate worshiping community so that others may hear of His greatness.`,
      applicationText: `Psalm 105:1 gives believers a practical rhythm for daily faith: remember God with gratitude, seek Him in dependence, and speak truthfully about what He has done. Christian testimony should remain grounded in God’s revealed character and works rather than exaggerated personal claims. As we recognize His faithfulness in Scripture and in our lives, gratitude should deepen prayer, and gratitude and prayer should overflow into faithful witness.`,
    },
    studyMetadata: {
      introduction: `Psalm 105 teaches God’s people to look backward in order to worship faithfully in the present. The psalm recounts generations of covenant history, showing that remembering God’s works strengthens gratitude, trust, and praise. Verse 1 establishes this pattern immediately: thank the LORD, call upon Him, and make His deeds known.`,
      backgroundAuthor: `Psalm 105 does not contain a superscription identifying its human author, so the complete psalm should not be confidently attributed to David. However, Psalm 105:1–15 closely corresponds to material in 1 Chronicles 16:8–22, where David appointed a song of thanksgiving to be used when the ark was brought to Jerusalem. This establishes an important Davidic liturgical connection for the opening portion of Psalm 105, but it does not by itself prove that David composed the entire canonical psalm in its final form.`,
      backgroundBook: `Psalm 105 belongs to Book IV of the Psalms, Psalms 90–106. It is a historical praise psalm that recounts God’s covenant faithfulness from the patriarchs through Joseph, the exodus from Egypt, and Israel’s entrance into the promised land. Rather than presenting Israel’s history merely as information, the psalm interprets history theologically: God remembers His covenant, acts faithfully, protects His purposes, and deserves the praise of His people.`,
      backgroundContext: `Psalm 105 begins with a sequence of calls to thanksgiving, praise, seeking, remembrance, and proclamation before recounting God’s historical works. Verses 1–6 prepare the worshiper to hear the story properly, while verses 7 onward trace God’s covenant dealings with Israel. Psalm 105:1 therefore functions as both an introduction and a response: because God has acted faithfully in history, His people should thank Him, depend upon Him, and make His deeds known among the nations.`,
      finalThoughts: `Psalm 105:1 begins a historical psalm with three simple but far-reaching commands: give thanks, call upon His name, and make known His deeds. Together they describe a healthy pattern of faith. We look backward and remember what God has done, upward as we call upon Him in dependence, and outward as we tell others about His greatness. The rest of Psalm 105 will show why such praise is warranted by recounting God’s faithfulness across generations. The same pattern remains valuable for believers today. Remembering God’s works guards us against forgetfulness, prayer guards us against self-sufficiency, and faithful witness keeps our gratitude from becoming self-contained. God’s faithfulness deserves to be remembered, trusted, and proclaimed.`,
    },
    wordStudies: [
      { strongsId: 'H3034', surfaceText: 'Give Thanks (yadah)', customDefinition: 'to give thanks, praise, confess, or acknowledge', sortOrder: 0 },
      { strongsId: 'H3068', surfaceText: 'LORD (YHWH)', customDefinition: 'the covenant name of the God of Israel', sortOrder: 1 },
    ],
    practicalApps: [
      { applicationText: 'Make Thanksgiving a Deliberate Daily Practice', sortOrder: 0 },
      { applicationText: 'Call Upon God With Humble Dependence', sortOrder: 1 },
      { applicationText: 'Tell Others What God Has Made Known', sortOrder: 2 },
    ],
    crossReferences: [
      { bookName: 'Isaiah', chapter: 12, verseNumber: 4, referenceText: 'Give thanks to the LORD; proclaim His name! Make His works known among the peoples; declare that His name is exalted.', commentary: 'Isaiah closely echoes the pattern of Psalm 105:1.', sortOrder: 0 },
    ],
    themes: [ { themeName: 'Thanksgiving', sortOrder: 0 }, { themeName: 'Witness', sortOrder: 1 } ],
    isPublished: true,
  },
];

async function post(entry) {
  const url = `${BASE_URL}/bible/add-verse-explanation`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, lang: 'en' }),
    });
    const data = await res.json();
    console.log('POST', entry.bookName, entry.chapter, entry.verseNumber, '=>', data.returnCode || data.status || res.status, data.returnMessage || data.message || '');
  } catch (e) {
    console.error('Error posting', entry.bookName, entry.chapter, entry.verseNumber, e.message || e);
  }
}

(async () => {
  for (const e of entries) {
    await post(e);
  }
})();
