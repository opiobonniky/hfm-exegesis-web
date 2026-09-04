-- Seed/Update Psalm 105:1-5
-- Run with psql: psql "postgres://user:pass@host:port/dbname" -f web/scripts/seed_psalm105_1_5.sql

-- Verse 1
BEGIN;

WITH e AS (
  INSERT INTO verse_explanations (book_name, chapter, verse_number, bible_version, sort_order, created_on, updated_on)
  VALUES ('Psalm', 105, 1, 'BSB', 9999, NOW(), NOW())
  ON CONFLICT (book_name, chapter, verse_number) DO UPDATE
    SET bible_version = EXCLUDED.bible_version,
        updated_on = NOW()
  RETURNING id
), ex AS (
  INSERT INTO verse_exegesis (explanation_id, explanation_text, application_text)
  VALUES ((SELECT id FROM e),
    $$Psalm 105:1 opens with three closely connected commands: give thanks, call upon the LORD, and make His deeds known. Thanksgiving begins by recognizing God as the source of His people’s blessings and remembering His faithful actions. Calling upon His name expresses dependence, worship, prayer, and confidence in the God who has revealed Himself. These commands show that biblical remembrance is active: remembering what God has done should move His people toward gratitude and renewed reliance upon Him.

The third command expands worship outward: “make known His deeds among the nations.” God’s people are not meant to keep the knowledge of His works to themselves. Psalm 105 will recount His covenant dealings with Abraham, Isaac, Jacob, Joseph, Moses, and Israel so that His faithfulness is remembered and proclaimed. The BSB specifically says “among the nations,” giving the opening verse a broad horizon. God’s mighty acts are worthy of being declared beyond the immediate worshiping community so that others may hear of His greatness.$$,
    $$Psalm 105:1 gives believers a practical rhythm for daily faith: remember God with gratitude, seek Him in dependence, and speak truthfully about what He has done. Christian testimony should remain grounded in God’s revealed character and works rather than exaggerated personal claims. As we recognize His faithfulness in Scripture and in our lives, gratitude should deepen prayer, and gratitude and prayer should overflow into faithful witness.$$)
  ON CONFLICT (explanation_id) DO UPDATE
    SET explanation_text = EXCLUDED.explanation_text,
        application_text = EXCLUDED.application_text
  RETURNING id
)
-- Delete existing children and insert fresh ones
;

DELETE FROM verse_word_studies_detailed WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_practical_applications WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_cross_references WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_themes WHERE explanation_id = (SELECT id FROM e);

INSERT INTO verse_word_studies_detailed (explanation_id, strongs_id, surface_text, custom_definition, sort_order)
VALUES
  ((SELECT id FROM e), 'H3034', 'Give Thanks (yadah)', $$Yadah can mean to give thanks, praise, confess, or acknowledge. In this context it calls God’s people to openly acknowledge the LORD for who He is and what He has done. Biblical thanksgiving is therefore more than a passing feeling of appreciation; it is a deliberate recognition of God’s goodness and faithfulness.$$, 0),
  ((SELECT id FROM e), 'H3068', 'LORD (YHWH)', $$YHWH is the covenant name of the God of Israel, rendered LORD in uppercase letters in the BSB. Psalm 105 repeatedly emphasizes God’s covenant faithfulness, making this divine name especially significant.$$, 1),
  ((SELECT id FROM e), 'H3045', 'Make Known (yada)', $$Yada commonly means to know, recognize, perceive, or understand. In the causative form used here, it carries the sense of causing others to know or making something known.$$, 2)
;

INSERT INTO verse_practical_applications (explanation_id, application_text, sort_order)
VALUES
  ((SELECT id FROM e), 'Make Thanksgiving a Deliberate Daily Practice', 0),
  ((SELECT id FROM e), 'Call Upon God With Humble Dependence', 1),
  ((SELECT id FROM e), 'Tell Others What God Has Made Known', 2)
;

INSERT INTO verse_cross_references (explanation_id, book_name, chapter, verse_number, reference_text, commentary, sort_order)
VALUES
  ((SELECT id FROM e), 'Isaiah', 12, 4, $$Give thanks to the LORD; proclaim His name! Make His works known among the peoples; declare that His name is exalted.$$, $$Isaiah closely echoes the pattern of Psalm 105:1.$$, 0),
  ((SELECT id FROM e), 'Psalm', 96, 3, $$Declare His glory among the nations, His wonderful deeds among all peoples.$$, $$Reinforces the outward direction of praise.$$, 1)
