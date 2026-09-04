// Update and seed script for Psalm 105:1-5
// Run from project root: node web/scripts/updateAndSeedVerseExplanations.js
// Uses global fetch (Node 18+). Set DEV=1 to use localhost backend.

const BASE_URL = process.env.DEV ? 'http://localhost:5001' : 'https://exegesisbackend-production.up.railway.app';

const entries = [
  {
    bookName: 'Psalm', chapter: 105, verseNumber: 1,
    bibleVersion: 'BSB', isPublished: true,
    exegesis: {
      explanationText: `Psalm 105:1 opens with three closely connected commands: give thanks, call upon the LORD, and make His deeds known. Thanksgiving begins by recognizing God as the source of His people’s blessings and remembering His faithful actions. Calling upon His name expresses dependence, worship, prayer, and confidence in the God who has revealed Himself. These commands show that biblical remembrance is active: remembering what God has done should move His people toward gratitude and renewed reliance upon Him.

The third command expands worship outward: “make known His deeds among the nations.” God’s people are not meant to keep the knowledge of His works to themselves. Psalm 105 will recount His covenant dealings with Abraham, Isaac, Jacob, Joseph, Moses, and Israel so that His faithfulness is remembered and proclaimed. The BSB specifically says “among the nations,” giving the opening verse a broad horizon. God’s mighty acts are worthy of being declared beyond the immediate worshiping community so that others may hear of His greatness.`,
      applicationText: `Psalm 105:1 gives believers a practical rhythm for daily faith: remember God with gratitude, seek Him in dependence, and speak truthfully about what He has done. Christian testimony should remain grounded in God’s revealed character and works rather than exaggerated personal claims. As we recognize His faithfulness in Scripture and in our lives, gratitude should deepen prayer, and gratitude and prayer should overflow into faithful witness.`
    },
    studyMetadata: {
      introduction: `Psalm 105 teaches God’s people to look backward in order to worship faithfully in the present. The psalm recounts generations of covenant history, showing that remembering God’s works strengthens gratitude, trust, and praise. Verse 1 establishes this pattern immediately: thank the LORD, call upon Him, and make His deeds known.`,
      backgroundAuthor: `Psalm 105 does not contain a superscription identifying its human author, so the complete psalm should not be confidently attributed to David. However, Psalm 105:1–15 closely corresponds to material in 1 Chronicles 16:8–22, where David appointed a song of thanksgiving to be used when the ark was brought to Jerusalem. This establishes an important Davidic liturgical connection for the opening portion of Psalm 105, but it does not by itself prove that David composed the entire canonical psalm in its final form.`,
      backgroundBook: `Psalm 105 belongs to Book IV of the Psalms, Psalms 90–106. It is a historical praise psalm that recounts God’s covenant faithfulness from the patriarchs through Joseph, the exodus from Egypt, and Israel’s entrance into the promised land.`,
      backgroundContext: `Psalm 105 begins with a sequence of calls to thanksgiving, praise, seeking, remembrance, and proclamation before recounting God’s historical works. Verses 1–6 prepare the worshiper to hear the story properly, while verses 7 onward trace God’s covenant dealings with Israel. Psalm 105:1 therefore functions as both an introduction and a response: because God has acted faithfully in history, His people should thank Him, depend upon Him, and make His deeds known among the nations.`,
      finalThoughts: `Psalm 105:1 begins a historical psalm with three simple but far-reaching commands: give thanks, call upon His name, and make known His deeds. Together they describe a healthy pattern of faith. We look backward and remember what God has done, upward as we call upon Him in dependence, and outward as we tell others about His greatness. The rest of Psalm 105 will show why such praise is warranted by recounting God’s faithfulness across generations.`,
      takeaways: [
        "Remember God’s faithfulness and give thanks.",
        "Call upon the LORD with dependence and prayer.",
        "Make God’s deeds known through faithful witness.",
      ],
    },
    wordStudies: [
      { strongsId: 'H3034', surfaceText: 'Give Thanks (yadah)', customDefinition: 'to give thanks, praise, confess, or acknowledge', sortOrder: 0 },
      { strongsId: 'H3068', surfaceText: 'LORD (YHWH)', customDefinition: 'the covenant name of the God of Israel', sortOrder: 1 },
      { strongsId: 'H3045', surfaceText: 'Make Known (yada)', customDefinition: 'to cause others to know; make known', sortOrder: 2 },
    ],
    practicalApps: [
      { applicationText: 'Make Thanksgiving a Deliberate Daily Practice', sortOrder: 0 },
      { applicationText: 'Call Upon God With Humble Dependence', sortOrder: 1 },
      { applicationText: 'Tell Others What God Has Made Known', sortOrder: 2 },
    ],
    crossReferences: [
      { bookName: 'Isaiah', chapter: 12, verseNumber: 4, referenceText: 'Give thanks to the LORD; proclaim His name! Make His works known among the peoples; declare that His name is exalted.', commentary: 'Isaiah closely echoes the pattern of Psalm 105:1.', sortOrder: 0 },
      { bookName: 'Psalm', chapter: 96, verseNumber: 3, referenceText: 'Declare His glory among the nations, His wonderful deeds among all peoples.', commentary: 'Similar call to proclaim God’s works.', sortOrder: 1 },
    ],
    themes: [ { themeName: 'Thanksgiving', sortOrder: 0 }, { themeName: 'Witness', sortOrder: 1 } ],
  },
  {
    bookName: 'Psalm', chapter: 105, verseNumber: 2,
    bibleVersion: 'BSB', isPublished: true,
    exegesis: {
      explanationText: `Psalm 105:2 continues the opening call to worship by directing God’s people to respond to His faithfulness through both singing and speaking. The repeated command to sing emphasizes praise intentionally directed toward God. Singing is more than musical expression here; it is a way of honoring the LORD by remembering and celebrating His character and works. The command to “tell of all His wonders” then moves worship into testimony. What God has done should be remembered, spoken about, and passed on rather than forgotten.`,
      applicationText: `Psalm 105:2 encourages believers to use their voices for God’s glory through praise and faithful testimony. We can sing about who God is, speak about what Scripture reveals He has done, remember His faithfulness, and tell others about His saving work in Christ. Our conversations should increasingly point away from ourselves and toward the greatness, goodness, and faithfulness of God.`
    },
    studyMetadata: {
      introduction: `Verse 2 focuses on singing and telling of God’s wonders, establishing an important principle for the entire psalm: remembering what God has done should produce worship and testimony.`,
      backgroundAuthor: `As with verse 1, this material overlaps with 1 Chronicles 16:8–22 and has a Davidic liturgical connection.`,
      backgroundBook: `Book IV of the Psalms (90–106).`,
      backgroundContext: `Verse 2 moves worship into both music and testimony, complementing verse 1's commands.`,
      finalThoughts: `The remainder of Psalm 105 demonstrates how remembering God’s works shapes true worship.`,
      takeaways: [
        'Worship through song and testimony',
        'Ground testimony in Scripture',
        'Let praise and speech strengthen others',
      ],
    },
    wordStudies: [
      { strongsId: 'H7891', surfaceText: 'Sing (shir)', customDefinition: 'to sing, express something through song', sortOrder: 0 },
      { strongsId: 'H2167', surfaceText: 'Sing Praises (zamar)', customDefinition: 'to sing praise or make music', sortOrder: 1 },
    ],
    practicalApps: [
      { applicationText: 'Make Praise a Regular Part of Your Life', sortOrder: 0 },
      { applicationText: 'Speak About God in Everyday Conversation', sortOrder: 1 },
    ],
    crossReferences: [
      { bookName: 'Psalm', chapter: 96, verseNumber: 1, referenceText: 'Sing to the LORD a new song; sing to the LORD, all the earth.', commentary: 'Related call to sing and proclaim.', sortOrder: 0 }
    ],
    themes: [ { themeName: 'Praise', sortOrder: 0 }, { themeName: 'Testimony', sortOrder: 1 } ],
  },
  {
    bookName: 'Psalm', chapter: 105, verseNumber: 3,
    bibleVersion: 'BSB', isPublished: true,
    exegesis: {
      explanationText: `Psalm 105:3 calls God’s people to “glory in His holy name.” To glory here means to boast, celebrate, or take pride in the LORD rather than in ourselves. God’s name represents His revealed identity, character, reputation, and authority, while His holiness declares that He is uniquely set apart and morally perfect. After commanding Israel to give thanks, sing, and tell of God’s wonders in verses 1–2, the psalm now directs their confidence toward God Himself.`,
      applicationText: `Psalm 105:3 challenges believers to examine where they find their deepest confidence and joy. Achievements, possessions, recognition, and circumstances can change, but the holy character of God does not. As we seek Him through Scripture, prayer, worship, obedience, and dependence, we can learn to rejoice in who He is even during difficult seasons.`
    },
    studyMetadata: {
      introduction: `Verse 3 moves the focus to rejoicing in God’s holy name and calling those who seek the LORD to rejoice.`,
      backgroundAuthor: `Same literary and liturgical context as previous verses.`,
      backgroundBook: `Book IV of the Psalms.`,
      backgroundContext: `Verse 3 emphasizes inward joy grounded in God’s character.`,
      finalThoughts: `Joy rooted in God’s character, not circumstances.`,
      takeaways: [
        'Glory in the LORD, not in ourselves',
        'Seek God intentionally',
        'Let your heart participate in worship',
      ],
    },
    wordStudies: [
      { strongsId: 'H1984', surfaceText: 'Glory (halal)', customDefinition: 'to praise, boast, celebrate', sortOrder: 0 },
      { strongsId: 'H6944', surfaceText: 'Holy (qodesh)', customDefinition: 'holiness, sacredness', sortOrder: 1 },
    ],
    practicalApps: [
      { applicationText: 'Make God Your Greatest Boast', sortOrder: 0 },
      { applicationText: 'Rejoice in God’s Character', sortOrder: 1 },
    ],
    crossReferences: [
      { bookName: 'Psalm', chapter: 33, verseNumber: 21, referenceText: 'For our hearts rejoice in Him, since we trust in His holy name.', commentary: 'Parallel thought about rejoicing in God.', sortOrder: 0 }
    ],
    themes: [ { themeName: 'Joy', sortOrder: 0 }, { themeName: 'Holiness', sortOrder: 1 } ],
  },
  {
    bookName: 'Psalm', chapter: 105, verseNumber: 4,
    bibleVersion: 'BSB', isPublished: true,
    exegesis: {
      explanationText: `Psalm 105:4 calls God’s people to a deliberate and continuing pursuit of the LORD. The repeated command “seek” gives the verse urgency: God is not to be treated as an occasional part of life but as the One toward whom His people continually turn. The command to seek “the LORD and His strength” reminds us that faithful living cannot rest merely upon human ability.`,
      applicationText: `Psalm 105:4 challenges believers to make seeking God a continuing priority through Scripture, prayer, worship, and obedience. Seek God’s strength rather than relying on self-sufficiency.`
    },
    studyMetadata: {
      introduction: `Verse 4 intensifies the call to seek the LORD and His strength, and to seek His face always.`,
      backgroundAuthor: `Shared context with verses 1–3.`,
      backgroundBook: `Book IV of the Psalms.`,
      backgroundContext: `Emphasis on persistent devotion and seeking God’s presence.`,
      finalThoughts: `Seeking God is a lifelong orientation that shapes decisions and priorities.`,
      takeaways: [
        'Seek the LORD continually',
        'Depend on His strength',
        'Let seeking shape your life',
      ],
    },
    wordStudies: [
      { strongsId: 'H1875', surfaceText: 'Seek Out (darash)', customDefinition: 'to seek, inquire, pursue with care', sortOrder: 0 },
      { strongsId: 'H5797', surfaceText: 'Strength (oz)', customDefinition: 'strength, might, power', sortOrder: 1 },
    ],
    practicalApps: [
      { applicationText: 'Make Seeking God a Daily Priority', sortOrder: 0 },
      { applicationText: 'Depend on God’s Strength', sortOrder: 1 },
    ],
    crossReferences: [
      { bookName: 'Jeremiah', chapter: 29, verseNumber: 13, referenceText: 'You will seek Me and find Me when you search for Me with all your heart.', commentary: 'Wholehearted seeking.', sortOrder: 0 }
    ],
    themes: [ { themeName: 'Seeking', sortOrder: 0 }, { themeName: 'Dependence', sortOrder: 1 } ],
  },
  {
    bookName: 'Psalm', chapter: 105, verseNumber: 5,
    bibleVersion: 'BSB', isPublished: true,
    exegesis: {
      explanationText: `Psalm 105:5 calls God’s people to intentionally remember what the LORD has done and what He has spoken. In Scripture, remembering is more than simply having information stored in the mind; it involves deliberately bringing God’s works back into conscious attention so that they shape faith, worship, and obedience.`,
      applicationText: `Psalm 105:5 encourages believers to develop habits of biblical remembrance by revisiting God’s mighty works recorded in Scripture and recalling God’s faithfulness in their lives.`
    },
    studyMetadata: {
      introduction: `Verse 5 introduces the command to remember God’s wonders, marvels, and the judgments He has pronounced, preparing the reader for the historical account that follows.`,
      backgroundAuthor: `Same psalm context as verses 1–4.`,
      backgroundBook: `Book IV of the Psalms.`,
      backgroundContext: `Remembering God’s works and words anchors trust and worship.`,
      finalThoughts: `Remembrance turns history into worship and gives confidence for present trust.`,
      takeaways: [
        'Remember God’s works to strengthen faith',
        'Let Scripture shape your memory of God',
        'Use past faithfulness to strengthen present trust',
      ],
    },
    wordStudies: [
      { strongsId: 'H2142', surfaceText: 'Remember (zakar)', customDefinition: 'to remember, recall, mention', sortOrder: 0 },
      { strongsId: 'H6381', surfaceText: 'Wonders (pala)', customDefinition: 'wonders, extraordinary acts', sortOrder: 1 },
    ],
    practicalApps: [
      { applicationText: 'Build a Habit of Remembering God’s Works', sortOrder: 0 },
      { applicationText: 'Let Scripture Shape Your Memory of God', sortOrder: 1 },
    ],
    crossReferences: [
      { bookName: 'Psalm', chapter: 77, verseNumber: 11, referenceText: 'I will remember the works of the LORD; yes, I will remember Your wonders of old.', commentary: 'Remembering in distress.', sortOrder: 0 }
    ],
    themes: [ { themeName: 'Remembrance', sortOrder: 0 }, { themeName: 'Faithfulness', sortOrder: 1 } ],
  }
];

