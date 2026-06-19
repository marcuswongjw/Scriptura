// Berea Course & Module Data based on "The Beautiful Book Study Guide"
export const concentrations = [
  {
    id: "foundations",
    title: "Foundations",
    group: "General",
    description: "Foundational rules for reading the Bible as a beautiful, connected masterpiece.",
    modules: ["beautiful-book-intro"]
  },
  {
    id: "genesis",
    title: "Genesis",
    group: "Books of the Bible",
    description: "The book of beginnings: Creation, the Fall, the spread of sin, and the covenants with the patriarchs.",
    modules: [
      "genesis-creation",
      "genesis-fall-sin",
      "genesis-twelve-abraham",
      "genesis-twentyfive-fifty-patriarchs"
    ]
  },
  {
    id: "exodus",
    title: "Exodus",
    group: "Books of the Bible",
    description: "God's redemption of His people from Egypt, the law, and the Tabernacle.",
    modules: ["exodus-deliverance"]
  },
  {
    id: "leviticus",
    title: "Leviticus",
    group: "Books of the Bible",
    description: "The five offerings, the seven feasts, and the symbols of the Tabernacle.",
    modules: ["leviticus-worship"]
  },
  {
    id: "numbers",
    title: "Numbers",
    group: "Books of the Bible",
    description: "The forty years of wilderness wandering, censuses, and lessons of obedience.",
    modules: ["numbers-wilderness"]
  }
];