;

INSERT INTO verse_themes (explanation_id, theme_name, sort_order)
VALUES
  ((SELECT id FROM e), 'Thanksgiving', 0),
  ((SELECT id FROM e), 'Witness', 1)
;

-- Upsert study metadata
INSERT INTO verse_study_metadata (explanation_id, introduction, background_author, background_book, background_context, final_thoughts)
VALUES ((SELECT id FROM e),
  $$Psalm 105 teaches God’s people to look backward in order to worship faithfully in the present. The psalm recounts generations of covenant history, showing that remembering God’s works strengthens gratitude, trust, and praise. Verse 1 establishes this pattern immediately: thank the LORD, call upon Him, and make His deeds known.$$,
  $$Psalm 105 does not contain a superscription identifying its human author... (see admin notes).$$,
  $$Psalm 105 belongs to Book IV of the Psalms, Psalms 90–106...$$,
  $$Psalm 105 begins with a sequence of calls to thanksgiving, praise, seeking, remembrance, and proclamation...$$,
  $$Psalm 105:1 begins a historical psalm with three simple but far-reaching commands...$$)
ON CONFLICT (explanation_id) DO UPDATE
  SET introduction = EXCLUDED.introduction,
      background_author = EXCLUDED.background_author,
      background_book = EXCLUDED.background_book,
      background_context = EXCLUDED.background_context,
      final_thoughts = EXCLUDED.final_thoughts;

COMMIT;

-- Verse 2
BEGIN;
WITH e AS (
  INSERT INTO verse_explanations (book_name, chapter, verse_number, bible_version, sort_order, created_on, updated_on)
  VALUES ('Psalm', 105, 2, 'BSB', 9999, NOW(), NOW())
  ON CONFLICT (book_name, chapter, verse_number) DO UPDATE
    SET bible_version = EXCLUDED.bible_version,
        updated_on = NOW()
  RETURNING id
), ex AS (
  INSERT INTO verse_exegesis (explanation_id, explanation_text, application_text)
  VALUES ((SELECT id FROM e),
    $$Psalm 105:2 continues the opening call to worship by directing God’s people to respond to His faithfulness through both singing and speaking. The repeated command to sing emphasizes praise intentionally directed toward God. Singing is more than musical expression here; it is a way of honoring the LORD by remembering and celebrating His character and works. The command to “tell of all His wonders” then moves worship into testimony. What God has done should be remembered, spoken about, and passed on rather than forgotten.$$,
    $$Psalm 105:2 encourages believers to use their voices for God’s glory through praise and faithful testimony. We can sing about who God is, speak about what Scripture reveals He has done, remember His faithfulness, and tell others about His saving work in Christ. Our conversations should increasingly point away from ourselves and toward the greatness, goodness, and faithfulness of God.$$)
  ON CONFLICT (explanation_id) DO UPDATE
    SET explanation_text = EXCLUDED.explanation_text,
        application_text = EXCLUDED.application_text
  RETURNING id
)
;

DELETE FROM verse_word_studies_detailed WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_practical_applications WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_cross_references WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_themes WHERE explanation_id = (SELECT id FROM e);

INSERT INTO verse_word_studies_detailed (explanation_id, strongs_id, surface_text, custom_definition, sort_order)
VALUES
  ((SELECT id FROM e), 'H7891', 'Sing (shir)', $$Shir means to sing or express something through song. In Psalm 105:2, the command is specifically directed toward God: “Sing to Him.” Singing therefore becomes an intentional expression of worship in which God Himself is the object and focus of praise.$$, 0),
  ((SELECT id FROM e), 'H2167', 'Sing Praises (zamar)', $$Zamar means to sing praise, make music, or celebrate in song and can include instrumental accompaniment. Together with shir, the word strengthens the call for God’s people to respond actively and joyfully to His greatness.$$, 1)
;

INSERT INTO verse_practical_applications (explanation_id, application_text, sort_order)
VALUES
  ((SELECT id FROM e), 'Make Praise a Regular Part of Your Life', 0),
  ((SELECT id FROM e), 'Speak About God in Everyday Conversation', 1)
;