async function postJson(path, body) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json().catch(() => ({}));
}

async function ensureEntry(entry) {
  // Check existing
  const check = await postJson('/bible/get-verse-explanation', { bookName: entry.bookName, chapter: entry.chapter, verseNumber: entry.verseNumber, lang: 'en' });
  const exists = check?.returnCode === 200 && check.returnData;
  if (exists && check.returnData.id) {
    // Update: include id
    const payload = { id: check.returnData.id, ...entry };
    console.log(`Updating ${entry.bookName} ${entry.chapter}:${entry.verseNumber} (id=${check.returnData.id})`);
    const res = await postJson('/bible/add-verse-explanation', payload);
    console.log('=>', res.returnCode || res.status, res.returnMessage || res.returnData?.id || '');
  } else {
    console.log(`Creating ${entry.bookName} ${entry.chapter}:${entry.verseNumber}`);
    const res = await postJson('/bible/add-verse-explanation', entry);
    console.log('=>', res.returnCode || res.status, res.returnMessage || res.returnData?.id || '');
  }
}

(async () => {
  for (const e of entries) {
    try {
      await ensureEntry(e);
    } catch (err) {
      console.error('Error for', e.bookName, e.chapter, e.verseNumber, err?.message || err);
    }
  }
  console.log('Done.');
})();