export const modules = [
  {
    id: "beautiful-book-intro",
    title: "Introduction to The Beautiful Book",
    category: "Foundations",
    duration: "7 mins",
    xpReward: 100,
    description: "Discover the overarching goal of the Bible, the dangers of 'selective reading,' and the unique storyline that binds all 66 books together.",
    slides: [
      {
        type: "info",
        title: "The Goal of This Series",
        keyTakeaway: "The Bible is not a reading plan for discipline, but a connected masterpiece for delight.",
        aiTutorExplanation: "To read the Bible effectively, we must shift our motive from duty to delight. The goal of this curriculum is not to check off boxes, but to see how all 66 books are connected as a single, beautiful story telling of a wonderful God.",
        scripture: "Psalm 119:18",
        scriptureText: {
          ESV: "Open my eyes, that I may behold wondrous things out of your law.",
          NIV: "Open my eyes that I may see wonderful things in your law.",
          KJV: "Open thou mine eyes, that I may behold wondrous things out of thy law."
        },
        content: `The goal of this course is to enable you to see the Bible as a **beautiful book**—the greatest masterpiece God has given us, placed directly into our hands.

This series is **not** a reading plan designed to force discipline, but a path to help you find **delight** in reading. It is not an academic survey of facts, but a journey to fill your heart with love for the scriptures.`,
        illustration: "📖"
      },
      {
        type: "info",
        title: "The Danger of 'Selective Fondness'",
        keyTakeaway: "Selective fondness built on isolated verses creates divisions and misses the whole story.",
        aiTutorExplanation: "Choosing favorite verses out of context creates 'selective Christianities' (such as the Prosperity Gospel or denominational divides). By learning to read every verse within the context of the entire Bible, we protect ourselves from error and see the complete picture.",
        scripture: "Acts 20:27",
        scriptureText: {
          ESV: "for I did not shrink from declaring to you the whole counsel of God.",
          NIV: "For I have not hesitated to proclaim to you the whole will of God.",
          KJV: "For I have not shunned to declare unto you all the counsel of God."
        },
        content: `Many Christians have favorite verses or chapters. However, selectively focusing on only the parts we love can lead us to build our entire theology around isolated concepts.
        
This "selective fondness" is why we have over **40,000 denominations** today. Each view may contain truth, but we run the risk of building our lives around a single aspect rather than seeing the **entire Bible as one connected Book**.`,
        illustration: "🧩"
      },
      {
        type: "quiz",
        title: "Active Recall Check",
        aiTutorExplanation: "Remember: 'Selective fondness' refers to taking verses out of context, leading to personal interpretations that create sectarian divisions. The solution is reading the Bible as ONE unified book.",
        question: "What is the primary danger of having a 'selective fondness' for only certain verses in the Bible?",
        options: [
          "It makes it harder to memorize the books of the Bible in order.",
          "It can lead to building our entire theology around isolated verses rather than the whole context.",
          "It prevents us from using modern digital translations of the scriptures.",
          "It makes the Bible too academic to read."
        ],
        correctAnswer: 1,
        explanation: "Correct! Selective fondness can distort our understanding, creating divisions and theology built on isolated verses rather than 'the whole counsel of God' in context."
      },
      {
        type: "info",
        title: "A Spiritual Book, Not Academic",
        keyTakeaway: "The Bible is not graded; it suits all levels of spiritual maturity.",
        aiTutorExplanation: "Unlike a school textbook where failing to understand a chapter means failure, the Bible contains layers of truth that unfold as your faith matures. If a passage is difficult, do not get discouraged; expect God to speak to you in due time.",
        scripture: "1 Corinthians 2:14",
        scriptureText: {
          ESV: "The natural person does not accept the things of the Spirit of God, for they are folly to him, and he is not able to understand them because they are spiritually discerned.",
          NIV: "The person without the Spirit does not accept the things that come from the Spirit of God but looks on them as foolishness, and cannot understand them because they are discerned only through the Spirit.",
          KJV: "But the natural man receiveth not the things of the Spirit of God: for they are foolishness unto him: neither can he know them, because they are spiritually discerned."
        },
        content: `The Bible is a **spiritual book**, not a school textbook. School textbooks are graded by difficulty, and failing to understand means you failed. 

The Bible, however, is **not graded**. It is perfect for babies in the faith as well as scholarly Christians. If you don't understand a passage, do not be discouraged! It may simply be meant for a later stage of spiritual maturity. Read it with the heart of a child, expecting God to speak to you.`,
        illustration: "🕊️"
      },
      {
        type: "info",
        title: "The Structure: A Two-Part Drama",
        keyTakeaway: "1% of the Bible shows how things went wrong; 99% shows how God rights that wrong.",
        aiTutorExplanation: "The first 11 chapters of Genesis represent the first 1% of the Bible, depicting the creation and the fall. The remaining 99% is the unfolding redemption drama of how God rescues man from himself.",
        scripture: "Genesis 1:1",
        scriptureText: {
          ESV: "In the beginning, God created the heavens and the earth.",
          NIV: "In the beginning God created the heavens and the earth.",
          KJV: "In the beginning God created the heaven and the earth."
        },
        content: `The Bible is beautifully structured into two simple, primary sections:

1. **The First 1% (Genesis 1-11):** Tells us how this beautiful world went wrong. Like environmental pollution or moral failure, it shows things are not as they should be.
2. **The Remaining 99%:** Tells us how God would right that wrong—not by fixing the physical world immediately, but by **redeeming man** and making him a new creation.`,
        illustration: "🎭"
      },
      {
        type: "quiz",
        title: "Structure Check",
        aiTutorExplanation: "Recall the 1% vs. 99% rule. The first 1% is the setup (Creation and Fall, Genesis 1-11). The remaining 99% is the execution of God's redemption program to save man.",
        question: "According to 'The Beautiful Book,' what does the remaining 99% of the Bible outline?",
        options: [
          "A detailed historical list of the kings of Israel and Judah.",
          "A redemption drama of how God rescues man from himself and rights what went wrong.",
          "An academic commentary explaining the natural sciences.",
          "A strict checklist of rules and laws for Old Testament priests."
        ],
        correctAnswer: 1,
        explanation: "Excellent! The remaining 99% is the unfolding drama of redemption, showing God's power, patience, wisdom, mercy, and judgment as He rescues humanity."
      },
      {
        type: "summary",
        title: "Welcome to Berea!",
        aiTutorExplanation: "You've successfully unlocked the Foundations course. Next, you will start Genesis Chapter 1: The Orderly Creation.",
        content: `Fantastic job! You have completed the introduction! 

You are now ready to view the Bible not as a lucky dip for daily blessings, but as one beautiful, unified masterpiece about a wonderful and amazing God. Let's dive into Genesis Chapter 1.`,
        illustration: "🏆"
      }
    ]
  },
  {
    id: "genesis-creation",
    title: "Genesis 1–2: The Creation of All Things",
    category: "Creation",
    duration: "11 mins",
    xpReward: 200,
    description: "Discover how God created the universe in orderly symmetry, learn the personal name YHWH, understand the breath of life (Nephesh), the two sacramental trees, and the structure of marriage.",
    slides: [
      {
        type: "info",
        title: "Order, Not Chaos",
        keyTakeaway: "God created in two orderly sets of 3 days: preparing the stage, then placing the cast.",
        aiTutorExplanation: "God is a God of order. In the first set of 3 days, He established divisions (places/environment). In the second set of 3 days, He populated those environments (cast/actors).",
        scripture: "Genesis 1:3-5",
        scriptureText: {
          ESV: "And God said, 'Let there be light,' and there was light... And God separated the light from the darkness...",
          NIV: "And God said, 'Let there be light,' and there was light... God separated the light from the darkness.",
          KJV: "And God said, Let there be light: and there was light... and God divided the light from the darkness."
        },
        content: `God did not create the universe in a haphazard way, but in an **orderly and organized fashion**. He created it in **two sets of 3 days**:

* **Days 1–3:** God creates the **places** (preparing the stage for the redemption drama).
* **Days 4–6:** God puts the **cast** (sun, moon, animals, and humanity) into their places.

This shows that God is not a God of chaos, but of structure, beauty, and intention.`,
        illustration: "🏛️"
      },
      {
        type: "info",
        title: "Days 1–3: The Stage (Divisions)",
        keyTakeaway: "The first three days establish divisions: light/dark, waters above/below, land/sea.",
        aiTutorExplanation: "Day 1 divided light from darkness (the light came from God, not the sun). Day 2 divided the waters with a moisture canopy (firmament). Day 3 divided land from water, preparing the dry land as the main stage.",
        scripture: "Genesis 1:6-8",
        scriptureText: {
          ESV: "And God said, 'Let there be an expanse in the midst of the waters, and let it separate the waters from the waters.'",
          NIV: "And God said, 'Let there be a vault between the waters to separate water from water.'",
          KJV: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters."
        },
        content: `The first three days are defined by **contrast and division**:

* **Day 1:** God divides the *Light* from *Darkness*. Note: This light came from God Himself—the Sun was not created until Day 4.
* **Day 2:** God creates an expanse (firmament) to divide the waters below from the waters above. This created a **moisture canopy** around the earth.
* **Day 3:** God gathers the seas to let dry land appear and produces vegetation.`,
        illustration: "🎭"
      },
      {
        type: "quiz",
        title: "Stage vs. Cast",
        aiTutorExplanation: "The first three days are all about 'division'—prepping the stage so the actors have environments to occupy. Days 4–6 are when the actors step onto those stages.",
        question: "What occurred during the first set of 3 days in Genesis Chapter 1?",
        options: [
          "God populated the earth with animals, birds, and fish.",
          "God created the places and prepared the stage through division (light, water canopy, and dry land).",
          "God rested from all His work and blessed the Seventh Day.",
          "God established the covenants with Abraham and Noah."
        ],
        correctAnswer: 1,
        explanation: "Correct! The first three days prepared the environment or stage through structured division."
      },
      {
        type: "info",
        title: "Days 4–6: The Cast (Actors)",
        keyTakeaway: "Days 4 to 6 place the actors: spotlights, background actors, and the main cast (humanity).",
        aiTutorExplanation: "Day 4 introduces the sun and moon (spotlights). Day 5 places birds and fish (background elements). Day 6 introduces land animals and man/woman, the main actors in God's image.",
        scripture: "Genesis 1:26",
        scriptureText: {
          ESV: "Then God said, 'Let us make man in our image, after our likeness...'",
          NIV: "Then God said, 'Let us make mankind in our image, in our likeness...'",
          KJV: "And God said, Let us make man in our image, after our likeness..."
        },
        content: `Once the stage was set, the actors stepped out:

* **Day 4:** God places the Sun, Moon, and Stars (like spotlights in the theater — filling the environment of Day 1).
* **Day 5:** Background actors — birds of the air and sea creatures (filling Day 2's environment).
* **Day 6:** The supporting cast (land animals) followed by the main cast: **man and woman**, made in God's image (filling Day 3's land).`,
        illustration: "👥"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "The Sun, Moon, and Stars were placed on Day 4. The light on Day 1 was created directly by God, symbolizing spiritual light—God Himself is the source.",
        question: "The Sun was created on the first day of creation to produce the initial light.",
        correctAnswer: "no",
        explanation: "False! Light was created on Day 1 (sourced from God Himself), whereas the Sun, Moon, and Stars were placed on Day 4."
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "There is a perfect correspondence between Days 1–3 and Days 4–6. Day 1 (light) corresponds to Day 4 (sun/moon), Day 2 (water/sky) to Day 5 (fish/birds), and Day 3 (land) to Day 6 (animals/humans).",
        question: "Each of the first three days of creation corresponds to one of the second three days — the stage matches its actor.",
        correctAnswer: "yes",
        explanation: "True! Day 1 (light) → Day 4 (luminaries). Day 2 (water/sky) → Day 5 (fish/birds). Day 3 (land) → Day 6 (land animals/humans)."
      },
      {
        type: "info",
        title: "The Principle of Multiplication",
        keyTakeaway: "God's method of growth is geometric multiplication — reproducing 'after its kind.'",
        aiTutorExplanation: "In Genesis 1, 'multiply' appears 3 times and 'after its kind' appears 10 times. God values reproduction. In spiritual growth, this represents discipleship: reproducing your faith in others rather than relying on linear addition.",
        scripture: "Genesis 1:28",
        scriptureText: {
          ESV: "And God blessed them. And God said to them, 'Be fruitful and multiply and fill the earth...'",
          NIV: "God blessed them and said to them, 'Be fruitful and increase in number; fill the earth...'",
          KJV: "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth..."
        },
        content: `In Genesis 1, the word **"MULTIPLY"** appears 3 times, and the phrase **"AFTER ITS KIND"** appears 10 times.

God's method of growth is **geometric multiplication**, not addition. A pastor adding 10 members per year = linear growth. But every believer discipling another who disciples another = **exponential, geometric growth**.

> Jesus commanded this in Matthew 28:19-20 — "Go and make disciples" (multiplicative), not merely "bring people to church" (additive).`,
        illustration: "📈"
      },
      {
        type: "quiz",
        title: "Growth Check",
        aiTutorExplanation: "Multiplication is exponential (geometric). A pastor adding members is linear (addition). Discipleship focuses on training leaders to make more leaders, resulting in multiplication.",
        question: "How does the 'multiplication after its kind' principle translate to Christian discipleship?",
        options: [
          "By inviting everyone to a single large event each year.",
          "By encouraging each believer to make and train disciples who can teach others in turn.",
          "By relying entirely on the pastor to add ten members a year.",
          "By focusing on academic theology degrees."
        ],
        correctAnswer: 1,
        explanation: "Spot on! Discipleship works like biological multiplication: cell leaders and teachers training others to teach, creating geometric growth."
      },
      {
        type: "info",
        title: "The 7th Day and God's Personal Name",
        keyTakeaway: "God rested as a role model, and in Genesis 2, He reveals His personal covenant name: YHWH.",
        aiTutorExplanation: "God rested not from fatigue, but to model spiritual rest (holy day/holiday). In Gen 2, He changes from the generic 'Elohim' to His personal covenant name, YHWH, meaning 'Always' or 'I Am.'",
        scripture: "Genesis 2:3",
        scriptureText: {
          ESV: "So God blessed the seventh day and made it holy, because on it God rested from all his work...",
          NIV: "Then God blessed the seventh day and made it holy, because on it he rested from all the work...",
          KJV: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work..."
        },
        content: `Chapter 2 introduces two major developments:

* **The Sabbath Rest:** God rested — not from exhaustion, but to model the rhythm of spiritual replenishment. A *Holy Day* is the origin of every "holiday." God built rest into the owner's manual.
* **The Name Change:** In Chapter 1, God is "Elohim" (a generic title, like "God"). In Chapter 2, He introduces His **personal covenant name: YHWH (Yahweh)** — meaning *"I AM"* or the Eternal, Unchanging, Ever-Present One.`,
        illustration: "🕰️"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Elohim is a plural word used in Chapter 1 (hinting at the Trinity). YHWH is God's personal covenant name, first introduced in Chapter 2. It means 'I Am' or 'the Always-Existing One.'",
        question: "YHWH (Yahweh) is the personal covenant name of God, meaning 'I AM' or 'the Eternal One,' first introduced in Genesis Chapter 2.",
        correctAnswer: "yes",
        explanation: "True! Chapter 1 uses 'Elohim,' a general title. Chapter 2 introduces 'YHWH,' God's intimate, personal name — the same name revealed to Moses at the burning bush."
      },
      {
        type: "info",
        title: "The Breath of Life (Nephesh)",
        keyTakeaway: "Man is formed of dust and God's breath, becoming a unified living being (Nephesh).",
        aiTutorExplanation: "Hebrew anthropology is unified: a human is a 'Nephesh' (living creature), not a ghost in a cheap envelope. The dust represents our physical limits, but God's breath represents our sacred value.",
        scripture: "Genesis 2:7",
        scriptureText: {
          ESV: "then the LORD God formed the man of dust from the ground and breathed into his nostrils the breath of life, and the man became a living creature.",
          NIV: "Then the LORD God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being.",
          KJV: "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul."
        },
        content: `God made man from the **dust of the ground** and breathed into his nostrils the **breath of life**. Man became a *Nephesh* — a **living being** or **living soul**.

A human is not a disembodied soul trapped in a physical prison. We are a **unified** body and spirit — our physical life is sacred because God's own breath animates it.

> When we are born again, God breathes His Holy Spirit (*Pneuma* in Greek) into us once more — a new creation (John 20:22).`,
        illustration: "💨"
      },
      {
        type: "quiz",
        title: "Nephesh Vocabulary Check",
        aiTutorExplanation: "Dualistic views of humans being a soul trapped in a physical prison are Greek/Platonic, not Hebrew. 'Nephesh' represents the whole person, physical and spiritual combined, made alive by God.",
        question: "What does the Hebrew word 'Nephesh' in Genesis 2:7 mean?",
        options: [
          "An invisible ghost trapped inside a physical shell.",
          "A living being / living soul, expressing a unified physical and spiritual existence.",
          "The literal chemical dust elements in the ground.",
          "The academic study of theology."
        ],
        correctAnswer: 1,
        explanation: "Correct! 'Nephesh' represents a complete living being, showing that the physical body made alive by God's breath is a unified, sacred creation."
      },
      {
        type: "info",
        title: "The Two Sacramental Trees",
        keyTakeaway: "The two trees reveal that God sets the boundaries — He defines what is good for us.",
        aiTutorExplanation: "The Tree of Life represents eternal communion with God. The Tree of Knowledge of Good and Evil tests Adam's trust in God's boundaries. Eating from it was not about gaining knowledge per se, but about asserting human autonomy over God's authority.",
        scripture: "Genesis 2:16-17",
        scriptureText: {
          ESV: "And the LORD God commanded the man, saying, 'You may surely eat of every tree of the garden, but of the tree of the knowledge of good and evil you shall not eat...'",
          NIV: "And the LORD God commanded the man, 'You are free to eat from any tree in the garden; but you must not eat from the tree of the knowledge of good and evil...'",
          KJV: "And the LORD God commanded the man, saying, Of every tree of the garden thou mayest freely eat: But of the tree of the knowledge of good and evil, thou shalt not eat of it..."
        },
        content: `Two trees stood in the center of the Garden of Eden:

1. **The Tree of Life:** Representing eternal communion with God. To eat from it is to live forever in God's presence.
2. **The Tree of Knowledge of Good and Evil:** A test of **trust and submission**. The issue was not knowledge itself, but whether Adam trusted that God — not himself — is the ultimate authority on what is good and evil.

The warning was: *"On the day you eat, you shall surely die."* Death means separation — from God first (spiritual death), and eventually physical death.`,
        illustration: "🌳"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "God gave permission to eat from ALL trees, including the Tree of Life. Only the Tree of Knowledge of Good and Evil was restricted. This shows God's generosity, not stinginess.",
        question: "God only allowed Adam to eat from the Tree of Knowledge — all other trees were off-limits.",
        correctAnswer: "no",
        explanation: "False! God permitted Adam to eat from EVERY tree in the garden — including the Tree of Life. Only ONE tree was restricted."
      },
      {
        type: "info",
        title: "Marriage: The Sacred Foundation",
        keyTakeaway: "God designed marriage as a covenant between one man and one woman, leaving and cleaving.",
        aiTutorExplanation: "The structure of marriage in Genesis 2 is: leave parents, cleave to spouse, become one flesh. This is God's blueprint. Eve was taken from Adam's side (rib), symbolizing equality, partnership, and intimacy.",
        scripture: "Genesis 2:24",
        scriptureText: {
          ESV: "Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh.",
          NIV: "That is why a man leaves his father and mother and is united to his wife, and they become one flesh.",
          KJV: "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh."
        },
        content: `God created Eve from Adam's **rib** — not from his feet (to be stepped on), not from his head (to rule over him), but from his **side**, as an equal and companion.

The blueprint for marriage has three steps:
1. **Leave** — break from primary parental attachment.
2. **Cleave** — bond to your spouse in covenant.
3. **One Flesh** — the two become a unified partnership.

This design exists before culture, before the fall, and before religion — it is God's original intention for family.`,
        illustration: "💍"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Eve was formed from Adam's rib — from his side, signifying partnership and equality. This is deliberate: not from his head (to rule), not from his feet (to be dominated), but from his side (to be his equal companion).",
        question: "Eve was created from Adam's rib — from his side — symbolizing equal partnership and companionship.",
        correctAnswer: "yes",
        explanation: "True! The rib from the side is symbolic of equal partnership — side by side, walking together."
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Marriage in Genesis 2 was designed by God before the Fall, before the Law, and before any culture. It is a universal, pre-cultural institution: one man, one woman, in covenant.",
        question: "The institution of marriage was designed by God before the Fall — it is a pre-Fall, pre-culture covenant structure.",
        correctAnswer: "yes",
        explanation: "True! Genesis 2:24 is pre-Fall. Marriage was God's design from the beginning, not a cultural invention."
      },
      {
        type: "quiz",
        title: "Creation Synthesis",
        aiTutorExplanation: "Genesis 2 presents a detailed, intimate zoom-in on Day 6 — focusing specifically on the creation of man and woman, the garden, and the first human relationships.",
        question: "In Genesis Chapter 2, what new name does God use for the first time, and what does it mean?",
        options: [
          "El Shaddai, meaning 'God Almighty'.",
          "YHWH (Yahweh), meaning 'I AM' — the eternal, covenant name of God.",
          "Adonai, meaning 'Lord' or 'Master'.",
          "Elohim, meaning 'Creator God'."
        ],
        correctAnswer: 1,
        explanation: "Correct! Genesis 2 introduces YHWH (Yahweh) for the first time — God's personal covenant name meaning 'the Eternal I AM.'"
      },
      {
        type: "summary",
        title: "Creation Mastered! 🏆",
        aiTutorExplanation: "Excellent! You've completed the full study of Genesis 1 and 2. Next you'll explore the Fall and the spread of sin.",
        content: `Outstanding! You have completed Genesis Chapters 1–2.

You now understand:
* The **two-set structure** of creation (Stage + Cast)
* The **light from God on Day 1** (not the sun)
* The **principle of multiplication** in discipleship
* **YHWH** — God's personal covenant name
* **Nephesh** — the unity of body and spirit
* The **two sacramental trees** and what they represent
* **Marriage** as a God-designed covenant

Let's move on to Genesis 3–11 to understand how sin entered and spread through the world.`,
        illustration: "🌟"
      }
    ]
  },
  {
    id: "genesis-fall-sin",
    title: "Genesis 3–11: The Fall and the Spread of Sin",
    category: "The Fall",
    duration: "11 mins",
    xpReward: 200,
    description: "Analyze Satan's strategies in the Garden, the source of brokenness in our world, the first Gospel promise, the spread of sin through Cain and Abel, the Flood, and the Tower of Babel.",
    slides: [
      {
        type: "info",
        title: "The Serpent's Strategy",
        keyTakeaway: "Satan's first tactic: add to God's words, then deny God's words.",
        aiTutorExplanation: "The serpent first asks Eve a question to introduce doubt. Then Eve adds to God's word ('neither shall you touch it'), which made God's command seem harsher than it was. Satan then denied God's warning entirely. This is his classic pattern: doubt → distort → deny.",
        scripture: "Genesis 3:1",
        scriptureText: {
          ESV: "Now the serpent was more crafty than any other beast of the field that the LORD God had made. He said to the woman, 'Did God actually say...?'",
          NIV: "Now the serpent was more crafty than any wild animal the LORD God had made. He said to the woman, 'Did God really say...?'",
          KJV: "Now the serpent was more subtle than any beast of the field which the LORD God had made. And he said unto the woman, Yea, hath God said...?"
        },
        content: `Satan's strategy follows a three-step pattern that he still uses today:

1. **Doubt:** *"Did God really say?"* — He questions the reliability of God's word.
2. **Distort:** Eve adds "neither shall you touch it" to God's actual command — making it sound harsher, creating a false image of God as restrictive.
3. **Deny:** *"You will NOT surely die"* — outright contradiction of God's truth.

> The same strategy is used today: question the Bible, twist Scripture, then boldly reject its authority.`,
        illustration: "🐍"
      },
      {
        type: "quiz",
        title: "Satan's Playbook",
        aiTutorExplanation: "When Eve added 'nor shall you touch it,' she had already distorted God's word. This is how legalism and false religion works — adding rules to God's word that make God seem harsher than He is.",
        question: "What was Satan's first tactic when tempting Eve in the Garden?",
        options: [
          "Offering her a beautiful fruit to eat immediately.",
          "Introducing doubt by asking 'Did God really say...?'",
          "Telling her that God did not exist.",
          "Encouraging her to worship the serpent."
        ],
        correctAnswer: 1,
        explanation: "Correct! Satan's first move was doubt: 'Did God really say?' — the same question he uses today against God's word."
      },
      {
        type: "info",
        title: "The Three Temptations",
        keyTakeaway: "The Fall was triggered by three desires: good for food, pleasing to the eye, and desirable for wisdom.",
        aiTutorExplanation: "1 John 2:16 describes three temptations: lust of the flesh, lust of the eyes, and pride of life. These match exactly the three ways Eve saw the fruit. Jesus was tempted in the same three ways in Matthew 4 — and overcame every one.",
        scripture: "Genesis 3:6",
        scriptureText: {
          ESV: "So when the woman saw that the tree was good for food, and that it was a delight to the eyes, and that the tree was to be desired to make one wise, she took of its fruit and ate...",
          NIV: "When the woman saw that the fruit of the tree was good for food and pleasing to the eye, and also desirable for gaining wisdom, she took some and ate it...",
          KJV: "And when the woman saw that the tree was good for food, and that it was pleasant to the eyes, and a tree to be desired to make one wise, she took of the fruit thereof, and did eat..."
        },
        content: `Eve evaluated the fruit through three lenses:

1. *"Good for food"* → **Lust of the Flesh** (physical appetite)
2. *"Pleasing to the eye"* → **Lust of the Eyes** (visual desire)
3. *"Desirable to make one wise"* → **Pride of Life** (desire for status and autonomy)

These three match **1 John 2:16** precisely. Jesus, the Last Adam, faced the same three temptations in the wilderness (Matthew 4) — and refused them all. What Adam failed, Jesus overcame.`,
        illustration: "🍎"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Jesus was also tempted in the same three ways Adam and Eve were. He overcame each temptation with God's word. This is why He is called the 'Last Adam' — He undoes what the first Adam failed to do.",
        question: "Jesus was tempted in the same three ways as Eve (lust of the flesh, lust of the eyes, pride of life) and overcame them all.",
        correctAnswer: "yes",
        explanation: "True! In Matthew 4, Jesus faced all three temptations and answered each one with Scripture. He succeeded where the first Adam failed."
      },
      {
        type: "info",
        title: "The First Gospel (Protoevangelium)",
        keyTakeaway: "God's very first promise was a future Savior — given in the same chapter as the Fall.",
        aiTutorExplanation: "Genesis 3:15 is the first prophecy of Jesus — given to Adam and Eve in the Garden right after the Fall. The seed of the woman (not man) would crush the serpent's head, while the serpent would bruise his heel. This is the Gospel hidden in Genesis.",
        scripture: "Genesis 3:15",
        scriptureText: {
          ESV: "I will put enmity between you and the woman, and between your offspring and her offspring; he shall bruise your head, and you shall bruise his heel.",
          NIV: "And I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel.",
          KJV: "And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel."
        },
        content: `God's response to the Fall was not just judgment — it was **immediate grace**. In Genesis 3:15, God made the first Gospel promise:

* **"The seed of the woman"** — a virgin birth (seed comes from the man, not the woman — this is a hint at the Incarnation).
* **"Shall bruise your head"** — a fatal, decisive victory over Satan.
* **"You shall bruise his heel"** — the cross, a painful but temporary wound.

> This promise—made in the very chapter of the Fall—shows that God had a redemption plan before creation even began.`,
        illustration: "🐑"
      },
      {
        type: "quiz",
        title: "First Gospel Promise",
        aiTutorExplanation: "The phrase 'seed of the woman' is unusual — in Hebrew culture, seed comes from the man. This is a prophetic hint at the virgin birth of Jesus, where there was no male biological father.",
        question: "What is the significance of the phrase 'seed of the woman' in Genesis 3:15?",
        options: [
          "It refers to Eve's biological daughter who would fight the serpent.",
          "It is a prophetic hint at the virgin birth — seed normally comes from the man, so this signals a miraculous birth.",
          "It is a general metaphor for all humanity fighting evil.",
          "It has no significant theological meaning."
        ],
        correctAnswer: 1,
        explanation: "Correct! 'Seed of the woman' is unusual biology — it prophetically hints at the virgin birth of Jesus, who had no human father."
      },
      {
        type: "info",
        title: "God's Clothing — The First Sacrifice",
        keyTakeaway: "God clothed Adam and Eve with animal skins, requiring the first blood sacrifice to cover sin.",
        aiTutorExplanation: "Adam and Eve covered themselves with fig leaves — a symbol of human effort to cover sin. God replaced these with animal skins, requiring blood to be shed. This is the first sacrifice and a picture of how God covers our sin through the blood of Christ.",
        scripture: "Genesis 3:21",
        scriptureText: {
          ESV: "And the LORD God made for Adam and for his wife garments of skins and clothed them.",
          NIV: "The LORD God made garments of skin for Adam and his wife and clothed them.",
          KJV: "Unto Adam also and to his wife did the LORD God make coats of skins, and clothed them."
        },
        content: `After the Fall, Adam and Eve covered themselves with **fig leaves** — a picture of human religion: our attempt to cover our shame through our own efforts.

But God replaced their fig leaves with **garments of animal skins**. This required the **death of an animal** — the first blood sacrifice in history.

> This is a shadow of what Jesus would do: replace our self-made attempts to cover sin with His blood, the only covering that truly works before God.`,
        illustration: "⛔"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Fig leaves represent human religion — our DIY attempts to make ourselves acceptable to God. God always replaces human coverings with blood. This is the consistent message from Genesis to Revelation.",
        question: "God accepted Adam and Eve's fig-leaf covering as sufficient for their sin.",
        correctAnswer: "no",
        explanation: "False! God replaced their fig leaves with animal skins, requiring blood. This teaches that only God's provision — not human effort — can truly cover sin."
      },
      {
        type: "info",
        title: "Cain and Abel: Envy's Destruction",
        keyTakeaway: "The difference between jealousy and envy: envy kills because it hates another's blessing.",
        aiTutorExplanation: "Cain represents agriculture; Abel represents animal sacrifice. Abel offered by faith, pleasing God. Cain's envy — not jealousy — led him to murder. Jealousy protects what we have; envy destroys what others have.",
        scripture: "Genesis 4:4-5",
        scriptureText: {
          ESV: "And the LORD had regard for Abel and his offering, but for Cain and his offering he had no regard. So Cain was very angry...",
          NIV: "The LORD looked with favor on Abel and his offering, but on Cain and his offering he did not look with favor. So Cain was very angry...",
          KJV: "...the LORD had respect unto Abel and to his offering: But unto Cain and to his offering he had not respect. And Cain was very wroth..."
        },
        content: `The first murder in history was driven by **envy**. Understanding the difference is crucial:

* **Jealousy:** Protecting what is *ours*. ("I want to keep what I have.")
* **Envy:** Hating that someone else has what we *want*. ("If I can't have it, you shouldn't either.")

Cain did not merely want God's favor for himself — he wanted to **destroy** the relationship Abel had with God. Envy leads to destruction of the very thing it covets.`,
        illustration: "🏹"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Jealousy is the desire to protect what is yours. Envy desires to destroy what belongs to another. Cain was envious — he didn't just want God's approval; he wanted to destroy Abel's.",
        question: "Envy and jealousy are essentially the same emotion — both want what someone else has.",
        correctAnswer: "no",
        explanation: "False! Jealousy protects what is ours. Envy hates that another person has something we want — and seeks to destroy it. Cain's envy led to murder."
      },
      {
        type: "info",
        title: "Enoch, Methuselah, and Mercy",
        keyTakeaway: "Methuselah's name means 'When he dies, it will come' — God's mercy kept him alive longest.",
        aiTutorExplanation: "Methuselah lived 969 years — the longest in history. The flood came the year he died. By letting him live so long, God extended the window of repentance for humanity as long as possible.",
        scripture: "Genesis 5:27",
        scriptureText: {
          ESV: "Thus all the days of Methuselah were 969 years, and he died.",
          NIV: "Altogether, Methuselah lived a total of 969 years, and then he died.",
          KJV: "And all the days of Methuselah were nine hundred sixty and nine years: and he died."
        },
        content: `In the genealogy of Adam, we meet two remarkable men:

* **Enoch:** He *"walked with God"* — a phrase used only for him and Noah. He was raptured (taken by God) without seeing death. He named his son **Methuselah**, which prophetically means *"When he dies, it will come."*
* **Methuselah:** The oldest man on record (969 years). The Great Flood came the exact year he died. God prolonged his life, extending humanity's window of repentance to the absolute maximum.

> God's patience is extraordinary — He keeps the door open as long as possible.`,
        illustration: "⏳"
      },
      {
        type: "quiz",
        title: "Methuselah's Name",
        aiTutorExplanation: "Enoch prophesied the flood in his son's name. The name Methuselah represents the threshold of judgment.",
        question: "What is the prophetic meaning behind the name of Methuselah?",
        options: [
          "The builder of the great tower.",
          "When he dies, it will come — signaling the timing of the Great Flood.",
          "The father of the giants.",
          "Walk closely with God."
        ],
        correctAnswer: 1,
        explanation: "Correct! Methuselah means 'When he dies, it will come.' God's patience is shown in making Methuselah live the longest, postponing judgment to allow repentance."
      },
      {
        type: "info",
        title: "Noah's Ark: Kinds vs. Species",
        keyTakeaway: "The Ark carried original genetic 'kinds,' not millions of modern species — making it entirely feasible.",
        aiTutorExplanation: "Noah did not carry every modern breed of dog, cat, or animal. He carried the ancestral 'kinds' containing the original DNA, which later reproduced and diversified after the flood.",
        scripture: "Genesis 6:9",
        scriptureText: {
          ESV: "Noah was a righteous man, blameless in his generation. Noah walked with God.",
          NIV: "Noah was a righteous man, blameless among the people of his time, and he walked with God.",
          KJV: "Noah was a just man and perfect in his generations, and Noah walked with God."
        },
        content: `How was the global flood possible in 40 days? Two sources:
1. **Canopy Break:** The moisture canopy around the earth collapsed (*"windows of heaven were opened"*).
2. **Deep Waters:** Undersea reservoirs erupted (*"fountains of the great deep broke up"*).

The Ark carried **kinds** — the original genetic ancestors of each group. Noah did not need a German Shepherd AND a Golden Retriever — just one "dog kind," which later diversified. The animals could also **hibernate**, drastically reducing food and waste needs.`,
        illustration: "🚢"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "Noah only needed to carry original genetic kinds, allowing rapid post-flood diversification. This is consistent with both the biblical text and modern genetics — the variety of breeds within a species comes from the original gene pool.",
        question: "Noah had to carry millions of modern species — every breed of every animal — on the Ark.",
        correctAnswer: "no",
        explanation: "False! Noah carried original genetic 'kinds.' The diverse breeds and species we see today diversified rapidly from those ancestral gene pools after the Flood."
      },
      {
        type: "info",
        title: "The One Door and Babel's Rebellion",
        keyTakeaway: "The Ark's one door points to Christ; Babel's rebellion shows human pride resisting God's plan.",
        aiTutorExplanation: "Babel was Nimrod's attempt to build a tower to avoid scattering and bypass God's rule. God dispersed them by changing their tongues, enforcing His plan to fill the earth.",
        scripture: "Genesis 11:4",
        scriptureText: {
          ESV: "Then they said, 'Come, let us build ourselves a city and a tower with its top in the heavens, and let us make a name for ourselves...'",
          NIV: "Then they said, 'Come, let us build ourselves a city, with a tower that reaches to the heavens, so that we may make a name for ourselves...'",
          KJV: "And they said, Go to, let us build us a city and a tower, whose top may reach unto heaven; and let us make us a name..."
        },
        content: `The Ark had **3 floors but only one door** — a picture of Jesus: *"I am the Way, the Truth, and the Life. No one comes to the Father except through Me."* (John 14:6)

After the flood, Nimrod led the people to build the **Tower of Babel**:
* God commanded humanity to scatter and fill the earth.
* Nimrod defied this, building a tower to "make a name for themselves."
* God scattered them by **confusing their languages**, creating the 70 original nations (Genesis 10).

> Pride says, "Let us make a name for ourselves." Faith says, "Let His name be exalted."`,
        illustration: "🗼"
      },
      {
        type: "card-quiz",
        title: "True or False?",
        aiTutorExplanation: "The Tower of Babel was not just an architectural project — it was a defiance of God's command to scatter and fill the earth. Nimrod wanted to centralize human power and autonomy, bypassing God.",
        question: "The Tower of Babel was primarily built to worship God more effectively — to get closer to heaven.",
        correctAnswer: "no",
        explanation: "False! The Tower of Babel was built to defy God's command to scatter, and to 'make a name for themselves' — a monument to human pride and centralized rebellion against God."
      },
      {
        type: "summary",
        title: "The Fall & Sin Mastered! 🏆",
        aiTutorExplanation: "Excellent work! You have completed Genesis 3–11. Next, we follow Abraham — the Father of Faith.",
        content: `Outstanding! You have completed Genesis Chapters 3–11.

You now understand:
* **Satan's three-step strategy**: Doubt → Distort → Deny
* **The three temptations** (lust of flesh, lust of eyes, pride of life)
* **The Protoevangelium** — the first Gospel promise in Genesis 3:15
* **God's first blood sacrifice** — covering with animal skins
* **Envy vs. Jealousy** in Cain and Abel
* **Methuselah's name** as a prophecy of the Flood
* **The Ark** — kinds vs. species, and the one door
* **Babel** — the origin of nations and human pride

Let's now follow Abraham, the father of faith!`,
        illustration: "👑"
      }
    ]
  },

    title: "Genesis Chapter 1: The Orderly Creation",
    category: "Creation",
    duration: "8 mins",
    xpReward: 120,
    description: "Explore how God systematically created the universe in two sets of three days, and understand His core principle of geometric growth.",
    slides: [
      {
        type: "info",
        title: "Order, Not Chaos",
        keyTakeaway: "God created in two orderly sets of 3 days: preparing the stage, then placing the cast.",
        aiTutorExplanation: "God is a God of order. In the first set of 3 days, He established divisions (places/environment). In the second set of 3 days, He populated those environments (cast/actors).",
        scripture: "Genesis 1:3-5",
        scriptureText: {
          ESV: "And God said, 'Let there be light,' and there was light... And God separated the light from the darkness...",
          NIV: "And God said, 'Let there be light,' and there was light... God separated the light from the darkness.",
          KJV: "And God said, Let there be light: and there was light... and God divided the light from the darkness."
        },
        content: `God did not create the universe in a haphazard way, but in an **orderly and organized fashion**. 

He created it in **two sets of 3 days**:
* **Days 1 to 3:** God creates the **places** (preparing the stage for the redemption drama).
* **Days 4 to 6:** God puts the **cast** (sun, moon, animals, and humanity) into their places.`,
        illustration: "🏛️"
      },
      {
        type: "info",
        title: "Days 1 to 3: The Stage (Divisions)",
        keyTakeaway: "The first three days establish divisions: light/dark, waters above/below, land/sea.",
        aiTutorExplanation: "Day 1 divided light from darkness (the light came from God, not the sun). Day 2 divided the waters with a moisture canopy (firmament). Day 3 divided land from water, preparing the dry land as the main stage.",
        scripture: "Genesis 1:6-8",
        scriptureText: {
          ESV: "And God said, 'Let there be an expanse in the midst of the waters, and let it separate the waters from the waters.'",
          NIV: "And God said, 'Let there be a vault between the waters to separate water from water.'",
          KJV: "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters."
        },
        content: `The first three days are defined by **contrast or division**:
* **Day 1:** God divides the Light from Darkness. (Note: This light came from God Himself, as the sun was not created until Day 4).
* **Day 2:** God creates an expanse (firmament) to divide the waters below from the waters above (a moisture canopy).
* **Day 3:** God gathers the seas to let dry land appear and produces vegetation.`,
        illustration: "🎭"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "The first three days are all about 'division'—prepping the stage so the actors have environments to occupy. Days 4-6 are when the actors step onto those stages.",
        question: "What occurred during the first set of 3 days in Genesis Chapter 1?",
        options: [
          "God populated the earth with animals, birds, and fish.",
          "God created the places and prepared the stage through division (light, water canopy, and dry land).",
          "God rested from all His work and blessed the Seventh Day.",
          "God established the covenants with Abraham and Noah."
        ],
        correctAnswer: 1,
        explanation: "Correct! The first three days prepared the environment or stage through structured division."
      },
      {
        type: "info",
        title: "Days 4 to 6: The Cast (Actors)",
        keyTakeaway: "Days 4 to 6 place the actors: spotlights (luminaries), background actors (birds/fish), and the main cast (humanity).",
        aiTutorExplanation: "Day 4 introduces the sun and moon (spotlights). Day 5 places birds and fish (background elements). Day 6 introduces land animals and man/woman (the main actors in God's image).",
        scripture: "Genesis 1:26",
        scriptureText: {
          ESV: "Then God said, 'Let us make man in our image, after our likeness...'",
          NIV: "Then God said, 'Let us make mankind in our image, in our likeness...'",
          KJV: "And God said, Let us make man in our image, after our likeness..."
        },
        content: `Once the stage was set, the actors stepped out:
* **Day 4:** God places the Sun, Moon, and Stars (like spotlights in the theater).
* **Day 5:** The background actors—birds of the air and sea creatures.
* **Day 6:** The supporting cast (land animals) followed by the main acting cast: **man and woman**, created in God's image.`,
        illustration: "👥"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "Remember: The Sun, Moon, and Stars were placed on Day 4. The light on Day 1 was created directly by God, symbolizing spiritual light.",
        question: "The Sun was created on the first day of creation to produce light.",
        correctAnswer: "no", // Card Yes/No quiz
        explanation: "Correct! Light was created on Day 1 (sourced from God Himself), whereas the Sun, Moon, and Stars were placed on Day 4."
      },
      {
        type: "info",
        title: "The Principle of Multiplication",
        keyTakeaway: "God's method of growth is geometric multiplication, reproducing 'after its kind.'",
        aiTutorExplanation: "In Genesis 1, 'multiply' appears 3 times and 'after its kind' appears 10 times. God values reproduction. In spiritual growth, this represents discipleship: reproducing your faith in others rather than relying on linear addition.",
        scripture: "Genesis 1:28",
        scriptureText: {
          ESV: "And God blessed them. And God said to them, 'Be fruitful and multiply and fill the earth...'",
          NIV: "God blessed them and said to them, 'Be fruitful and increase in number; fill the earth...'",
          KJV: "And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth..."
        },
        content: `In Genesis 1, the word **\"MULTIPLY\"** appears 3 times, and the phrase **\"AFTER ITS KIND\"** appears 10 times. 

God's method of growth is geometric progression through **multiplication**, not addition. In church and discipleship, this means every believer is called to make disciples who can reproduce others \"after their own kind\" (Matthew 28:19-20), rather than relying solely on one pastor to add people.`,
        illustration: "📈"
      },
      {
        type: "quiz",
        title: "Growth Check",
        aiTutorExplanation: "Multiplication is exponential (geometric). A pastor adding members is linear (addition). Discipleship focuses on training leaders to make more leaders, resulting in multiplication.",
        question: "How does the 'multiplication after its kind' principle translate to Christian discipleship?",
        options: [
          "By inviting everyone to a single large event each year.",
          "By encouraging each believer to make and train disciples who can teach others in turn.",
          "By relying entirely on the pastor to add ten members a year.",
          "By focusing on academic theology degrees."
        ],
        correctAnswer: 1,
        explanation: "Spot on! Discipleship works like biological multiplication: cell leaders and teachers training others to teach, creating geometric growth."
      },
      {
        type: "summary",
        title: "Orderly Creation Mastered",
        aiTutorExplanation: "You've completed Genesis 1. Next, you will discover the breath of life and relationship covenants in Genesis 2.",
        content: `Great job! You have completed Genesis Chapter 1. 

You now understand the symmetric, orderly design of creation (Stage vs. Cast) and the foundational principle of multiplication. Next, let's explore the deep truths of Genesis Chapter 2.`,
        illustration: "🌟"
      }
    ]
  },
  {
    id: "genesis-two-breath",
    title: "Genesis Chapter 2: The Breath of Life",
    category: "Creation",
    duration: "8 mins",
    xpReward: 150,
    description: "Discover the personal name of YHWH, the meaning of 'Nephesh' (living soul), the purpose of the two sacramental trees, and the structure of marriage.",
    slides: [
      {
        type: "info",
        title: "The 7th Day and YHWH",
        keyTakeaway: "God rested as a role model and introduced His personal name: YHWH, the Eternal and Unchangeable.",
        aiTutorExplanation: "God rested not from fatigue, but to model spiritual rest (holy day/holiday). In Gen 2, He changes from the generic 'Elohim' to His personal covenant name, YHWH, meaning 'Always' or 'I Am.'",
        scripture: "Genesis 2:3",
        scriptureText: {
          ESV: "So God blessed the seventh day and made it holy, because on it God rested from all his work...",
          NIV: "Then God blessed the seventh day and made it holy, because on it he rested from all the work...",
          KJV: "And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work..."
        },
        content: `In Genesis 2, we see two major developments:
* **The Sabbath:** God rested, not because He was exhausted, but as a role model. Rest is an owner's manual guideline for spiritual replenishment (a **Holy Day** / Holiday).
* **The Name YHWH:** In Chapter 1, God is referred to as "Elohim" (generic name for God). In Chapter 2, He introduces His personal name, **YHWH (Yahweh)**, which means "ALWAYS" or eternal and unchangeable.`,
        illustration: "🕰️"
      },
      {
        type: "info",
        title: "The Breath of Life (Nephesh)",
        keyTakeaway: "Man is formed of dust and God's breath, becoming a unified living being (Nephesh).",
        aiTutorExplanation: "Hebrew anthropology is unified: a human is a 'Nephesh' (living creature), not a ghost in a cheap envelope. The dust represents our physical limits, but God's breath represents our sacred value.",
        scripture: "Genesis 2:7",
        scriptureText: {
          ESV: "then the LORD God formed the man of dust from the ground and breathed into his nostrils the breath of life, and the man became a living creature.",
          NIV: "Then the LORD God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being.",
          KJV: "And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul."
        },
        content: `God made man from the **dust of the ground** and breathed into his nostrils the **breath of life**. Man became a *living soul* or **Nephesh** (which means "living being").

A human is not just a spirit trapped in a cheap envelope. We are a unified body and life force. Because the breath of God is uniquely inside us, human life is sacred and set apart from animals. When we are born again, God breathes His Holy Spirit (*Pneuma*) into us once more.`,
        illustration: "💨"
      },
      {
        type: "quiz",
        title: "Vocabulary Check",
        aiTutorExplanation: "Dualistic views of humans being a soul trapped in a physical prison are Greek/Platonic, not Hebrew. 'Nephesh' represents the whole person, physical and spiritual combined, made alive by God.",
        question: "What does the Hebrew word 'Nephesh' in Genesis 2:7 mean?",
        options: [
          "An invisible ghost trapped inside a physical shell.",
          "A living being / living soul, expressing a unified physical and spiritual existence.",
          "The literal chemical dust elements in the ground.",
          "The academic study of theology."
        ],
        correctAnswer: 1,
        explanation: "Correct! 'Nephesh' represents a complete living being, showing that the physical body made alive by God's breath is a unified, sacred creation."
      },
      {
        type: "info",
        title: "The Two Sacramental Trees",
        keyTakeaway: "The Trees show that the Creator makes rules, and He alone knows what is good for us.",
        aiTutorExplanation: "Eden means 'Delight.' The Tree of Knowledge of Good and Evil taught a lesson: God has the landlord rights. In Hebrew, 'knowledge' means experience. Eating the fruit meant choosing to experience and define evil independently of God.",
        scripture: "Genesis 2:9",
        scriptureText: {
          ESV: "The tree of life was in the midst of the garden, and the tree of the knowledge of good and evil.",
          NIV: "In the middle of the garden were the tree of life and the tree of the knowledge of good and evil.",
          KJV: "the tree of life also in the midst of the garden, and the tree of knowledge of good and evil."
        },
        content: `In the Garden of Eden (which means "Delight"), God placed two special trees: the **Tree of Life** and the **Tree of the Knowledge of Good and Evil**.
        
Like communion bread and wine, these are *sacramental* physical items that teach spiritual truths:
1. **Rule Maker:** As Creator, God has the right to make rules.
2. **Experiential Knowledge:** In Hebrew, "knowledge" means *experiencing* it. Eating the fruit meant choosing to experience and define good and evil independently of God.`,
        illustration: "🌳"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "Why did God set rules? Because He created us and knows our boundaries. Choosing what is good/evil ourselves leads to suffering and death.",
        question: "What spiritual truth does the Tree of the Knowledge of Good and Evil teach us?",
        options: [
          "That human beings should eat a raw, fruit-only diet.",
          "That God, as Creator, has the sovereign right to make rules and define what is good and evil.",
          "That the Garden of Eden was a purely symbolic myth.",
          "That we must achieve academic expertise to know God."
        ],
        correctAnswer: 1,
        explanation: "Exactly! The tree taught that God is the Creator and landlord. He alone knows what is good for us, and He has the right to set the boundaries."
      },
      {
        type: "info",
        title: "Partnership, Marriage & Family",
        keyTakeaway: "Woman was made from Adam's rib bone, signifying she is his equal partner close to the heart.",
        aiTutorExplanation: "Not from a toe bone to be trampled on, nor a head bone to rule over. The rib close to the heart signifies equality. Marriage establishes a new nuclear family nucleus ('leave and cleave').",
        scripture: "Genesis 2:24",
        scriptureText: {
          ESV: "Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh.",
          NIV: "That is why a man leaves his father and mother and is united to his wife, and they become one flesh.",
          KJV: "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh."
        },
        content: `God created woman not from the dust, but from **Adam's rib bone**. 

A rib is close to the heart—not a toe bone to be trampled on, nor a head bone to rule over. This signifies that woman is a partner **equal to man**. 

In marriage, they are to **leave** their parents and **cleave** to each other, establishing a separate, loving **nuclear family nucleus** as one flesh.`,
        illustration: "💍"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "A rib bone represents equal status in partnership. Leaving and cleaving forms a separate family unit.",
        question: "The creation of woman from Adam's rib bone signifies that she was designed to be his equal partner.",
        correctAnswer: "yes",
        explanation: "Correct! The rib bone close to the heart signifies partnership, equality, and mutual love."
      },
      {
        type: "summary",
        title: "Genesis Mastery!",
        aiTutorExplanation: "Great job! You have mastered Genesis Chapter 2. In the next module, you will analyze the entry of sin in Genesis Chapter 3.",
        content: `Incredible! You have completed Genesis Chapter 2. 

You have learned about Yahweh, the breath of life (*Nephesh*), the sacramental trees, and God's design for relationships and family. Keep up the obedience!`,
        illustration: "👑"
      }
    ]
  },
  {
    id: "genesis-three-fall",
    title: "Genesis Chapter 3: The Fall of Man",
    category: "The Fall",
    duration: "9 mins",
    xpReward: 150,
    description: "Analyze the source of brokenness in our world. Discover Satan's strategies, the error of adding to God's words, and the first sign of the Gospel.",
    slides: [
      {
        type: "info",
        title: "A Messed-Up World",
        keyTakeaway: "Our world is broken not because of external structures, but because of human rebellion.",
        aiTutorExplanation: "People blame environment, tech, or politics. The Bible states that sin (our rebellion against God) is the root cause of brokenness.",
        scripture: "Romans 5:12",
        scriptureText: {
          ESV: "Therefore, just as sin entered the world through one man, and death through sin, and so death spread to all men because all sinned...",
          NIV: "Therefore, just as sin entered the world through one man, and death through sin, and in this way death came to all people, because all sinned...",
          KJV: "Wherefore, as by one man sin entered into the world, and death by sin; and so death passed upon all men, for that all have sinned..."
        },
        content: `While we see beauty around us, our world is obviously messed up by pollution, violence, and decay. 

People blame the government, the internet, or others, but the Bible teaches that the **real problem is ourselves**. Genesis 3 shows how mankind rebelled and broke the original harmony of creation.`,
        illustration: "🍂"
      },
      {
        type: "info",
        title: "Satan: The Hidden Deceiver",
        keyTakeaway: "Satan works through subtle, familiar agents to avoid being noticed.",
        aiTutorExplanation: "Satan masquerades as an angel of light. He used a serpent (which in Eden was a friendly animal) to converse with Eve, hiding his true intentions. He uses culture, media, and friends to pollute minds.",
        scripture: "2 Corinthians 11:14",
        scriptureText: {
          ESV: "And no wonder, for even Satan disguises himself as an angel of light.",
          NIV: "And no wonder, for Satan himself masquerades as an angel of light.",
          KJV: "And no marvel; for Satan himself is transformed into an angel of light."
        },
        content: `Satan appears as a **serpent** (which was a friendly reptile in Eden, not a scary slithering snake). 
        
Satan's first tactic is to **work through agents** (like television, books, or friends) and hide his presence. He doesn't want you to believe he exists, or he wants you to view him as a cartoon figure. He seeks to pollute our minds using the favorite things surrounding us.`,
        illustration: "🐍"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "Satan's tactic is to avoid being noticed. He acts through agents we trust so that we listen to the advice without checking if it aligns with God's word.",
        question: "According to study guides, how does Satan primarily work in the world today?",
        options: [
          "By appearing in terrifying physical forms to frighten believers.",
          "By working behind the scenes through subtle agents like friends, media, and favorite things.",
          "By forcing people to study academic textbooks.",
          "By causing sudden natural disasters without warning."
        ],
        correctAnswer: 1,
        explanation: "Correct! Satan acts as a hidden deceiver, working through familiar, seemingly friendly agents to corrupt minds without drawing attention to himself."
      },
      {
        type: "info",
        title: "Do Not Add to God's Words",
        keyTakeaway: "Exaggerating God's commands makes the truth look ridiculous and invites mockery.",
        aiTutorExplanation: "Eve added 'nor touch it' to God's command. When we defend the truth, we often add human rules (like complete bans on things God hasn't banned) to make our position look stronger. We must defend the truth only with what God actually said.",
        scripture: "Deuteronomy 4:2",
        scriptureText: {
          ESV: "You shall not add to the word that I command you, nor take from it, that you may keep the commandments of the LORD...",
          NIV: "Do not add to what I command you and do not subtract from it, but keep the commands of the LORD...",
          KJV: "Ye shall not add unto the word which I command you, neither shall ye diminish ought from it, that ye may keep the commandments of the LORD..."
        },
        content: `When Satan asks if they can eat from every tree, Eve responds by saying they cannot eat from the Tree of Knowledge, **\"nor touch it\"**. 
        
But God never said not to touch it! Eve exaggerated. When we defend the truth, we often **add rules to God's words** to make our position look stronger (e.g. churches declaring 'do not touch alcohol' although Jesus turned water into wine). Exaggerating God's laws makes Christianity look ridiculous and invites mockery. Defend the truth only with what God actually said.`,
        illustration: "⛔"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "God only said 'you shall not eat.' Eve added 'neither shall you touch it.' Adding to scripture is a dangerous tactic.",
        question: "God explicitly commanded Adam and Eve in the Garden that they must not even touch the forbidden tree.",
        correctAnswer: "no",
        explanation: "Correct! God only commanded them not to eat of it. Eve added 'nor touch it', showing our human tendency to add rules to make our positions stronger."
      },
      {
        type: "info",
        title: "The Three Temptations & Rule Making",
        keyTakeaway: "The Fall was driven by the desire to make our own rules, through the lust of the flesh, lust of the eyes, and pride of life.",
        aiTutorExplanation: "Humans want to be independent rule-makers, but we are only tenants. The three areas of temptation are: good for food (flesh), pleasant to the eyes (eyes), and desirable to make one wise (pride/ego).",
        scripture: "1 John 2:16",
        scriptureText: {
          ESV: "For all that is in the world—the desires of the flesh and the desires of the eyes and pride of life—is not from the Father...",
          NIV: "For everything in the world—the lust of the flesh, the lust of the eyes, and the pride of life—comes not from the Father...",
          KJV: "For all that is in the world, the lust of the flesh, and the lust of the eyes, and the pride of life, is not of the Father..."
        },
        content: `Satan enticed Eve to **make her own rules** so she could \"be like God.\" Because humans are tenants and God is the landlord, only God has the right to set boundaries.
        
Eve fell because she looked at the fruit and saw:
1. It was **good for food** (Lust of the flesh).
2. It was **pleasant to the eyes** (Lust of the eyes).
3. It was **desirable to make one wise** (Pride of life / Ego).`,
        illustration: "🍎"
      },
      {
        type: "info",
        title: "The Cover-up and the Promise",
        keyTakeaway: "Religion represents human 'fig leaves' to hide from God; God's cover is a blood sacrifice (garments of skins).",
        aiTutorExplanation: "Fig leaves represent human attempts to hide guilt. God's cover required an animal to die—the first blood sacrifice. This is the Gospel in seed form, foreshadowing Christ's ultimate death on the cross to cover our sins.",
        scripture: "Genesis 3:21",
        scriptureText: {
          ESV: "And the LORD God made for Adam and for his wife garments of skins and clothed them.",
          NIV: "The LORD God made garments of skin for Adam and his wife and clothed them.",
          KJV: "Unto Adam also and to his wife did the LORD God make coats of skins, and clothed them."
        },
        content: `Once Adam and Eve sinned, the eyes of their conscience opened. Feeling guilty, they tried to cover themselves with **fig leaves** (a picture of using religion or deeds to cover sin). 
        
But God reached out to them first. To cover their nakedness, God killed an animal and made **garments of skins**. This is the **Gospel in seed form**: showing that an innocent substitute must die to cover human sin, pointing forward to the Lamb of God.`,
        illustration: "🐑"
      },
      {
        type: "quiz",
        title: "Gospel Seed Check",
        aiTutorExplanation: "Why coats of skins? Because it required the death of an innocent animal. This is the first foreshadowing of the cross in the Bible.",
        question: "What did God's provision of 'garments of skins' in Genesis 3 signify?",
        options: [
          "A lesson in stitching and leathercraft.",
          "The Gospel in seed form, showing that an innocent sacrifice is required to cover human sin.",
          "That fig leaves are a superior covering for tropical weather.",
          "A command that humans should never walk around in gardens."
        ],
        correctAnswer: 1,
        explanation: "Correct! The death of the animal to provide coats of skins was the first blood sacrifice, symbolizing that sin requires a substitute to cover guilt."
      },
      {
        type: "summary",
        title: "The Fall Understood",
        aiTutorExplanation: "You have completed Genesis 3. Next, we follow the spread of sin in Cain's generation and God's judgment via Noah's Ark.",
        content: `Excellent work! You have finished Genesis Chapter 3. 
        
You understand the mechanics of the Fall: Satan's methods, the danger of adding to scripture, the three lusts, and God's initial promise of a sacrificial cover. Let's move to Chapters 4 to 11.`,
        illustration: "🏆"
      }
    ]
  },
  {
    id: "genesis-four-eleven",
    title: "Genesis 4 to 11: The Spread of Sin & The Ark",
    category: "Spread of Sin",
    duration: "7 mins",
    xpReward: 150,
    description: "Follow the narrative of Cain and Abel, the generations of Enoch and Methuselah, the structural truths of Noah's Ark, and the rebellion at Babel.",
    slides: [
      {
        type: "info",
        title: "Envy and Sibling Rivalry",
        keyTakeaway: "Envy hates that someone else has what we want; it destroys relationships.",
        aiTutorExplanation: "Cain represents agriculture and Abel represents animal sacrifice. Abel offered in faith, which Cain envied. Sibling rivalry and envy led to the first murder.",
        scripture: "Genesis 4:4-5",
        scriptureText: {
          ESV: "...And the LORD had regard for Abel and his offering, but for Cain and his offering he had no regard. So Cain was very angry...",
          NIV: "The LORD looked with favor on Abel and his offering, but on Cain and his offering he did not look with favor. So Cain was very angry...",
          KJV: "...and the LORD had respect unto Abel and to his offering: But unto Cain and to his offering he had not respect. And Cain was very wroth..."
        },
        content: `Sin spread like a pandemic in Genesis 4-11, covering 1% of the Bible but vast spans of history. 
        
It starts with **Cain and Abel**. Abel brought a firstborn sacrifice by faith, which pleased God. Cain, out of **envy**, killed Abel (the first murder). 
* **Key difference:** *Jealousy* is protecting what is ours, whereas *Envy* is hating that someone else has what we want. Envy is a destructive sin that defiles relationships.`,
        illustration: "🏹"
      },
      {
        type: "info",
        title: "Enoch, Methuselah, and Mercy",
        keyTakeaway: "Methuselah's name means 'When he dies, it will come'. His long life shows God's mercy.",
        aiTutorExplanation: "Methuselah lived 969 years—the longest in history. The flood came the year he died. By letting him live so long, God extended the window of repentance for humanity as long as possible.",
        scripture: "Genesis 5:27",
        scriptureText: {
          ESV: "Thus all the days of Methuselah were 969 years, and he died.",
          NIV: "Altogether, Methuselah lived a total of 969 years, and then he died.",
          KJV: "And all the days of Methuselah were nine hundred sixty and nine years: and he died."
        },
        content: `In the genealogy of Adam, we meet:
* **Enoch:** He walked closely with God and was raptured. He named his son Methuselah, which prophetically means **\"When he dies, it will come\"**.
* **Methuselah:** The oldest man on record (969 years). The Great Flood came the exact year he died. God prolonged his life to give humanity the maximum time to repent—showing His deep mercy.`,
        illustration: "⏳"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "Enoch prophesied the flood in his son's name. The name Methuselah represents the threshold of judgment.",
        question: "What is the prophetic meaning behind the name of Methuselah?",
        options: [
          "The builder of the great tower.",
          "When he dies, it will come (signaling the timing of the Great Flood).",
          "The father of the giants.",
          "Walk closely with God."
        ],
        correctAnswer: 1,
        explanation: "Correct! Methuselah means 'When he dies, it will come'. God's patience is shown in making Methuselah live the longest, postponing judgment to allow repentance."
      },
      {
        type: "info",
        title: "Noah's Ark: Kinds vs. Species",
        keyTakeaway: "The Ark carried 'kinds' (original genes), not millions of modern species.",
        aiTutorExplanation: "Noah did not carry every modern breed of dog, cat, or animal. He carried the ancestral 'kinds' containing the original DNA, which later reproduced and diversified after the flood.",
        scripture: "Genesis 6:9",
        scriptureText: {
          ESV: "Noah was a righteous man, blameless in his generation. Noah walked with God.",
          NIV: "Noah was a righteous man, blameless among the people of his time, and he walked with God.",
          KJV: "Noah was a just man and perfect in his generations, and Noah walked with God."
        },
        content: `As corruption multiplied, God grieved and decided to rebuild. He chose Noah to build the Ark. 

How was the global flood possible in 40 days? 
1. **Canopy Break:** The moisture canopy over the earth collapsed (\"windows of heaven broke\").
2. **Deep Waters:** Undersea reservoirs erupted (\"fountains of the great deep broke\"). 
The Ark held **kinds** (original genes, not millions of modern species), and the animals could hibernate, requiring minimal food.`,
        illustration: "🚢"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "Noah only needed to carry original genetic kinds, allowing rapid post-flood diversification.",
        question: "Noah had to carry all millions of modern species on the Ark to save them.",
        correctAnswer: "no",
        explanation: "Correct! Noah only carried the original 'kinds' (genetic ancestors) of animals, which later reproduced and diversified into various modern species."
      },
      {
        type: "info",
        title: "The Ark's Door and Babel's Rebellion",
        keyTakeaway: "The Ark had 3 floors and 1 door, showing there is only one way to God.",
        aiTutorExplanation: "Babel was Nimrod's attempt to build a tower to avoid scattering and bypass God's rule. God dispersed them by changing their tongues, enforcing His plan to fill the earth.",
        scripture: "Genesis 11:4",
        scriptureText: {
          ESV: "Then they said, 'Come, let us build ourselves a city and a tower with its top in the heavens, and let us make a name for ourselves...'",
          NIV: "Then they said, 'Come, let us build ourselves a city, with a tower that reaches to the heavens, so that we may make a name for ourselves...'",
          KJV: "And they said, Go to, let us build us a city and a tower, whose top may reach unto heaven; and let us make us a name..."
        },
        content: `The Ark had 3 floors but **only one door**, signifying there is only one way to God (John 14:6: \"I am the Way\"). 
        
After the flood, Nimrod rebelled at Babel. Instead of scattering to populate the earth as God commanded, he built the **Tower of Babel** to make a name for himself and bypass God. God scattered them by creating different languages, forcing them to populate the earth.`,
        illustration: "🗼"
      },
      {
        type: "summary",
        title: "Spread of Sin Mastered",
        aiTutorExplanation: "Fantastic! Next, we follow the story of Abraham, the father of faith, and the covenants of promise.",
        content: `Incredible! You have completed Genesis Chapters 4 to 11. 
        
You now understand the timeline of early sin, the prophecy of Methuselah, the design of the Ark, and the dispersion at Babel. Next, let's look at Abraham, the Father of Faith.`,
        illustration: "👑"
      }
    ]
  },
  {
    id: "genesis-twelve-abraham",
    title: "Genesis 12 to 24: Abraham's Faith",
    category: "Covenants",
    duration: "8 mins",
    xpReward: 150,
    description: "Follow the call of Abraham, the covenant of circumcision, the destruction of Sodom, and the prophetic sacrifice of Isaac.",
    slides: [
      {
        type: "info",
        title: "The Call of Abraham",
        keyTakeaway: "Abraham obeyed God immediately, leaving a wealthy home for a land he did not know.",
        aiTutorExplanation: "Ur was a sophisticated, fertile Mesopotamian city. Abraham left it entirely by faith, based on God's covenant promises, demonstrating what true trust looks like.",
        scripture: "Genesis 12:1",
        scriptureText: {
          ESV: "Now the LORD said to Abram, 'Go from your country and your kindred and your father's house to the land that I will show you.'",
          NIV: "The LORD had said to Abram, 'Go from your country, your people and your father's household to the land I will show you.'",
          KJV: "Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's house, unto a land that I will show thee."
        },
        content: `From Genesis 12 onward, the Bible narrows its focus from the whole world to **one family** (Abraham, Isaac, Jacob, Joseph). 

God called Abram out of Ur, a sophisticated city, to journey to Canaan. Abram obeyed by faith, receiving the **Abrahamic Covenant**. A covenant is like marriage—a binding oath where the superior (God) protects the subordinate, with circumcision as its physical token.`,
        illustration: "⛺"
      },
      {
        type: "info",
        title: "The Imperfect Patriarchs",
        keyTakeaway: "The Patriarchs were imperfect sinners, chosen by God's grace and known for their faith.",
        aiTutorExplanation: "Abraham lied twice, Isaac did the same, Jacob was a deceiver. God does not choose perfect people; He chooses to display His grace through imperfect people who trust Him.",
        scripture: "Hebrews 11:8",
        scriptureText: {
          ESV: "By faith Abraham obeyed when he was called to go out to a place that he was to receive as an inheritance. And he went out, not knowing where he was going.",
          NIV: "By faith Abraham, when called to go to a place he would later receive as his inheritance, obeyed and went, even though he did not know where he was going.",
          KJV: "By faith Abraham, when he was called to go out into a place which he should after receive for an inheritance, obeyed; and he went out, not knowing whither he went."
        },
        content: `Abraham, Isaac, and Jacob are the three Patriarchs of the faith. The Bible does not hide their flaws—and that is exactly the point.

**Their failures were real:**

> 🔴 **Abraham** lied about his wife Sarah twice, saying she was his sister—to protect himself.
> 🔴 **Isaac** committed the exact same lie as his father.
> 🔴 **Jacob** deceived his elderly, blind father to steal his brother's birthright.

**And yet — God chose them.**

They were not chosen because of moral perfection. They were chosen because of **faith**. Despite never owning the Promised Land in their lifetimes, they believed God's covenant promises. Despite every failure, they kept looking forward to the future Messiah. This is the grace of God on full display.`,
        illustration: "👨‍👦‍👦"
      },
      {
        type: "quiz",
        title: "Patriarch Check",
        aiTutorExplanation: "The doctrine of election means God has the sovereign right to choose. He selected these men not because of moral perfection, but because of their faith and obedience to His call.",
        question: "Why did God choose Abraham, Isaac, and Jacob as Patriarchs despite their moral failures?",
        options: [
          "Because they possessed flawless moral records.",
          "Because of their amazing faith and reliance on God's promises, demonstrating God's sovereign choice.",
          "Because they were wealthy and powerful rulers.",
          "Because they wrote the first chapters of Genesis."
        ],
        correctAnswer: 1,
        explanation: "Correct! The patriarchs were imperfect sinners, but they had absolute faith in God's promises. Their story highlights God's sovereign choice (election) and grace."
      },
      {
        type: "info",
        title: "Intercession and Trial",
        keyTakeaway: "Walking with God does not exempt us from trials. We must intercede with persistence.",
        aiTutorExplanation: "Abraham faced a famine immediately after entering Canaan, showing that obedience doesn't mean life is trial-free. In Sodom, he bargained with God but stopped asking at 10, showing how we often stop praying too soon.",
        scripture: "Genesis 18:32",
        scriptureText: {
          ESV: "Then he said, 'Oh let not the Lord be angry, and I will speak again but this once. Suppose ten are found there?' He answered, 'For the sake of ten I will not destroy it.'",
          NIV: "Then he said, 'Oh, let not the Lord be angry, but let me speak just once more. What if only ten can be found there?' He answered, 'For the sake of ten, I will not destroy it.'",
          KJV: "And he said, Oh let not the Lord be angry, and I will speak yet but this once: Peradventure ten shall be found there. And he said, I will not destroy it for ten's sake."
        },
        content: `When God planned to destroy the wicked city of Sodom, Abraham interceded. 

Abraham bargained God down to 10 righteous people, showing God's immense patience. However, Abraham stopped asking at 10, showing how humans often stop praying too soon. 
* **Key Lesson:** Walking with God does not mean we avoid trials. Abraham faced a severe famine right after entering the Promised Land, showing we can have trials even in God's will.`,
        illustration: "⚖️"
      },
      {
        type: "info",
        title: "The Sacrifice of Isaac on Moriah",
        keyTakeaway: "The sacrifice of Isaac is a clear prophetic 'type' of the crucifixion of Jesus.",
        aiTutorExplanation: "Moriah is the site of Calvary. Abraham offered his only son, who did not protest (Isaac was about 37). The ram caught in thorns was the substitute, foreshadowing Christ's crown of thorns and sacrificial death.",
        scripture: "Genesis 22:2",
        scriptureText: {
          ESV: "He said, 'Take your son, your only son Isaac, whom you love, and go to the land of Moriah, and offer him there as a burnt offering...'",
          NIV: "Then God said, 'Take your son, your only son, whom you love—Isaac—and go to the region of Moriah. Sacrifice him there as a burnt offering...'",
          KJV: "And he said, Take now thy son, thine only son Isaac, whom thou lovest, and get thee into the land of Moriah; and offer him there for a burnt offering..."
        },
        content: `The ultimate test of Abraham's faith occurred on **Mount Moriah** (which is the same location as **Calvary**, where Jesus was crucified). 
        
God commanded him to sacrifice Isaac. Abraham obeyed immediately, knowing God could resurrect Isaac (Hebrews 11:19). Isaac, who was likely 37 years old, did not protest. At the last second, God intervened and provided a **ram caught in the thorns** as a substitute.`,
        illustration: "⛰️"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "An innocent substitute caught in thorns represents Christ's substitutionary death on Calvary (Moriah). Both sons (Isaac and Jesus) obeyed their fathers without protest.",
        question: "How does the sacrifice of Isaac serve as a 'type' or picture of the Gospel?",
        options: [
          "It shows that God requires human sacrifice.",
          "It mirrors God offering His only beloved Son, with a thorn-crowned ram serving as the substitute.",
          "It explains why Abraham had to move to Egypt.",
          "It marks the introduction of circumcision."
        ],
        correctAnswer: 1,
        explanation: "Correct! The sacrifice of Isaac on Moriah (Calvary) is a prophetic picture: a father offering his beloved son, who does not protest, and God providing a substitute caught in thorns."
      },
      {
        type: "summary",
        title: "Abraham Mastered!",
        aiTutorExplanation: "Congratulations! You have completed the life of Abraham, the final module in the Genesis roadmap.",
        content: `Congratulations! You have completed the life of Abraham. 
        
You have traced the covenant, the trials of faith, the bargaining for Sodom, and the beautiful typological picture of the Gospel on Mount Moriah. You are developing a deep, connected understanding of the scriptures!`,
        illustration: "👑"
      }
    ]
  },
  {
    id: "genesis-twentyfive-fifty-patriarchs",
    title: "Genesis 25 to 50: The Patriarchs & Joseph",
    category: "Covenants",
    duration: "8 mins",
    xpReward: 150,
    description: "Explore the lives of Isaac, Jacob, and Joseph. Study the danger of favouritism, the wrestling of faith, and how Genesis ends in anticipation.",
    slides: [
      {
        type: "info",
        title: "Isaac: The Child of Promise",
        keyTakeaway: "Favouritism is a destructive mistake that echoes through generations.",
        aiTutorExplanation: "Isaac's birth was a miracle. His name means 'laughter' because his parents laughed when God promised him. However, Isaac repeated the cycle of sibling conflict by favoring Esau, while Rebekah favored Jacob, leading to deep rivalry.",
        scripture: "Genesis 25:28",
        scriptureText: {
          ESV: "Isaac loved Esau because he ate of his game, but Rebekah loved Jacob.",
          NIV: "Isaac, who had a taste for wild game, loved Esau, but Rebekah loved Jacob.",
          KJV: "And Isaac loved Esau, because he did eat of his venison: but Rebekah loved Jacob."
        },
        content: `Isaac was a miracle child born to infertile parents. His name means **"laughter"** because Abraham and Sarah laughed when God promised them a son.
        
Unfortunately, Isaac fell into the common trap of **favouritism**. He favored Esau because he loved eating his game, while his wife Rebekah favored Jacob. This error of favouritism was repeated by Jacob (who favored Joseph) and Abraham (who favored Isaac), leading to generations of sibling conflict.`,
        illustration: "🏹"
      },
      {
        type: "info",
        title: "Jacob: Wrestling for Blessings",
        keyTakeaway: "We must seek God's blessings and 'wrestle' with Him in persistent prayer.",
        aiTutorExplanation: "Jacob (supplanter/heel-grabber) had many character flaws, but he valued God's blessing. His dream of the ladder points to the Son of Man (John 1:51). His name was changed to 'Israel' after he wrestled with the messenger of God, showing we must wrestle in prayer.",
        scripture: "Genesis 32:28",
        scriptureText: {
          ESV: "Then he said, 'Your name shall no longer be called Jacob, but Israel, for you have striven with God and with men, and have prevailed.'",
          NIV: "Then the man said, 'Your name will no longer be Jacob, but Israel, because you have struggled with God and with humans and have overcome.'",
          KJV: "And he said, Thy name shall be called no more Jacob, but Israel: for as a prince hast thou power with God and with men, and hast prevailed."
        },
        content: `Jacob's name means **"supplanter"** or **"grabber of things not his"**. Despite his bad character, he sought God's blessing.
        
Jacob had two major encounters with God:
1. **Jacob's Ladder (Gen 28:12):** A ladder between heaven and earth, pointing directly to the Son of Man as the way to heaven (John 1:51).
2. **Wrestling with God (Gen 32:24-29):** Jacob wrestled with a messenger of God (the pre-incarnate Christ) and refused to let go. God changed his name to **Israel** ("one who struggles with God").`,
        illustration: "🤼"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "Israel became the name of the nation. The term 'Jews' actually comes from the tribe of Judah (the remnants of Judah), which survived Assyrian and Babylonian captivities.",
        question: "The term 'Jews' originally referred to all twelve tribes of Israel.",
        correctAnswer: "no",
        explanation: "Correct! 'Jews' refers specifically to the descendants of Judah (the tribe of Judah), which was the only surviving tribe after the captivities."
      },
      {
        type: "info",
        title: "Joseph: Sent Ahead to Save",
        keyTakeaway: "Joseph's life is a prophetic type of Jesus: rejected, suffering, and raised to save.",
        aiTutorExplanation: "Joseph was sold by his brothers into slavery, which was part of God's plan to preserve Israel and grow them from 70 people to 2-3 million. Like Jesus, Joseph had no visible sin recorded, served others even in prison, and forgave his abusers.",
        scripture: "Genesis 50:20",
        scriptureText: {
          ESV: "As for you, you meant evil against me, but God meant it for good, to bring it about that many people should be kept alive, as they are today.",
          NIV: "You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives.",
          KJV: "But as for you, ye thought evil against me; but God meant it unto good, to bring to pass, as it is this day, to save much people alive."
        },
        content: `Joseph was sold by his 11 brothers into slavery. God allowed this for divine reasons:
* **Growth:** To grow Israel from **70 people** into a strong nation of **2 to 3 million** in the fertile land of Egypt.
* **A Type of Christ:** Joseph has no visible sin recorded. He was rejected by his brothers, sold for silver, entered deep suffering, and was raised to the right hand of power to save his people.`,
        illustration: "👑"
      },
      {
        type: "quiz",
        title: "Prophecy Check",
        aiTutorExplanation: "Genesis 49:10 contains a powerful Messianic prophecy: the sceptre (rule) would not depart from Judah until Shiloh (Jesus) comes. This anticipated the Messiah's birth under Roman rule when Judah's self-rule finally ceased.",
        question: "What does the prophecy 'the sceptre shall not depart from Judah until Shiloh comes' (Genesis 49:10) mean?",
        options: [
          "Judah would never have any kings or rulers.",
          "The rule or authority would remain with the tribe of Judah until the coming of the Messiah (Jesus).",
          "The temple would be built by the tribe of Judah.",
          "Israel would remain in Egypt forever."
        ],
        correctAnswer: 1,
        explanation: "Excellent! The sceptre represents the rule, and Shiloh means Jesus. The prophecy foretells that the Messiah would come from Judah and arrive when Judah's self-rule ended."
      },
      {
        type: "info",
        title: "How Genesis Ends",
        keyTakeaway: "Genesis starts with a perfect creation and ends with a coffin, creating a parallel of silence.",
        aiTutorExplanation: "Genesis begins with life in Eden and ends with Joseph's death in a coffin. This highlights how sin brought death. The subsequent 400 years of silence in Egypt parallels the 400 years of silence between Malachi and the arrival of Christ.",
        scripture: "Genesis 50:26",
        scriptureText: {
          ESV: "So Joseph died, being 110 years old. They embalmed him, and he was put in a coffin in Egypt.",
          NIV: "So Joseph died at the age of a hundred and ten. And after they embalmed him, he was placed in a coffin in Egypt.",
          KJV: "So Joseph died, being an hundred and ten years old: and they embalmed him, and he was put in a coffin in Egypt."
        },
        content: `The book of Genesis ends in a striking way: with **Joseph's death in a coffin**. 

Genesis started with a perfect creation and ended with a coffin of death. Following this, there were **400 years of silence** from God before Moses was sent. This is a direct parallel to the **400 years of silence** between the end of the Old Testament (Malachi) and the coming of Jesus Christ.`,
        illustration: "⚰️"
      },
      {
        type: "summary",
        title: "Patriarchs Mastered!",
        aiTutorExplanation: "Congratulations! You have completed the story of Genesis. Next, we proceed to Exodus to study redemption.",
        content: `Amazing work! You have finished the study of the Patriarchs and the book of Genesis.
        
You understand the legacy of Isaac, Jacob's wrestling of faith, the prophecy of Shiloh, and how Joseph's suffering is a beautiful picture of Jesus. Let's move to the Book of Exodus!`,
        illustration: "🏆"
      }
    ]
  },
  {
    id: "exodus-deliverance",
    title: "Exodus: Redemption & Deliverance",
    category: "Exodus",
    duration: "15 mins",
    xpReward: 150,
    description: "Follow the greatest escape story in history. Explore the passover, Moses' burning bush call, and the design of the Tabernacle.",
    slides: [
      {
        type: "info",
        title: "The Greatest Escape",
        keyTakeaway: "Exodus is the central story of redemption in the Old Testament, illustrating God's grace.",
        aiTutorExplanation: "Moses wrote Exodus in two parts: Part 1 focuses on God's grace in delivering His people from Egypt. Part 2 records the Law given at Sinai, representing man's responsibility in response to God's grace.",
        scripture: "Exodus 12:51",
        scriptureText: {
          ESV: "And on that very day the LORD brought the people of Israel out of the land of Egypt by their hosts.",
          NIV: "And on that very day the LORD brought the Israelites out of Egypt by their divisions.",
          KJV: "And it came to pass the selfsame day, that the LORD did bring the children of Israel out of the land of Egypt by their armies."
        },
        content: `Exodus is the greatest escape story in history, where **2 to 3 million Israelites** escaped from Egypt. 
        
The book is structured into two simple parts:
1. **Part 1 (Grace):** What God did to deliver His people.
2. **Part 2 (Law):** The responsibility of man in response to God's saving grace.`,
        illustration: "🚶"
      },
      {
        type: "info",
        title: "Passover and Jesus",
        keyTakeaway: "The Passover lamb is a perfect prophetic 'type' of Jesus' crucifixion.",
        aiTutorExplanation: "The blood of the Passover lamb saved the Israelites from the angel of death. Jesus is our Passover Lamb who was examined and found unblemished, dying at 3pm on the exact calendar day the lambs were slaughtered.",
        scripture: "Exodus 12:13",
        scriptureText: {
          ESV: "The blood shall be a sign for you... and when I see the blood, I will pass over you...",
          NIV: "The blood will be a sign for you... and when I see the blood, I will pass over you...",
          KJV: "And the blood shall be to you for a token... and when I see the blood, I will pass over you..."
        },
        content: `Every detail of the Passover points to Jesus:
* **The Lamb:** A one-year-old unblemished male lamb, kept and inspected from the 10th to the 14th day.
* **The Blood:** Smeared on the doorposts to escape the angel of death.
* **The Parallel:** Jesus entered Jerusalem on the 10th day, was examined, and was crucified at 3pm on the 14th day—exactly when the Passover lambs were being slaughtered.`,
        illustration: "🐑"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "In Exodus 14, God parted the Red Sea for the Israelites to cross. In Christian life, going through the water of the Red Sea represents water baptism after we are saved.",
        question: "The parting and crossing of the Red Sea represents water baptism in the Christian journey.",
        correctAnswer: "yes",
        explanation: "Correct! The crossing of the Red Sea is a picture of water baptism, marking the transition from slavery to a new life in the wilderness with God."
      },
      {
        type: "info",
        title: "Moses and the Burning Bush",
        keyTakeaway: "God humbles our elitist training in the wilderness to prepare us for service.",
        aiTutorExplanation: "Moses spent 40 years in Egypt's secular elite education, growing arrogant. God then sent him to spend 40 years shepherding sheep in the wilderness to humble him. When God called him at the burning bush, He revealed His name: 'I AM' (Yahweh).",
        scripture: "Exodus 3:14",
        scriptureText: {
          ESV: "God said to Moses, 'I AM WHO I AM.' And he said, 'Say this to the people of Israel: \"I AM has sent me to you.\"'",
          NIV: "God said to Moses, 'I AM WHO I AM. This is what you are to say to the Israelites: \"I AM has sent me to you.\"'",
          KJV: "And God said unto Moses, I AM THAT I AM: and he said, Thus shalt thou say unto the children of Israel, I AM hath sent me unto you."
        },
        content: `God spent **40 years shepherding sheep** to humble Moses and prepare him to guide 3 million people. 

When God called him at the burning bush, Moses offered **5 excuses** (e.g. 'I am a nobody', 'I am not a good speaker'). God answered these fears by revealing His personal name: **"I AM" (Yahweh)**, emphasizing that He is the eternal, always-present God who is always with us.`,
        illustration: "🔥"
      },
      {
        type: "info",
        title: "The Tabernacle: A Type of Christ",
        keyTakeaway: "Every element of the Tabernacle shows the way to draw close to God.",
        aiTutorExplanation: "The Tabernacle had one door (Jesus is the door). Inside, the bronze altar represents sacrifice (Jesus' death) and the laver represents washing (sanctification). The Holy Place contains the menorah (light), showbread (nourishment), and incense (prayer), leading to the Ark of the Covenant.",
        scripture: "Exodus 25:9",
        scriptureText: {
          ESV: "Exactly as I show you concerning the pattern of the tabernacle, and of all its furniture, so you shall make it.",
          NIV: "Make this tabernacle and all its furnishings exactly like the pattern I will show you.",
          KJV: "According to all that I shew thee, after the pattern of the tabernacle, and the pattern of all the instruments thereof, even so shall ye make it."
        },
        content: `God instructed Moses to build the Tabernacle so He could dwell among them. It is a detailed picture of the Christian journey:
* **The Door:** Only one entrance, embroidered in blue, purple, and scarlet.
* **The Courtyard:** The bronze altar for sacrifice, and the laver for priests to wash.
* **The Furnishings:** Made of acacia wood (humanity of Christ) overlaid with pure gold (deity of Christ).`,
        illustration: "⛺"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "The gold represents deity, and the acacia wood represents humanity. Together, they represent Jesus as 100% Man and 100% God.",
        question: "What do the acacia wood and gold furnishings inside the Tabernacle symbolize?",
        options: [
          "The transition from agriculture to metalworking.",
          "The dual nature of Christ: His humanity (wood) and His deity (gold).",
          "The wealth of the Egyptian empire.",
          "The natural resources of the Sinai peninsula."
        ],
        correctAnswer: 1,
        explanation: "Correct! Acacia wood represents the humanity of Christ, and gold represents His deity. The Tabernacle is a picture of Jesus dwelling among us."
      },
      {
        type: "info",
        title: "The Ten Commandments",
        keyTakeaway: "The Ten Commandments are structured in two divisions: Duty to God and Duty to Neighbor.",
        aiTutorExplanation: "The first 4 commandments concern our relationship with God (no other gods, no idols, not using God's name in vain, keeping the Sabbath). The remaining 6 concern our relationships with fellow humans (honoring parents, no murder, no adultery, no stealing, no lying, no coveting).",
        scripture: "Exodus 20:3-17",
        scriptureText: {
          ESV: "You shall have no other gods before me...",
          NIV: "You shall have no other gods before me...",
          KJV: "Thou shalt have no other gods before me..."
        },
        content: `The Law is structured beautifully to reflect order:
* **The First Table (1-4):** Focuses on our devotion to God.
* **The Second Table (5-10):** Focuses on our duty to our fellow men.
Jesus summarized these two tables as the **Greatest Commandments**: Love God with all your heart, and love your neighbor as yourself.`,
        illustration: "📜"
      },
      {
        type: "info",
        title: "The Mercy Seat",
        keyTakeaway: "The Mercy Seat sits on top of the Ark, shielding us from the judgment of the Law.",
        aiTutorExplanation: "The Ark of the Covenant contains the stone tablets of the Law (which condemns us). But it is covered by the Mercy Seat (solid gold) where blood was sprinkled, satisfying God's justice so He sees the blood of atonement instead of our broken law.",
        scripture: "Exodus 25:22",
        scriptureText: {
          ESV: "There I will meet with you, and from above the mercy seat, from between the two cherubim...",
          NIV: "There, above the cover between the two cherubim... I will meet with you...",
          KJV: "And there I will meet with thee, and I will commune with thee from above the mercy seat..."
        },
        content: `The Ark of the Covenant holds:
1. **The Law:** Stone tablets representing God's holy standard.
2. **The Manna:** Representing Israel's rejection of God's provision.
3. **Aaron's Rod:** Representing rebellion against God's appointed leadership.

All three items condemn humanity. However, they are covered by the **Mercy Seat** made of solid gold. When the High Priest sprinkles sacrificial blood on the Mercy Seat, God looks down and sees the **blood of atonement** rather than the symbols of our sin and rebellion.`,
        illustration: "👑"
      },
      {
        type: "quiz",
        title: "Active Recall: The Mercy Seat",
        aiTutorExplanation: "The blood on the Mercy Seat satisfies the demands of the Law underneath it. In the same way, Jesus' blood on the cross covers our transgressions of the Law.",
        question: "Why is the position of the Mercy Seat covering the contents of the Ark of the Covenant significant?",
        options: [
          "It acts as a secure lid to prevent items from falling out during transit.",
          "It represents how God's mercy and the blood of atonement cover our violations of His holy Law.",
          "It was designed by Moses to showcase the gold of Egypt.",
          "It has no spiritual meaning and was only symbolic of wealth."
        ],
        correctAnswer: 1,
        explanation: "Correct! The Mercy Seat covers the items of law and rebellion inside the Ark, showing that mercy triumphs over judgment through the blood of sacrifice."
      },
      {
        type: "summary",
        title: "Exodus Mastered!",
        aiTutorExplanation: "Excellent! You have completed the full study of Exodus. Let's move on to the book of Leviticus to understand worship and offerings.",
        content: `Wonderful work! You have finished the complete study of Exodus.

You understand the structure of the escape, the Passover parallel, Moses' humility, the Tabernacle as a shadow of Jesus Christ, the Ten Commandments structure, and how the Mercy Seat shields us from the Law's condemnation. Let's start the Book of Leviticus!`,
        illustration: "🏆"
      }
    ]
  },
  {
    id: "leviticus-worship",
    title: "Leviticus: Offerings, Feasts & Worship",
    category: "Leviticus",
    duration: "11 mins",
    xpReward: 200,
    description: "Understand the five offerings, the seven feasts, the Day of Atonement, and what it means to live holy before God.",
    slides: [
      {
        type: "info",
        title: "Leviticus: Living with a Holy God",
        keyTakeaway: "Obeying the Law is our response to the salvation given to us, not a way to earn it.",
        aiTutorExplanation: "90% of Leviticus is God speaking directly to Moses. The Law was given 50 days after the deliverance, showing that we are saved first, and then we obey. It teaches that the Old Testament is revealed in the New, and the New is concealed in the Old.",
        scripture: "Hebrews 10:1",
        scriptureText: {
          ESV: "For since the law has but a shadow of the good things to come instead of the true form of these realities...",
          NIV: "The law is only a shadow of the good things that are coming—not the realities themselves...",
          KJV: "For the law having a shadow of good things to come, and not the very image of the things..."
        },
        content: `Leviticus is often skipped, but it contains essential principles for living in the presence of a Holy God:
* **Deliverance First:** The Law was given only *after* deliverance from Egypt. Hence, the Law was not given to save us, but as our response to being saved.
* **The Connection:** As the saying goes: *The Old Testament is revealed in the New; the New Testament is concealed in the Old.*`,
        illustration: "📖"
      },
      {
        type: "info",
        title: "The Five Offerings",
        keyTakeaway: "The offerings represent different aspects of Consecration, Communion, and Atonement.",
        aiTutorExplanation: "The first three offerings are voluntary: Burnt (consecration), Grain (pure service), and Peace (communion). The last two are mandatory: Sin (atonement for unintentional sin) and Trespass (restitution + 20%). All point to Christ's sacrifice.",
        scripture: "1 Peter 3:18",
        scriptureText: {
          ESV: "For Christ also suffered once for sins, the righteous for the unrighteous, that he might bring us to God...",
          NIV: "For Christ also suffered once for sins, the righteous for the unrighteous, to bring you to God...",
          KJV: "For Christ also hath once suffered for sins, the just for the unjust, that he might bring us to God..."
        },
        content: `Israel was commanded to bring 5 types of offerings to God:
1. **Burnt Offering (Voluntary):** Consecrating yourself wholly to God.
2. **Grain Offering (Voluntary):** Offering pure, sinless service.
3. **Peace Offering (Voluntary):** Communion and sharing food with God.
4. **Sin Offering (Mandatory):** Paid for unintentional sins (animal burnt *outside the camp*, pointing to Christ crucified outside Jerusalem).
5. **Trespass Offering (Mandatory):** Restitution for sins, adding **20%** value.`,
        illustration: "🐂"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "Under the Law, there was no animal offering provided for intentional sins. This highlights the absolute necessity of Christ's perfect sacrifice.",
        question: "Under the Levitical law, there was a specific animal offering provided for intentional, deliberate sins.",
        correctAnswer: "no",
        explanation: "Correct! The Sin Offering was only for unintentional sins. For intentional sin, no animal sacrifice was provided—pointing to our complete dependence on the cross of Jesus."
      },
      {
        type: "info",
        title: "The Seven Feasts: First Coming",
        keyTakeaway: "The first four feasts parallel events that already happened in Christ's first coming.",
        aiTutorExplanation: "The feasts are prophetic shadows: Passover (Crucifixion), Unleavened Bread (putting away sin), Firstfruits (Resurrection on the 3rd day), and Pentecost (Holy Spirit given 50 days later).",
        scripture: "Leviticus 23:4",
        scriptureText: {
          ESV: "These are the appointed feasts of the LORD, the holy convocations, which you shall proclaim...",
          NIV: "These are the LORD's appointed festivals, the sacred assemblies you are to proclaim...",
          KJV: "These are the feasts of the LORD, even holy convocations, which ye shall proclaim..."
        },
        content: `The Jewish feasts are prophetic shadows of Christ. The first 4 were fulfilled during His **first coming**:
1. **Passover:** Crucifixion of Christ.
2. **Feast of Unleavened Bread:** Clearing out yeast (putting away sins and repenting).
3. **Feast of Firstfruits:** Resurrection of Christ (on the 3rd day, as the firstfruits of believers).
4. **Feast of Pentecost:** Given 50 days later, representing the giving of the Holy Spirit (Acts 2).`,
        illustration: "🌾"
      },
      {
        type: "info",
        title: "The Seven Feasts: Second Coming",
        keyTakeaway: "The last three feasts point to what Jesus will do in His second coming.",
        aiTutorExplanation: "Between the first 4 and last 3 feasts is a long agricultural break. This represents the Church Age. The final feasts are Trumpets (2nd coming), Day of Atonement (Jews' repentance), and Tabernacles (dwelling in the New Heaven/Earth).",
        scripture: "Leviticus 23:24",
        scriptureText: {
          ESV: "...In the seventh month, on the first day of the month, you shall observe a day of solemn rest, a memorial proclaimed with blast of trumpets...",
          NIV: "...On the first day of the seventh month you are to have a day of sabbath rest, a sacred assembly commemorated with trumpet blasts.",
          KJV: "...In the seventh month, in the first day of the month, shall ye have a sabbath, a memorial of blowing of trumpets..."
        },
        content: `Between the first 4 feasts and the last 3 feasts, there is a long break depicting the **Church Age**. The final 3 feasts occur in the 7th month and point to the **second coming**:
5. **Feast of Trumpets:** The trumpet blown to signal the harvest (representing the second coming).
6. **Day of Atonement:** The High Priest making national atonement (representing the remnant of Jews repenting).
7. **Feast of Tabernacles:** Living in tents where God is present (representing dwelling with God in the New Heaven/Earth).`,
        illustration: "🎺"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "The long summer break in the feast calendar represents the Church Age—the period we live in now, waiting for the trumpet blast of Christ's return.",
        question: "What does the long break between the first four feasts and the last three feasts symbolize?",
        options: [
          "The Babylonian captivity.",
          "The Church Age, representing the interval before Christ's second coming.",
          "The period of slavery in Egypt.",
          "The forty years of wilderness wandering."
        ],
        correctAnswer: 1,
        explanation: "Correct! The long break represents the Church Age, during which we share the Gospel and wait for the final feasts to be fulfilled."
      },
      {
        type: "info",
        title: "The Day of Atonement (Yom Kippur)",
        keyTakeaway: "Yom Kippur is the most sacred day of the year, focusing on national cleansing.",
        aiTutorExplanation: "The Day of Atonement (Yom Kippur) is described in Leviticus 16. On this day, the High Priest entered the Holy of Holies to make atonement for the sins of the nation using the blood of a goat, restoring their communion with God.",
        scripture: "Leviticus 16:30",
        scriptureText: {
          ESV: "For on this day shall atonement be made for you to cleanse you...",
          NIV: "because on this day atonement will be made for you, to cleanse you...",
          KJV: "For on that day shall the priest make an atonement for you, to cleanse you..."
        },
        content: `On the Day of Atonement, two goats were selected:
1. **The Lord's Goat (Propitiation):** It was slaughtered as a sin offering to satisfy God's justice. Its blood was sprinkled on the Mercy Seat.
2. **The Scapegoat (Expiation):** The High Priest laid hands on its head, confessing the nation's sins, and it was sent away into the wilderness, representing the **removal of sins** away from God's presence.`,
        illustration: "🐐"
      },
      {
        type: "info",
        title: "Living Holy Lives",
        keyTakeaway: "Holiness is not about legalism, but about being set apart for God's purposes.",
        aiTutorExplanation: "God repeated: 'Be holy, for I am holy.' Holiness (Kadosh) literally means 'separate' or 'set apart'. In Leviticus, food and clean laws were designed to keep Israel separate from pagan cultures, drawing them closer to God.",
        scripture: "Leviticus 19:2",
        scriptureText: {
          ESV: "Speak to all the congregation... 'You shall be holy, for I the LORD your God am holy.'",
          NIV: "Speak to the entire assembly... 'Be holy because I, the LORD your God, am holy.'",
          KJV: "Speak unto all the congregation... Ye shall be holy: for I the LORD your God am holy."
        },
        content: `God's standard is absolute holiness:
* **Holiness is separation:** To be set apart from worldly patterns for God's use.
* **Separation by Food (Lev 11):** Clean and unclean rules distinguished Israel.
* **Jesus' fulfillment:** Jesus declared all foods clean (Mark 7:19), showing that true holiness is a matter of the **heart**, not outward ritual rules.`,
        illustration: "✨"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "The Scapegoat represents expiation—the removal of sin. In the New Testament, John the Baptist says of Jesus: 'Behold, the Lamb of God who takes away the sin of the world!' (John 1:29)",
        question: "The scapegoat carried the sins of the nation into the wilderness, symbolizing the removal of sin.",
        correctAnswer: "yes",
        explanation: "Correct! The scapegoat represents expiation, showing how Jesus completely removes our transgressions as far as the east is from the west."
      },
      {
        type: "summary",
        title: "Leviticus Mastered!",
        aiTutorExplanation: "Awesome! You have completed the full study of Leviticus. Next, let's explore the Book of Numbers.",
        content: `Superb effort! You have completed the full study of Leviticus.

You understand the meaning of the five offerings, the prophetic timeline of the seven feasts pointing to Christ's two comings, the Day of Atonement with its two goats, and what it means to live a life of holiness unto God. Let's move to the Book of Numbers!`,
        illustration: "🏆"
      }
    ]
  },
  {
    id: "numbers-wilderness",
    title: "Numbers: Wandering in the Wilderness",
    category: "Numbers",
    duration: "11 mins",
    xpReward: 200,
    description: "Explore the 40-year wilderness journey, the twelve spies, Korah's rebellion, and the bronze serpent as a picture of Christ.",
    slides: [
      {
        type: "info",
        title: "Why is it called Numbers?",
        keyTakeaway: "Numbers covers 40 years of wandering, characterized by two military censuses.",
        aiTutorExplanation: "The name comes from the two censuses taken of military-aged men over 20. The first was taken after leaving Sinai, and the second was taken 40 years later. The number of men did not increase, showing God's discipline.",
        scripture: "Numbers 1:2",
        scriptureText: {
          ESV: "Take a census of all the congregation of the people of Israel, by clans, by fathers' houses...",
          NIV: "Take a census of the whole Israelite community by their clans and families...",
          KJV: "Take ye the sum of all the congregation of the children of Israel, after their families..."
        },
        content: `The Book of Numbers covers a period of **40 years** in the wilderness. It is named after the **two censuses** taken:
1. **First Census:** Right after leaving Mount Sinai (approx. 600,000 adult males).
2. **Second Census:** 40 years later, before entering the Promised Land.
Interestingly, the number of men did not increase (it was 2,000 fewer), indicating that God did not bless their growth due to their rebellion and disbelief.`,
        illustration: "📊"
      },
      {
        type: "info",
        title: "The Three Categories of Law",
        keyTakeaway: "God gave laws of costliness, cleanliness, and carefulness to prevent casualness.",
        aiTutorExplanation: "One of the biggest sins is casualness (presumption or lack of reverence). God structured laws to make them careful: costliness (expensive sacrifices), cleanliness (confessing sins), and carefulness (approaching His presence with fear).",
        scripture: "Numbers 6:24-26",
        scriptureText: {
          ESV: "The LORD bless you and keep you; the LORD make his face to shine upon you and be gracious to you; the LORD lift up his countenance upon you and give you peace.",
          NIV: "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you; the LORD turn his face toward you and give you peace.",
          KJV: "The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace."
        },
        content: `To combat the sin of **casualness** (the sin of presumption or lack of reverence for God's presence), the Law was divided into three areas:
* **Costly Laws:** Constant animal sacrifices, showing that coming to God is expensive.
* **Cleanliness Laws:** Approaching God clean (ritual purity, confessing sins).
* **Carefulness Laws:** Extreme care in approaching God (e.g. keeping tents half a kilometer away from the Tabernacle).`,
        illustration: "🛡️"
      },
      {
        type: "card-quiz",
        title: "Berea Card Check",
        aiTutorExplanation: "At the end of the 40 years, only 2 of the original adult generation who left Egypt entered the Promised Land: Joshua and Caleb. All the rebellious ones died in the wilderness.",
        question: "Joshua and Caleb were the only two adult men from the original generation who left Egypt to enter the Promised Land.",
        correctAnswer: "yes",
        explanation: "Correct! Joshua and Caleb had faith, while the rest of the adult generation died in the wilderness due to disbelief and complaining."
      },
      {
        type: "info",
        title: "The Danger of Complaining",
        keyTakeaway: "Complaining is the most common sin of commission, showing a lack of reliance on God.",
        aiTutorExplanation: "Complaining requires no talent. The Israelites complained constantly about the manna and water, desiring to return to Egypt. God had to separate them in the wilderness to leave Egypt behind in their minds.",
        scripture: "Numbers 11:1",
        scriptureText: {
          ESV: "And the people complained in the hearing of the LORD about their misfortunes, and when the LORD heard it, his anger was kindled...",
          NIV: "Now the people complained about their hardships in the hearing of the LORD, and when he heard them his anger was aroused...",
          KJV: "And when the people complained, it displeased the LORD: and the LORD heard it; and his anger was kindled..."
        },
        content: `While presumption is common, the most frequent sin committed by the Israelites was **COMPLAINING**. 
        
It took the Israelites only **40 days** to travel from Egypt to Mount Sinai, but it took **40 years** to leave Egypt behind in their minds! They struggled to adapt, complaining about food and water at every trial rather than trusting in God's daily provision of manna.`,
        illustration: "🗣️"
      },
      {
        type: "info",
        title: "The Bronze Serpent & Balaam",
        keyTakeaway: "The bronze serpent lifted on a pole is a direct type of Christ lifted on the cross.",
        aiTutorExplanation: "In Numbers 21, God sent fiery serpents because of their complaints. Moses lifted a bronze serpent on a pole, and anyone who looked at it was healed. In John 3:14-15, Jesus states that as Moses lifted the serpent, so the Son of Man must be lifted up.",
        scripture: "Numbers 21:9",
        scriptureText: {
          ESV: "So Moses made a bronze serpent and set it on a pole. And if a serpent bit anyone, he would look at the bronze serpent and live.",
          NIV: "So Moses made a bronze serpent and put it up on a pole. Then when anyone was bitten by a snake and looked at the bronze serpent, they lived.",
          KJV: "And Moses made a serpent of brass, and put it upon a pole, and it came to pass, that if a serpent had bitten any man, when he beheld the serpent of brass, he lived."
        },
        content: `When the people complained, God sent fiery serpents. To cure them, God had Moses lift up a **bronze serpent on a pole**.
        
This is a direct picture of Jesus:
* **The Serpent:** Represents sin. Bronze represents judgment.
* **The Cross:** Jesus was made sin for us (2 Cor 5:21) and judged on the cross. Anyone who looks to Him in faith is cured of the poison of sin.
* **Balaam's Prophecy:** Even the corrupt prophet Balaam prophesied of the coming Messiah: **"a Star shall come out of Jacob, a sceptre shall rise out of Israel"** (Num 24:17).`,
        illustration: "🐍"
      },
      {
        type: "quiz",
        title: "Active Recall",
        aiTutorExplanation: "Jesus directly referenced the bronze serpent in John 3:14-15. Looking at the serpent required faith, just as looking at the cross does.",
        question: "How does the bronze serpent in Numbers 21 represent Jesus Christ?",
        options: [
          "It represents the medicine and doctors of Israel.",
          "It represents Christ being made sin for us and lifted on the cross, so that whoever looks to Him in faith will live.",
          "It represents the danger of animal worship.",
          "It shows that Moses was a skilled metal craftsman."
        ],
        correctAnswer: 1,
        explanation: "Correct! The bronze serpent is a type of Christ on the cross, who took the judgment for our sin so that we might look to Him and be saved."
      },
      {
        type: "info",
        title: "The Twelve Spies at Kadesh-barnea",
        keyTakeaway: "Unbelief magnifies the giants and forgets the giants God has already defeated.",
        aiTutorExplanation: "Moses sent 12 spies to inspect Canaan. 10 returned with an evil report of giants, causing the nation to weep and rebel. Only Joshua and Caleb trusted God. Due to their unbelief, God sentenced that generation to wander 40 years until they died.",
        scripture: "Numbers 13:30",
        scriptureText: {
          ESV: "But Caleb quieted the people... and said, 'Let us go up at once and occupy it, for we are well able to overcome it.'",
          NIV: "Then Caleb silenced the people... and said, 'We should go up and take possession of the land, for we can certainly do it.'",
          KJV: "And Caleb stilled the people... and said, Let us go up at once, and possess it; for we are well able to overcome it."
        },
        content: `At Kadesh-barnea, Israel stood on the border of the Promised Land:
* **The Spies:** 10 spies looked at the giants and felt like "grasshoppers." 2 spies (Joshua & Caleb) looked at God and saw victory.
* **The Cost of Unbelief:** The nation listened to the 10 spies. God turned them back into the wilderness to wander for **one year for each of the 40 days** the spies searched the land.`,
        illustration: "🍇"
      },
      {
        type: "info",
        title: "Korah's Rebellion",
        keyTakeaway: "Rebelling against God's appointed leaders is rebelling against God Himself.",
        aiTutorExplanation: "Korah led a rebellion of 250 prominent leaders against Moses and Aaron, claiming everyone was equally holy. God judged Korah by causing the earth to open and swallow him, confirming Aaron's priesthood when his rod budded overnight.",
        scripture: "Numbers 16:3",
        scriptureText: {
          ESV: "They assembled themselves together against Moses and against Aaron...",
          NIV: "They came as a group to oppose Moses and Aaron...",
          KJV: "And they gathered themselves together against Moses and against Aaron..."
        },
        content: `Korah's rebellion was a challenge to God's authority structure:
* **The Claim:** "All the congregation is holy, why do you exalt yourselves?"
* **The Judgment:** The earth opened and swallowed Korah, Dathan, and Abiram.
* **The Confirmation:** God had each tribe place a staff in the Tabernacle. **Aaron's staff budded, blossomed, and produced ripe almonds** overnight, proving God's choice.`,
        illustration: "🌿"
      },
      {
        type: "quiz",
        title: "Active Recall: Aaron's Sign",
        aiTutorExplanation: "Aaron's rod budding was a miraculous sign of resurrection and life coming out of a dead stick, confirming his priesthood.",
        question: "What miraculous sign did God use to confirm Aaron's family as the chosen priesthood?",
        options: [
          "Aaron's staff turned into a bronze serpent.",
          "Aaron's staff budded, blossomed, and produced almonds overnight.",
          "Fire came down from heaven to consume Aaron's staff.",
          "Aaron's staff parted the Jordan river."
        ],
        correctAnswer: 1,
        explanation: "Correct! Aaron's rod budding was God's sign of life, confirming that Aaron was chosen to serve as High Priest."
      },
      {
        type: "summary",
        title: "Numbers Mastered!",
        aiTutorExplanation: "Congratulations! You have completed the complete study of Numbers and finished the entire introductory block of the Law.",
        content: `Incredible! You have completed the full study of the Book of Numbers.

You have mastered the lessons of the wilderness, the categories of God's laws, the danger of complaining, the beautiful picture of Jesus in the bronze serpent, the twelve spies and the cost of unbelief, and Korah's rebellion confirming God's appointed leadership. Keep shining your light!`,
        illustration: "🏆"
      }
    ]
  }
];