INSERT INTO verse_cross_references (explanation_id, book_name, chapter, verse_number, reference_text, commentary, sort_order)
VALUES ((SELECT id FROM e), 'Psalm', 96, 1, $$Sing to the LORD a new song; sing to the LORD, all the earth.$$, $$Related call to sing and proclaim.$$, 0)
;

INSERT INTO verse_themes (explanation_id, theme_name, sort_order)
VALUES ((SELECT id FROM e), 'Praise', 0), ((SELECT id FROM e), 'Testimony', 1)
;

INSERT INTO verse_study_metadata (explanation_id, introduction, background_author, background_book, background_context, final_thoughts)
VALUES ((SELECT id FROM e),
  $$Verse 2 focuses on singing and telling of God’s wonders, establishing an important principle for the entire psalm: remembering what God has done should produce worship and testimony.$$,
  $$As with verse 1, this material overlaps with 1 Chronicles 16:8–22 and has a Davidic liturgical connection.$$,
  $$Book IV of the Psalms (90–106).$$,
  $$Verse 2 moves worship into both music and testimony, complementing verse 1's commands.$$,
  $$The remainder of Psalm 105 demonstrates how remembering God’s works shapes true worship.$$)
ON CONFLICT (explanation_id) DO UPDATE
  SET introduction = EXCLUDED.introduction,
      background_author = EXCLUDED.background_author,
      background_book = EXCLUDED.background_book,
      background_context = EXCLUDED.background_context,
      final_thoughts = EXCLUDED.final_thoughts;

COMMIT;

-- Verse 3
BEGIN;
WITH e AS (
  INSERT INTO verse_explanations (book_name, chapter, verse_number, bible_version, sort_order, created_on, updated_on)
  VALUES ('Psalm', 105, 3, 'BSB', 9999, NOW(), NOW())
  ON CONFLICT (book_name, chapter, verse_number) DO UPDATE
    SET bible_version = EXCLUDED.bible_version,
        updated_on = NOW()
  RETURNING id
), ex AS (
  INSERT INTO verse_exegesis (explanation_id, explanation_text, application_text)
  VALUES ((SELECT id FROM e),
    $$Psalm 105:3 calls God’s people to “glory in His holy name.” To glory here means to boast, celebrate, or take pride in the LORD rather than in ourselves. God’s name represents His revealed identity, character, reputation, and authority, while His holiness declares that He is uniquely set apart and morally perfect. After commanding Israel to give thanks, sing, and tell of God’s wonders in verses 1–2, the psalm now directs their confidence toward God Himself.$$,
    $$Psalm 105:3 challenges believers to examine where they find their deepest confidence and joy. Achievements, possessions, recognition, and circumstances can change, but the holy character of God does not. As we seek Him through Scripture, prayer, worship, obedience, and dependence, we can learn to rejoice in who He is even during difficult seasons.$$)
  ON CONFLICT (explanation_id) DO UPDATE
    SET explanation_text = EXCLUDED.explanation_text,
        application_text = EXCLUDED.application_text
  RETURNING id
)
;

DELETE FROM verse_word_studies_detailed WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_practical_applications WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_cross_references WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_themes WHERE explanation_id = (SELECT id FROM e);

INSERT INTO verse_word_studies_detailed (explanation_id, strongs_id, surface_text, custom_definition, sort_order)
VALUES
  ((SELECT id FROM e), 'H1984', 'Glory (halal)', $$Halal can mean to praise, boast, celebrate, commend, or glory. In Psalm 105:3, the command is to make the LORD’s holy name the object of boasting.$$ , 0),
  ((SELECT id FROM e), 'H6944', 'Holy (qodesh)', $$Qodesh means holiness, sacredness, or that which is set apart. God is utterly distinct from creation and morally pure.$$ , 1)
;

INSERT INTO verse_practical_applications (explanation_id, application_text, sort_order)
VALUES
  ((SELECT id FROM e), 'Make God Your Greatest Boast', 0),
  ((SELECT id FROM e), 'Rejoice in God’s Character', 1)
;

INSERT INTO verse_cross_references (explanation_id, book_name, chapter, verse_number, reference_text, commentary, sort_order)
VALUES ((SELECT id FROM e), 'Psalm', 33, 21, $$For our hearts rejoice in Him, since we trust in His holy name.$$, $$Parallel thought about rejoicing in God.$$, 0)
;

