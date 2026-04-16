export interface VerseExplanation {
  id: number;
  book_name: string;
  chapter: number;
  verse_number: number;
  author_info: string;
  book_info: string;
  context_info: string;
  cross_references: string;
  explanation: string;
  final_thoughts: string;
  key_themes: string;
  learn_more: string;
  practical_applications: string;
  takeaways: string;
  word_study: string;
  created_on: string;
  updated_on: string;
}

export interface DailyVerse {
  id: number;
  book_name: string;
  chapter: number;
  verse_number: number;
  verse_text: string;
  date: string;
  reflection: string;
}

export const verseExplanations: VerseExplanation[] = [
  {
    id: 1,
    book_name: "John",
    chapter: 3,
    verse_number: 16,
    author_info: "John the Apostle, also known as the 'beloved disciple,' was one of Jesus' closest followers and wrote this Gospel around 85-90 AD.",
    book_info: "The Gospel of John is the fourth Gospel and presents a unique theological perspective on Jesus' life and ministry, emphasizing His divine nature.",
    context_info: "This verse appears in Jesus' nighttime conversation with Nicodemus, a Pharisee and member of the Jewish ruling council who came seeking answers about spiritual rebirth.",
    cross_references: "Romans 5:8, 1 John 4:9-10, Romans 8:32, Ephesians 2:4-5",
    explanation: "This verse encapsulates the entire Gospel message in a single sentence. It reveals God's motivation (love), His action (giving His Son), the condition (believing), and the result (eternal life). The word 'world' emphasizes the universal scope of God's love - it extends to all humanity without exception.",
    final_thoughts: "John 3:16 serves as both an invitation and a promise. It invites us to believe and promises eternal life to those who do. This verse has brought hope to countless millions throughout history.",
    key_themes: "God's unconditional love, Salvation through faith, Eternal life, The gift of Jesus, Universal invitation",
    learn_more: "Study the entire conversation with Nicodemus in John 3:1-21. Explore the concept of 'eternal life' in John's Gospel.",
    practical_applications: "Share this message of hope with others. Reflect daily on God's love for you personally. Let this truth shape how you view yourself and others.",
    takeaways: "God's love is the foundation of salvation. Belief in Jesus is the pathway to eternal life. No one is excluded from God's offer of grace.",
    word_study: "The Greek word 'agapao' (love) used here describes God's unconditional, self-sacrificing love. 'Monogenes' (only begotten) emphasizes the unique relationship between Father and Son.",
    created_on: "2024-01-15",
    updated_on: "2024-01-15"
  },
  {
    id: 2,
    book_name: "Philippians",
    chapter: 4,
    verse_number: 13,
    author_info: "The Apostle Paul wrote this letter while imprisoned in Rome, around 61-62 AD. Despite his chains, his letter overflows with joy and encouragement.",
    book_info: "Philippians is a letter of joy, partnership, and encouragement written to the church at Philippi, the first European church Paul established.",
    context_info: "Paul writes this in the context of contentment - he has learned to be content whether in plenty or in want, whether well-fed or hungry.",
    cross_references: "2 Corinthians 12:9-10, Ephesians 3:16, Colossians 1:11, Isaiah 40:31",
    explanation: "This verse is often misunderstood as a promise of success in all endeavors. In context, Paul is speaking about the strength to endure all circumstances - both abundance and need. The 'all things' refers to facing any situation with contentment through Christ's empowering presence.",
    final_thoughts: "True strength is not about achieving everything we want, but about remaining faithful and content in every circumstance through Christ's enabling power.",
    key_themes: "Christ's empowerment, Contentment, Perseverance, Divine strength, Spiritual endurance",
    learn_more: "Read Philippians 4:10-20 for the full context. Study Paul's perspective on suffering in 2 Corinthians.",
    practical_applications: "Face difficult circumstances with confidence in Christ. Practice contentment in both abundance and lack. Rely on Christ's strength rather than your own.",
    takeaways: "Christ enables us to face any circumstance. Contentment comes from Christ, not circumstances. Our strength is found in Him, not ourselves.",
    word_study: "The Greek 'endunamoo' (strengthens) suggests being empowered from within. 'Panta' (all things) refers to all circumstances Paul has described.",
    created_on: "2024-01-16",
    updated_on: "2024-01-16"
  },
  {
    id: 3,
    book_name: "Psalm",
    chapter: 23,
    verse_number: 1,
    author_info: "King David, the shepherd who became Israel's greatest king, wrote this psalm. His experience as a shepherd informs this beautiful metaphor.",
    book_info: "The Book of Psalms is a collection of 150 songs and prayers used in worship. Psalm 23 is perhaps the most beloved and memorized passage in all of Scripture.",
    context_info: "David draws from his personal experience as a shepherd to describe God's care. Shepherds in ancient Israel were responsible for every aspect of their flock's welfare.",
    cross_references: "John 10:11, Ezekiel 34:11-16, Isaiah 40:11, 1 Peter 2:25",
    explanation: "By declaring 'The Lord is my shepherd,' David establishes a personal, intimate relationship with God. The metaphor implies complete trust, dependency, and care. Because the Lord is his shepherd, David lacks nothing essential - all his needs are met.",
    final_thoughts: "This psalm invites us into a relationship of trust where we acknowledge God as our provider, protector, and guide through all of life's journey.",
    key_themes: "God as shepherd, Divine provision, Trust, Contentment, Personal relationship with God",
    learn_more: "Study the entire Psalm 23 and John 10 where Jesus declares Himself the Good Shepherd.",
    practical_applications: "Trust God for daily provision. Rest in His guidance. Find contentment in His care rather than in circumstances.",
    takeaways: "God personally cares for each of us. In Him, we have everything we truly need. Trust transforms our perspective on provision.",
    word_study: "The Hebrew 'ra'ah' (shepherd) implies feeding, tending, and leading. 'Lo echsar' (I shall not want) means lacking nothing necessary.",
    created_on: "2024-01-17",
    updated_on: "2024-01-17"
  }
];

export const dailyVerses: DailyVerse[] = [
  {
    id: 1,
    book_name: "Proverbs",
    chapter: 3,
    verse_number: 5,
    verse_text: "Trust in the LORD with all your heart and lean not on your own understanding.",
    date: "2024-01-21",
    reflection: "Today, surrender your need to understand everything. Trust that God's wisdom exceeds your own."
  },
  {
    id: 2,
    book_name: "Isaiah",
    chapter: 41,
    verse_number: 10,
    verse_text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
    date: "2024-01-20",
    reflection: "Whatever challenges you face today, remember that God's presence and strength are with you."
  },
  {
    id: 3,
    book_name: "Romans",
    chapter: 8,
    verse_number: 28,
    verse_text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    date: "2024-01-19",
    reflection: "Even in difficult times, trust that God is weaving together something beautiful in your life."
  },
  {
    id: 4,
    book_name: "Jeremiah",
    chapter: 29,
    verse_number: 11,
    verse_text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.",
    date: "2024-01-18",
    reflection: "God's plans for you are good. Rest in His purposes for your life today."
  },
  {
    id: 5,
    book_name: "Matthew",
    chapter: 11,
    verse_number: 28,
    verse_text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    date: "2024-01-17",
    reflection: "Bring your burdens to Jesus today. He offers true rest for your soul."
  }
];

export const dashboardStats = {
  totalVerses: 31102,
  explanationsCount: 156,
  dailyVersesCount: 365,
  booksCovered: 66
};