INSERT INTO verse_themes (explanation_id, theme_name, sort_order)
VALUES ((SELECT id FROM e), 'Joy', 0), ((SELECT id FROM e), 'Holiness', 1)
;

INSERT INTO verse_study_metadata (explanation_id, introduction, background_author, background_book, background_context, final_thoughts)
VALUES ((SELECT id FROM e),
  $$Verse 3 moves the focus to rejoicing in God’s holy name and calling those who seek the LORD to rejoice.$$,
  $$Same literary and liturgical context as previous verses.$$,
  $$Book IV of the Psalms.$$,
  $$Verse 3 emphasizes inward joy grounded in God’s character.$$,
  $$Joy rooted in God’s character, not circumstances.$$)
ON CONFLICT (explanation_id) DO UPDATE
  SET introduction = EXCLUDED.introduction,
      background_author = EXCLUDED.background_author,
      background_book = EXCLUDED.background_book,
      background_context = EXCLUDED.background_context,
      final_thoughts = EXCLUDED.final_thoughts;

COMMIT;

-- Verse 4
BEGIN;
WITH e AS (
  INSERT INTO verse_explanations (book_name, chapter, verse_number, bible_version, sort_order, created_on, updated_on)
  VALUES ('Psalm', 105, 4, 'BSB', 9999, NOW(), NOW())
  ON CONFLICT (book_name, chapter, verse_number) DO UPDATE
    SET bible_version = EXCLUDED.bible_version,
        updated_on = NOW()
  RETURNING id
), ex AS (
  INSERT INTO verse_exegesis (explanation_id, explanation_text, application_text)
  VALUES ((SELECT id FROM e),
    $$Psalm 105:4 calls God’s people to a deliberate and continuing pursuit of the LORD. The repeated command “seek” gives the verse urgency: God is not to be treated as an occasional part of life but as the One toward whom His people continually turn. The command to seek “the LORD and His strength” reminds us that faithful living cannot rest merely upon human ability.$$,
    $$Psalm 105:4 challenges believers to make seeking God a continuing priority through Scripture, prayer, worship, and obedience. Seek God’s strength rather than relying on self-sufficiency.$$)
  ON CONFLICT (explanation_id) DO UPDATE
    SET explanation_text = EXCLUDED.explanation_text,
        application_text = EXCLUDED.application_text
  RETURNING id
)
;

DELETE FROM verse_word_studies_detailed WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_practical_applications WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_cross_references WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_themes WHERE explanation_id = (SELECT id FROM e);

INSERT INTO verse_word_studies_detailed (explanation_id, strongs_id, surface_text, custom_definition, sort_order)
VALUES
  ((SELECT id FROM e), 'H1875', 'Seek Out (darash)', $$Darash means to seek, inquire, investigate, resort to, or pursue with care. This word begins Psalm 105:4 in the command translated by the BSB as “Seek out the LORD.” It communicates intentional pursuit rather than passive interest.$$, 0),
  ((SELECT id FROM e), 'H5797', 'Strength (oz)', $$Oz means strength, might, power, or strong protection. The command to seek God’s strength acknowledges that His people are dependent upon power beyond themselves.$$, 1)
;

INSERT INTO verse_practical_applications (explanation_id, application_text, sort_order)
VALUES
  ((SELECT id FROM e), 'Make Seeking God a Daily Priority', 0),
  ((SELECT id FROM e), 'Depend on God’s Strength', 1)
;

INSERT INTO verse_cross_references (explanation_id, book_name, chapter, verse_number, reference_text, commentary, sort_order)
VALUES ((SELECT id FROM e), 'Jeremiah', 29, 13, $$You will seek Me and find Me when you search for Me with all your heart.$$, $$Wholehearted seeking.$$, 0)
;

INSERT INTO verse_themes (explanation_id, theme_name, sort_order)
VALUES ((SELECT id FROM e), 'Seeking', 0), ((SELECT id FROM e), 'Dependence', 1)
;

INSERT INTO verse_study_metadata (explanation_id, introduction, background_author, background_book, background_context, final_thoughts)
VALUES ((SELECT id FROM e),
  $$Verse 4 intensifies the call to seek the LORD and His strength, and to seek His face always.$$,
  $$Shared context with verses 1–3.$$,
  $$Book IV of the Psalms.$$,
  $$Emphasis on persistent devotion and seeking God’s presence.$$,
  $$Seeking God is a lifelong orientation that shapes decisions and priorities.$$)
ON CONFLICT (explanation_id) DO UPDATE
  SET introduction = EXCLUDED.introduction,
      background_author = EXCLUDED.background_author,
      background_book = EXCLUDED.background_book,
      background_context = EXCLUDED.background_context,
      final_thoughts = EXCLUDED.final_thoughts;

COMMIT;

-- Verse 5
BEGIN;
WITH e AS (
  INSERT INTO verse_explanations (book_name, chapter, verse_number, bible_version, sort_order, created_on, updated_on)
  VALUES ('Psalm', 105, 5, 'BSB', 9999, NOW(), NOW())
  ON CONFLICT (book_name, chapter, verse_number) DO UPDATE
    SET bible_version = EXCLUDED.bible_version,
        updated_on = NOW()
  RETURNING id
), ex AS (
  INSERT INTO verse_exegesis (explanation_id, explanation_text, application_text)
  VALUES ((SELECT id FROM e),
    $$Psalm 105:5 calls God’s people to intentionally remember what the LORD has done and what He has spoken. In Scripture, remembering is more than simply having information stored in the mind; it involves deliberately bringing God’s works back into conscious attention so that they shape faith, worship, and obedience.$$,
    $$Psalm 105:5 encourages believers to develop habits of biblical remembrance by revisiting God’s mighty works recorded in Scripture and recalling God’s faithfulness in their lives.$$)
  ON CONFLICT (explanation_id) DO UPDATE
    SET explanation_text = EXCLUDED.explanation_text,
        application_text = EXCLUDED.application_text
  RETURNING id
)
;

DELETE FROM verse_word_studies_detailed WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_practical_applications WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_cross_references WHERE explanation_id = (SELECT id FROM e);
DELETE FROM verse_themes WHERE explanation_id = (SELECT id FROM e);

INSERT INTO verse_word_studies_detailed (explanation_id, strongs_id, surface_text, custom_definition, sort_order)
VALUES
  ((SELECT id FROM e), 'H2142', 'Remember (zakar)', $$Zakar means to remember, recall, mention, or bring something to mind. In Psalm 105:5, remembering is an intentional response to God’s works.$$, 0),
  ((SELECT id FROM e), 'H6381', 'Wonders (pala)', $$Pala means wonderful, extraordinary, or remarkable. In Psalm 105 these wonders refer to God’s mighty acts that reveal His power and faithfulness.$$, 1)
;

INSERT INTO verse_practical_applications (explanation_id, application_text, sort_order)
VALUES
  ((SELECT id FROM e), 'Build a Habit of Remembering God’s Works', 0),
  ((SELECT id FROM e), 'Let Scripture Shape Your Memory of God', 1)
;

INSERT INTO verse_cross_references (explanation_id, book_name, chapter, verse_number, reference_text, commentary, sort_order)
VALUES ((SELECT id FROM e), 'Psalm', 77, 11, $$I will remember the works of the LORD; yes, I will remember Your wonders of old.$$, $$Remembering in distress.$$, 0)
;

INSERT INTO verse_themes (explanation_id, theme_name, sort_order)
VALUES ((SELECT id FROM e), 'Remembrance', 0), ((SELECT id FROM e), 'Faithfulness', 1)
;

INSERT INTO verse_study_metadata (explanation_id, introduction, background_author, background_book, background_context, final_thoughts)
VALUES ((SELECT id FROM e),
  $$Verse 5 introduces the command to remember God’s wonders, marvels, and the judgments He has pronounced, preparing the reader for the historical account that follows.$$,
  $$Same psalm context as verses 1–4.$$,
  $$Book IV of the Psalms.$$,
  $$Remembering God’s works and words anchors trust and worship.$$,
  $$Remembrance turns history into worship and gives confidence for present trust.$$)
ON CONFLICT (explanation_id) DO UPDATE
  SET introduction = EXCLUDED.introduction,
      background_author = EXCLUDED.background_author,
      background_book = EXCLUDED.background_book,
      background_context = EXCLUDED.background_context,
      final_thoughts = EXCLUDED.final_thoughts;

COMMIT;

-- End of script
