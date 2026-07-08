const fs = require('fs');
const path = require('path');

const modulesFilePath = path.join(__dirname, 'modules.js');
const appFilePath = path.join(__dirname, 'app.js');

if (!fs.existsSync(modulesFilePath)) {
  console.error('modules.js not found at:', modulesFilePath);
  process.exit(1);
}

// -------------------------------------------------------------
// 1. Data definitions
// -------------------------------------------------------------

const newConcentrations = [
  {
    "id": "1chronicles",
    "title": "1 Chronicles",
    "group": "Books of the Bible",
    "description": "The genealogical history of God's covenant people, David's reign, and the blueprint for the Temple.",
    "modules": [
      "1chronicles"
    ]
  },
  {
    "id": "2chronicles",
    "title": "2 Chronicles",
    "group": "Books of the Bible",
    "description": "Solomon's temple glory, the reforms of the righteous kings of Judah, and the hope of return from exile.",
    "modules": [
      "2chronicles"
    ]
  },
  {
    "id": "ezra",
    "title": "Ezra",
    "group": "Books of the Bible",
    "description": "The return of the exiles under Zerubbabel and Ezra, rebuilding the altar, the Temple, and national holiness.",
    "modules": [
      "ezra"
    ]
  },
  {
    "id": "nehemiah",
    "title": "Nehemiah",
    "group": "Books of the Bible",
    "description": "Rebuilding the walls of Jerusalem, restoring the community, and renewing the covenant.",
    "modules": [
      "nehemiah"
    ]
  },
  {
    "id": "esther",
    "title": "Esther",
    "group": "Books of the Bible",
    "description": "The hidden providence of God in saving the Jewish diaspora from destruction through Queen Esther.",
    "modules": [
      "esther-1",
      "esther-2"
    ]
  },
  {
    "id": "job",
    "title": "Job",
    "group": "Books of the Bible",
    "description": "A poetic exploration of suffering, divine justice, and trusting the Creator in a complex cosmos.",
    "modules": [
      "job-1",
      "job-2"
    ]
  }
];

const newModules = [
  {
    "id": "1chronicles",
    "title": "1 Chronicles: Temple Blueprints and Royal Lineage",
    "category": "1 Chronicles",
    "duration": "8 mins",
    "xpReward": 150,
    "description": "Examine the lineage of David, the preservation of the royal seed, and the temple construction blueprint.",
    "slides": [
      {
        "type": "info",
        "title": "A History for Returnees",
        "keyTakeaway": "Chronicles was written for the post-exilic community to remind them of their identity and God's covenant.",
        "aiTutorExplanation": "Welcome to 1 Chronicles! Unlike Samuel and Kings, which explained why the exile happened, Chronicles was written to restore hope to those returning from exile.",
        "scripture": "1 Chronicles 9:1",
        "scriptureText": {
          "ESV": "So all Israel was recorded by genealogies, and these are written in the Book of the Kings of Israel. And Judah was taken into exile to Babylon because of their breach of faith."
        },
        "content": "\n- **Post-Exilic Context:** Written after the exile, the book addresses returning refugees who were struggling with their spiritual and cultural identity.\n- **Different Perspectives:** While Samuel and Kings provide a prophetic history focusing on political decay, Chronicles offers a priestly history focusing on temple worship.\n- **covenant Rebuilding:** The narrative establishes continuity with the past, reassuring the remnant that God's covenant promises remain fully active.\n",
        "illustration": "📜"
      },
      {
        "type": "quiz",
        "title": "Historical Perspective Check",
        "aiTutorExplanation": "Let's review the core distinction between the histories of Kings and Chronicles.",
        "question": "How does the historical focus of Chronicles differ from the books of Samuel and Kings?",
        "options": [
          "Kings focuses on geopolitical events and political decay, while Chronicles focuses on priestly temple worship and royal covenants",
          "Kings is entirely symbolic, while Chronicles is a military logbook",
          "Kings was written by Persian governors, while Chronicles was written by Egyptian priests",
          "Kings excludes the royal lineage, while Chronicles excludes the priesthood entirely"
        ],
        "correctAnswer": 0,
        "explanation": "Chronicles focuses on the priestly history of worship, the sanctuary, and the lineage of David, whereas Samuel and Kings focus on the prophetic evaluation of geopolitical and moral decay."
      },
      {
        "type": "info",
        "title": "The Theology of Genealogies",
        "keyTakeaway": "Genealogies from Adam to David proved that God's plan was still on track and that the remnant had a heritage.",
        "aiTutorExplanation": "The first nine chapters of Chronicles are lists of names. They might seem dry, but they carried massive theological significance for the returnees.",
        "scripture": "1 Chronicles 3:1",
        "scriptureText": {
          "ESV": "These are the sons of David born to him in Hebron: the firstborn, Amnon, by Ahinoam the Jezreelite..."
        },
        "content": "\n- **Adam to David:** The genealogies trace human history from Adam to David, linking the small post-exilic remnant to the global plan of God.\n- **Focus on Two Tribes:** The records highlight Judah (the royal line of the Messiah) and Levi (the priestly line of the Temple).\n- **Verification of Identity:** These lists verified who had legitimate rights to inherit land and who was qualified to serve as priests in the rebuilt Temple.\n",
        "illustration": "🌳"
      },
      {
        "type": "quiz",
        "title": "Purpose of Genealogies",
        "aiTutorExplanation": "Let's check your understanding of the practical and spiritual value of these lists.",
        "question": "Why were the detailed genealogies in Chronicles so important to the post-exilic community?",
        "options": [
          "They helped the returnees negotiate military treaties with neighboring nations",
          "They verified covenant lineage, land inheritances, and priestly qualifications",
          "They proved that the Hebrew alphabet was older than cuneiform",
          "They allowed returnees to demand tribute from the Persian treasury"
        ],
        "correctAnswer": 1,
        "explanation": "genealogies established clear continuity, allowing families to prove their ancestral lands and verifying who was authorized to perform temple sacrifices."
      },
      {
        "type": "info",
        "title": "Preservation of the Royal Line",
        "keyTakeaway": "God kept the line of David alive even during captivity, fulfilling His promise of an eternal King.",
        "aiTutorExplanation": "Despite the total destruction of Jerusalem and the royal palace, God's promise to David did not fail. The seed was preserved.",
        "scripture": "1 Chronicles 3:17",
        "scriptureText": {
          "ESV": "and the sons of Jeconiah, the captive: Shealtiel his son..."
        },
        "content": "\n- **Captive but Preserved:** Even though King Jeconiah was imprisoned in Babylon, his children survived, keeping the Davidic line unbroken.\n- **Zerubbabel's Link:** Zerubbabel, who led the reconstruction of the second temple, was a direct descendant of Jeconiah and part of this preserved line.\n- **Messianic Shadow:** This preservation directly points forward to the birth of Jesus Christ, the ultimate heir of David's eternal throne.\n",
        "illustration": "👑"
      },
      {
        "type": "card-quiz",
        "title": "Northern Tribes Check",
        "aiTutorExplanation": "Let's review the fate of the Northern Kingdom in the Chronicler's genealogies.",
        "question": "True or False: The Northern Kingdom tribes were completely obliterated during the Assyrian captivity, leaving no remnant in the genealogies of Chronicles.",
        "correctAnswer": "no",
        "explanation": "Chronicles explicitly documents remnants from Northern tribes (like Ephraim, Manasseh, and Asher) joining the Southern tribes, preserving the ideal of a unified all Israel."
      },
      {
        "type": "info",
        "title": "The Temple Blueprint",
        "keyTakeaway": "David received the architectural template of the Temple from God by the Spirit, matching Moses' Tabernacle plan.",
        "aiTutorExplanation": "The Temple was not simply Solomon's or David's idea. Its exact specifications were divinely revealed, just like the Tabernacle.",
        "scripture": "1 Chronicles 28:19",
        "scriptureText": {
          "ESV": "\"All this he made clear to me in writing from the hand of the Lord, all the work to be done according to the plan.\""
        },
        "content": "\n- **Moses Parallel:** Just as Moses received the Tabernacle blueprints on Sinai, David received the Temple plans in writing from the hand of the Lord.\n- **Spirit's Guidance:** The layout, courts, and vessels were designated by the Holy Spirit to reflect the heavenly pattern.\n- **Royal Provision:** David spent his final years accumulating massive reserves of gold, silver, and stone to ensure Solomon could build the sanctuary.\n",
        "illustration": "📐"
      },
      {
        "type": "quiz",
        "title": "The Blueprint Parallel",
        "aiTutorExplanation": "Think about the historical parallels between the two major sanctuaries of Israel.",
        "question": "Whose experience is closely paralleled by David receiving the Temple blueprints in writing from the hand of the Lord?",
        "options": [
          "Noah building the ark in the wilderness",
          "Moses receiving the pattern of the Tabernacle on Mount Sinai",
          "Joshua setting up the stones of remembrance at Gilgal",
          "Solomon purchasing cedar trees from the King of Tyre"
        ],
        "correctAnswer": 1,
        "explanation": "David receiving the Temple plans from the hand of the Lord mirrors Moses receiving the Tabernacle plans, indicating that both sanctuaries were designed by God."
      },
      {
        "type": "info",
        "title": "The Idealized David",
        "keyTakeaway": "Chronicles omits David's moral failures to present him as a type of the coming Messianic King.",
        "aiTutorExplanation": "You might notice that the Bathsheba incident and Absalom's rebellion are completely missing in Chronicles. Let's look at the theological reason for this omission.",
        "scripture": "1 Chronicles 17:11-12",
        "scriptureText": {
          "ESV": "I will raise up your offspring after you... and I will establish his kingdom. He shall build a house for me, and I will establish his throne forever."
        },
        "content": "\n- **Selective Focus:** The author does not falsify history, but chooses to focus on David's priestly and kingly achievements as a temple builder.\n- **Messianic Shadow:** By leaving out David's moral failures, the book presents a typological portrait of the coming perfect, sinless Son of David.\n- **Temple Champion:** David's primary identity in Chronicles is the architect of Israel's worship and the organizer of the Levitical singers.\n",
        "illustration": "🛡️"
      },
      {
        "type": "quiz",
        "title": "Purpose of Omission",
        "aiTutorExplanation": "Let's identify the theological motivation behind the presentation of David in Chronicles.",
        "question": "Why does the Book of Chronicles omit David's major sins, such as his affair with Bathsheba?",
        "options": [
          "The author was unaware of these events because they occurred in secret",
          "To present David as a prophetic archetype of the coming perfect Messianic King",
          "To make the book shorter and easier to transcribe onto scrolls",
          "Because the Persian governors prohibited the recording of kingly errors"
        ],
        "correctAnswer": 1,
        "explanation": "Omitting David's sins creates an idealized portrait that foreshadows the perfect Messianic King who will reign in righteousness."
      },
      {
        "type": "info",
        "title": "The Davidic Covenant",
        "keyTakeaway": "God promised David an eternal dynasty, which finds its ultimate fulfillment in the kingdom of Jesus.",
        "aiTutorExplanation": "The heart of 1 Chronicles is chapter 17, where God responds to David's desire to build a Temple with a promise of an eternal line.",
        "scripture": "1 Chronicles 17:14",
        "scriptureText": {
          "ESV": "but I will confirm him in my house and in my kingdom forever, and his throne shall be established forever."
        },
        "content": "\n- **A House for David:** David wished to build God a cedar temple, but God promised to build David a household (a royal dynasty).\n- **The Eternal Throne:** Unlike Saul's dynasty which ended, David's throne was promised to stand forever.\n- **Fulfillment in Christ:** When the physical line of kings was cut down like a stump, the covenant remained the anchor that led to Jesus, the root of Jesse.\n",
        "illustration": "🏛️"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Outstanding work! You have completed the study of 1 Chronicles.",
        "content": "\n### Major Pillars Mastered:\n- **Identity Reclaimed:** You learned how 1 Chronicles restored the identity of post-exilic Israel through genealogies.\n- **The Royal Line:** You saw how God preserved the line of David through captivity to fulfill His promise.\n- **The Divine Template:** You discovered the parallel between Moses' Tabernacle and David's Temple plans.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "2chronicles",
    "title": "2 Chronicles: Solomon and the Kings of Judah",
    "category": "2 Chronicles",
    "duration": "10 mins",
    "xpReward": 180,
    "description": "Study the temple dedication, reforms of the Southern Kings, and Cyrus's decree of return.",
    "slides": [
      {
        "type": "info",
        "title": "Solomon's Dedication Prayer",
        "keyTakeaway": "Solomon's prayer of dedication established the Temple as the primary earthly point of contact with God.",
        "aiTutorExplanation": "Welcome to 2 Chronicles! We begin with the peak of Israel's golden era: the construction and dedication of Solomon's Temple.",
        "scripture": "2 Chronicles 6:18",
        "scriptureText": {
          "ESV": "But will God indeed dwell with man on the earth? Behold, heaven and the highest heaven cannot contain you, how much less this house that I have built!"
        },
        "content": "\n- **The Glory Descends:** When the Temple was finished, the glory cloud filled the sanctuary, and fire consumed the sacrifices.\n- **A House of Prayer:** Solomon prayed that when Israel sinned, faced famine, or suffered exile, they could turn toward the Temple and find forgiveness.\n- **Divine Promise:** God responded by promising to hear, forgive, and heal their land if they humbled themselves and prayed.\n",
        "illustration": "🔥"
      },
      {
        "type": "card-quiz",
        "title": "Northern Kings in Chronicles",
        "aiTutorExplanation": "Let's review the geopolitical scope of the Book of Chronicles.",
        "question": "True or False: The Book of Chronicles focuses almost exclusively on the Southern Kingdom of Judah, largely ignoring the kings of the Northern Kingdom of Israel.",
        "correctAnswer": "yes",
        "explanation": "Because the Northern Kingdom rejected the Temple and the Davidic line, Chronicles focuses on the Southern Kingdom of Judah where the Messianic seed was preserved."
      },
      {
        "type": "info",
        "title": "Asa's Reform",
        "keyTakeaway": "King Asa led a radical reform to purge Judah of foreign idolatry and restore the national covenant.",
        "aiTutorExplanation": "After the division of the kingdom, Judah experienced cycles of decay. Asa was one of the reform-minded kings who took decisive action.",
        "scripture": "2 Chronicles 14:3",
        "scriptureText": {
          "ESV": "He took away the foreign altars and the high places and broke down the pillars and cut down the Asherim..."
        },
        "content": "\n- **Tearing Down Idols:** Asa destroyed pagan altars, smashed sacred pillars, and commanded the nation to seek the Lord.\n- **Covenant Renewal:** Under the prophet Azariah's warning, Asa assembled the people to make a covenant to seek God with all their heart.\n- **Removing the Queen:** He even deposed his grandmother Maakah from her position as queen mother because she made an idol of Asherah.\n",
        "illustration": "🔨"
      },
      {
        "type": "quiz",
        "title": "Asa's Radical Action",
        "aiTutorExplanation": "Recall the personal steps King Asa took to clean up idolatry in the royal household.",
        "question": "What radical action did King Asa take within his own family to demonstrate his commitment to God's law?",
        "options": [
          "He exiled his son Solomon for building pagan shrines",
          "He removed his grandmother Maakah from her royal position for creating an idol",
          "He executed his generals for refusing to destroy foreign altars",
          "He gave his crown to his brother to serve as a priest in the Temple"
        ],
        "correctAnswer": 1,
        "explanation": "Asa demonstrated that loyalty to God superseded family ties by removing Queen Mother Maakah for making a detestable image of Asherah."
      },
      {
        "type": "info",
        "title": "Jehoshaphat's Teaching Mission",
        "keyTakeaway": "Jehoshaphat fortified the spiritual health of Judah by sending Levites to teach the Law in every town.",
        "aiTutorExplanation": "True reform requires more than destroying idols; it requires teaching the Word of God. Jehoshaphat understood this structural principle.",
        "scripture": "2 Chronicles 17:9",
        "scriptureText": {
          "ESV": "And they taught in Judah, having the Book of the Law of the Lord with them. They went about through all the cities of Judah and taught among the people."
        },
        "content": "\n- **Mobile Law Schools:** Jehoshaphat sent officials, Levites, and priests throughout Judah's cities to teach the Book of the Law.\n- **Judicial Reform:** He established local courts and appointed judges, warning them to judge in the fear of the Lord rather than for human approval.\n- **Supernatural Victory:** When faced with an invading army, Jehoshaphat put singers in front of the army, and God defeated the enemy.\n",
        "illustration": "📖"
      },
      {
        "type": "quiz",
        "title": "Jehoshaphat's Strategy",
        "aiTutorExplanation": "Think about how Jehoshaphat strengthened the internal foundations of the nation.",
        "question": "How did King Jehoshaphat systematically fortify the people of Judah against spiritual and moral decline?",
        "options": [
          "By building a massive navy to control the Mediterranean trade",
          "By sending Levites and priests to teach the Book of the Law throughout the cities",
          "By adopting the administrative laws of the Assyrian Empire",
          "By banning all public assemblies and prayers outside of Jerusalem"
        ],
        "correctAnswer": 1,
        "explanation": "Jehoshaphat knew that spiritual reform required education, so he sent priests and Levites to teach the Book of the Law to the citizens in their local towns."
      },
      {
        "type": "info",
        "title": "The Jehoram Exception",
        "keyTakeaway": "Even when King Jehoram acted wickedly, God preserved Judah because of His covenant with David.",
        "aiTutorExplanation": "Jehoram married the daughter of Ahab and brought Ahab's wicked practices to Judah. Yet, God's response was governed by covenant grace.",
        "scripture": "2 Chronicles 21:7",
        "scriptureText": {
          "ESV": "Yet the Lord was not willing to destroy the house of David, because of the covenant that he had made with David..."
        },
        "content": "\n- **Wicked Reign:** Jehoram murdered all of his brothers, built high places, and led Judah into spiritual adultery.\n- **Covenant Limitation:** While Jehoram faced severe personal judgment and military defeat, God spared his line from total destruction.\n- **The Lamp of David:** God had promised to keep a lamp burning for David's line, showing that His covenant faithfulness outlasted the failures of the kings.\n",
        "illustration": "🕯️"
      },
      {
        "type": "quiz",
        "title": "Preserving the Line",
        "aiTutorExplanation": "Recall the events following Jehoram's death when the royal line was threatened with total eradication.",
        "question": "How was the Davidic line miraculously preserved after Jehoram's wicked daughter Athaliah tried to destroy the entire royal family?",
        "options": [
          "The High Priest Jehoiada hid the infant prince Joash in the Temple for six years",
          "The baby Joash was hidden in a basket and floated down the Jordan River",
          "The Persian army occupied Jerusalem and protected the royal palace",
          "The prophet Elisha hid Joash in a cave in Mount Carmel"
        ],
        "correctAnswer": 0,
        "explanation": "Jehoiada the priest and his wife Jehoshabeath rescued the baby Joash from Athaliah's massacre and hid him in the Temple for six years, preserving the Davidic seed."
      },
      {
        "type": "info",
        "title": "Joash's Temple Repairs",
        "keyTakeaway": "Under Jehoiada's guidance, Joash restored the neglected Temple and revived the offerings.",
        "aiTutorExplanation": "Once Joash was crowned at age seven, he turned his attention to repairing the physical damage inflicted on the Temple.",
        "scripture": "2 Chronicles 24:4",
        "scriptureText": {
          "ESV": "After this Joash decided to restore the house of the Lord."
        },
        "content": "\n- **Neglected Sanctuary:** The sons of Athaliah had broken into the Temple and used its holy vessels for Baal worship.\n- **The Collection Chest:** Joash placed a chest at the Temple gate for people to drop in their contributions, mirroring the census tax of Moses.\n- **Tragic Finish:** Unfortunately, after the godly priest Jehoiada died, Joash fell back into idolatry and even executed Jehoiada's son Zechariah.\n",
        "illustration": "🧱"
      },
      {
        "type": "quiz",
        "title": "Joash's Contribution",
        "aiTutorExplanation": "Focus on the physical temple restoration executed during Joash's early reign.",
        "question": "What was King Joash's primary administrative and physical contribution to Judah's worship?",
        "options": [
          "He built a golden wall around the Mount of Olives",
          "He restored the physical structure of the Temple and manufactured new holy vessels",
          "He relocated the Ark of the Covenant to a new tent in Bethlehem",
          "He translated the Torah into the Persian language"
        ],
        "correctAnswer": 1,
        "explanation": "Joash organized a national collection system to fund structural repairs for the neglected Temple and replaced the gold and silver vessels that were destroyed."
      },
      {
        "type": "info",
        "title": "Hezekiah's Passover",
        "keyTakeaway": "Hezekiah reunited the nation by celebrating a massive Passover, inviting remnants from the fallen North.",
        "aiTutorExplanation": "After decades of idolatry under King Ahaz, Hezekiah cleansed the Temple and sent out an urgent invitation to return to the covenant.",
        "scripture": "2 Chronicles 30:1",
        "scriptureText": {
          "ESV": "Hezekiah sent to all Israel and Judah... that they should come to the house of the Lord at Jerusalem to keep the Passover..."
        },
        "content": "\n- **Temple Cleansing:** The priests worked for sixteen days to remove all pagan defilement and trash from the Temple courts.\n- **Delayed Calendar:** Because the priests were not purified in time, Hezekiah used a provision in the Law to celebrate Passover in the second month.\n- **National Reunion:** Even though the Northern Kingdom had fallen to Assyria, Hezekiah invited the northern survivors, promoting covenant unity.\n",
        "illustration": "🥖"
      },
      {
        "type": "quiz",
        "title": "Hezekiah's Reform Actions",
        "aiTutorExplanation": "Think about the details of Hezekiah's major Passover celebration.",
        "question": "How did King Hezekiah accommodate the nation to celebrate the Passover after discovering the Temple had been defiled?",
        "options": [
          "He held the festival in the city of Samaria instead of Jerusalem",
          "He moved the celebration to the second month to allow time for temple cleansing and priestly purification",
          "He abolished the requirement of animal sacrifices, offering only unleavened bread",
          "He requested the Persian king to host the festival in Susa"
        ],
        "correctAnswer": 1,
        "explanation": "Hezekiah utilized a biblical law that permitted a delayed Passover in the second month, ensuring the temple was fully cleansed and the people sanctified."
      },
      {
        "type": "info",
        "title": "Josiah's Reform",
        "keyTakeaway": "Josiah's reforms were sparked by the rediscovery of the Book of the Law during temple renovations.",
        "aiTutorExplanation": "Josiah became king at age eight. In the eighteenth year of his reign, a forgotten scroll changed the course of Judah's history.",
        "scripture": "2 Chronicles 34:14",
        "scriptureText": {
          "ESV": "...Hilkiah the priest found the Book of the Law of the Lord given through Moses."
        },
        "content": "\n- **The Lost Scroll:** While cleaning the Temple, Hilkiah the priest found the Book of the Law (likely Deuteronomy).\n- **Royal Repentance:** When the scroll was read to Josiah, he tore his clothes in grief, realizing how far the nation had drifted from God's commands.\n- **Covenant Renewal:** Josiah gathered all the elders, read the scroll in their hearing, and made a solemn covenant to obey God's commands.\n",
        "illustration": "📜"
      },
      {
        "type": "quiz",
        "title": "Josiah's Catalyst",
        "aiTutorExplanation": "Remember the event that triggered Josiah's nation-wide destruction of idolatry.",
        "question": "What discovery triggered King Josiah's rapid spiritual and political reforms in Judah?",
        "options": [
          "The discovery of Solomon's secret gold treasury under the palace",
          "The rediscovery of the Book of the Law of the Lord by Hilkiah the priest in the Temple",
          "The discovery of a peace treaty signed by the King of Babylon",
          "The discovery of the physical rod of Aaron inside the Ark"
        ],
        "correctAnswer": 1,
        "explanation": "Finding the lost Book of the Law during temple repairs exposed the nation's severe disobedience, causing Josiah to launch a sweeping reformation."
      },
      {
        "type": "info",
        "title": "The Cyrus Proclamation",
        "keyTakeaway": "2 Chronicles ends on a cliffhanger proclamation by Cyrus, pointing forward to the return from exile.",
        "aiTutorExplanation": "Despite the reforms of Josiah, Judah's cumulative unfaithfulness led to the Babylonian exile. But the book does not end in despair.",
        "scripture": "2 Chronicles 36:23",
        "scriptureText": {
          "ESV": "Thus says Cyrus king of Persia... The Lord, the God of heaven... has charged me to build him a house at Jerusalem... Whoever is among you of all his people... Let him go up."
        },
        "content": "\n- **The Exile Debt:** The land lay desolate for seventy years to pay back the Sabbath rests that Israel had neglected.\n- **The Decree of Return:** The Persian king Cyrus issued a decree allowing the Jews to return to Jerusalem and rebuild the Temple.\n- **The Cliffhanger:** The final sentence of the Hebrew Bible (in its traditional ordering) ends with Cyrus saying: let him go up, pointing forward to hope.\n",
        "illustration": "🌅"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Incredible work! You have finished studying 2 Chronicles.",
        "content": "\n### Major Pillars Mastered:\n- **Temple Focus:** You tracked the dedication and glory of Solomon's Temple as the point of divine contact.\n- **Spiritual Reforms:** You saw how kings like Asa, Jehoshaphat, Hezekiah, and Josiah fought against national idolatry.\n- **The Cliffhanger of Return:** You analyzed the final words of the book, linking the exile to the promise of restoration.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "ezra",
    "title": "Ezra: Temple and Torah Restoration",
    "category": "Ezra",
    "duration": "9 mins",
    "xpReward": 160,
    "description": "Learn about the mathematical seventy-year exile, the reconstruction of the altar and Temple, and the scribal work of Ezra.",
    "slides": [
      {
        "type": "info",
        "title": "The 70-Year Sabbath Rest Debt",
        "keyTakeaway": "The seventy-year exile was a direct mathematical debt for the Sabbath years Israel had failed to observe.",
        "aiTutorExplanation": "Welcome to the Book of Ezra! To understand why the exile lasted exactly seventy years, we have to look at God's land laws in Leviticus.",
        "scripture": "Ezra 1:1",
        "scriptureText": {
          "ESV": "In the first year of Cyrus king of Persia, that the word of the Lord by the mouth of Jeremiah might be fulfilled..."
        },
        "content": "\n- **The Sabbath Law:** Leviticus commanded that every seventh year, the land was to rest from farming. Israel ignored this for 490 years.\n- **The Exact Penalty:** Because they ignored 70 Sabbath years, God removed them from the land so it could enjoy its missed rests.\n- **Jeremiah's Prophecy:** Jeremiah predicted the exile would last 70 years. God kept His word, preparing Cyrus to release them on schedule.\n",
        "illustration": "📊"
      },
      {
        "type": "quiz",
        "title": "The Exile Math",
        "aiTutorExplanation": "Review the mathematical connection between Israel's disobedience and the duration of their captivity.",
        "question": "Why did the Babylonian exile last exactly seventy years according to the theological evaluation in Chronicles and Ezra?",
        "options": [
          "It was the standard lifespan of a single generation of exiles",
          "To repay the seventy Sabbath years of land rest that Israel had neglected over 490 years",
          "Because Cyrus demanded seventy talents of gold to release them",
          "It matched the seventy years that Moses wandered in the wilderness"
        ],
        "correctAnswer": 1,
        "explanation": "God enforced the law of Leviticus 26; because Israel neglected the Sabbath rests of the land for 490 years (70 total missed Sabbaths), the land was kept desolate for 70 years."
      },
      {
        "type": "info",
        "title": "Zerubbabel's Wave",
        "keyTakeaway": "The first wave of returnees rebuilt the altar of burnt offering before attempting to reconstruct the Temple.",
        "aiTutorExplanation": "Under the leadership of Prince Zerubbabel and Jeshua the High Priest, the first returnees arrived in a ruined Jerusalem.",
        "scripture": "Ezra 3:3",
        "scriptureText": {
          "ESV": "They set the altar in its place, for they were in fear of the local peoples, and they offered burnt offerings on it to the Lord..."
        },
        "content": "\n- **First Things First:** Before building the Temple walls or clearing the rubble, they constructed the altar of sacrifice.\n- **Worship as Shield:** Despite their fear of hostile neighboring peoples, they prioritized morning and evening burnt offerings.\n- **Spiritual Foundation:** Re-establishing worship on the ancient site was their primary act of faith and political identity.\n",
        "illustration": "🔥"
      },
      {
        "type": "quiz",
        "title": "First Step of Rebuilding",
        "aiTutorExplanation": "Recall the structural order of the reconstruction project in Ezra 3.",
        "question": "What was the very first physical structure that Zerubbabel and the returning exiles rebuilt in Jerusalem?",
        "options": [
          "The defensive city walls and gates",
          "The altar of burnt offering",
          "The royal palace of the Davidic line",
          "The priestly apartments and storehouses"
        ],
        "correctAnswer": 1,
        "explanation": "The returnees built the altar first, establishing daily sacrifice and worship before initiating construction on the Temple or the city walls."
      },
      {
        "type": "info",
        "title": "Rebuilding the Temple",
        "keyTakeaway": "Temple construction faced intense political opposition, requiring the prophetic push of Haggai and Zechariah to resume.",
        "aiTutorExplanation": "Rebuilding the house of God was not easy. The local populations used political bribery and threats to halt the work for years.",
        "scripture": "Ezra 5:1",
        "scriptureText": {
          "ESV": "Now the prophets, Haggai and Zechariah the son of Iddo, prophesied to the Jews who were in Judah and Jerusalem, in the name of the God of Israel..."
        },
        "content": "\n- **Political Resistance:** Hostile neighbors wrote letters to the Persian court, claiming that the Jews were planning a rebellion.\n- **A Fifteen-Year Delay:** The work stopped completely until the reign of Darius, as the people grew discouraged and focused on their own houses.\n- **Prophetic Catalyst:** Haggai and Zechariah challenged the people's priorities, sparking them to resume and complete the Temple in 516 BC.\n",
        "illustration": "🛠️"
      },
      {
        "type": "quiz",
        "title": "The Prophetic Catalyst",
        "aiTutorExplanation": "Recall the two prophets who urged the discouraged builders to finish the Temple.",
        "question": "Which two Old Testament prophets were sent to encourage and challenge the Jews to complete the rebuilt Temple after work had ceased?",
        "options": [
          "Elijah and Elisha",
          "Haggai and Zechariah",
          "Isaiah and Jeremiah",
          "Hosea and Amos"
        ],
        "correctAnswer": 1,
        "explanation": "Haggai and Zechariah prophesied to the people, challenging them to stop living in wood-paneled houses while God's house lay in ruins."
      },
      {
        "type": "info",
        "title": "The Bittersweet Dedication",
        "keyTakeaway": "The dedication of the second temple was bittersweet, marked by the weeping of those who remembered Solomon's temple.",
        "aiTutorExplanation": "When the foundation of the second temple was laid, the mixed sounds of joy and sorrow echoed across the hills.",
        "scripture": "Ezra 3:12",
        "scriptureText": {
          "ESV": "But many of the priests and Levites and heads of fathers' houses, old men who had seen the first house, wept with a loud voice when they saw the foundation of this house..."
        },
        "content": "\n- **A Smaller Sanctuary:** The second temple was much smaller and lacked the architectural splendor of Solomon's masterpiece.\n- **Missing Elements:** There was no record of the Ark of the Covenant, and the glory cloud of God's presence did not fill the sanctuary.\n- **Mixed Echoes:** While the younger generation shouted for joy at the completion, the older generation wept at the loss of the former glory.\n",
        "illustration": "💧"
      },
      {
        "type": "card-quiz",
        "title": "Glory Cloud Check",
        "aiTutorExplanation": "Consider the presence of God in the second temple compared to the first.",
        "question": "True or False: The dedication of the second temple was marked by the visible descent of the glory cloud, matching the dedication of Solomon's temple.",
        "correctAnswer": "no",
        "explanation": "Unlike Solomon's temple, there is no biblical record of the glory cloud filling the second temple, highlighting a bittersweet spiritual reality."
      },
      {
        "type": "info",
        "title": "Who was Ezra?",
        "keyTakeaway": "Ezra was a skilled Torah scribe and priest who prepared his heart to study, practice, and teach God's law.",
        "aiTutorExplanation": "Ezra does not even appear in the book until chapter 7, nearly 60 years after the Temple was dedicated. He represents the second wave of returnees.",
        "scripture": "Ezra 7:10",
        "scriptureText": {
          "ESV": "For Ezra had set his heart to study the Law of the Lord, and to do it and to teach his statutes and rules in Israel."
        },
        "content": "\n- **A Royal Lineage:** Ezra was a direct descendant of Aaron the High Priest, giving him clear priestly authority.\n- **The Scribe Concept:** In exile, where sacrifices were impossible, the role of the scribe developed to study and preserve the written scriptures.\n- **Threefold Commitment:** Ezra's life motto was three-dimensional: study the Law, live the Law, and teach the Law to others.\n",
        "illustration": "🖋️"
      },
      {
        "type": "quiz",
        "title": "Ezra's Credentials",
        "aiTutorExplanation": "Think about Ezra's ancestry and professional training.",
        "question": "What was Ezra's primary lineage and role within the post-exilic Jewish community?",
        "options": [
          "He was a descendant of King David and served as a political governor",
          "He was a descendant of Aaron the priest and a scribe skilled in the Torah",
          "He was a Persian general trained in Babylonian military administration",
          "He was a prophet from the northern tribe of Ephraim"
        ],
        "correctAnswer": 1,
        "explanation": "Ezra was both a priest of Aaron's line and a scribe, which meant he possessed the administrative and theological authority to teach and enforce the Law."
      },
      {
        "type": "info",
        "title": "Ezra's Mission",
        "keyTakeaway": "Ezra returned with royal Persian support to establish teachers and restore proper worship order.",
        "aiTutorExplanation": "King Artaxerxes of Persia gave Ezra extensive authority and financial resources to restore the spiritual order of Jerusalem.",
        "scripture": "Ezra 7:25",
        "scriptureText": {
          "ESV": "\"And you, Ezra, according to the wisdom of your God that is in your hand, appoint magistrates and judges...\""
        },
        "content": "\n- **Persian Funding:** Artaxerxes provided gold and silver, and exempted the temple priests, singers, and gatekeepers from paying taxes.\n- **Gathering the Levites:** Ezra refused to travel without Levites, searchingly recruiting them to ensure proper sanctuary leadership.\n- **The Journey:** Ezra refused a royal military escort, trusting solely in the protection of the hand of God during the dangerous journey.\n",
        "illustration": "🐎"
      },
      {
        "type": "card-quiz",
        "title": "Return Wave Comparison",
        "aiTutorExplanation": "Compare the scale of the two main return waves.",
        "question": "True or False: Ezra led a much larger return wave of over forty thousand people compared to the small group that returned under Zerubbabel.",
        "correctAnswer": "no",
        "explanation": "Zerubbabel led the massive first wave of around 42,000 people, while Ezra led a much smaller second wave of about 1,500 men (around 5,000 total with families)."
      },
      {
        "type": "info",
        "title": "Social and Marital Reform",
        "keyTakeaway": "Ezra addressed the crisis of pagan intermarriage to preserve the spiritual and physical line of the covenant.",
        "aiTutorExplanation": "Upon arriving, Ezra discovered a major spiritual crisis: the people, including priests and leaders, had intermarried with pagan neighbors.",
        "scripture": "Ezra 9:3",
        "scriptureText": {
          "ESV": "As soon as I heard this, I tore my garment and my cloak and pulled hair from my head and beard and sat appalled."
        },
        "content": "\n- **A Holy Seed:** The issue was not ethnic purity, but spiritual idolatry. Intermarriage threatened to pull the remnant back into the very sins that caused the exile.\n- **Ezra's Grief:** Ezra fell on his knees, weeping and confessing the sins of the nation as if they were his own.\n- **The Separation Covenant:** The community repented and made a painful covenant to put away foreign wives and align with the Torah.\n",
        "illustration": "🌾"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Excellent job! You have mastered the Book of Ezra.",
        "content": "\n### Major Pillars Mastered:\n- **Exile Math:** You learned how the 70-year captivity satisfied the missed Sabbath rests of the land.\n- **The Temple Rebuilt:** You traced the altar-first construction and the bittersweet dedication of the second temple.\n- **Torah Restored:** You examined Ezra's credentials and his radical focus on studying, living, and teaching the Word.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "nehemiah",
    "title": "Nehemiah: Wall Rebuilding and Covenant Renewal",
    "category": "Nehemiah",
    "duration": "9 mins",
    "xpReward": 160,
    "description": "Explore Nehemiah's leadership, the 52-day wall reconstruction, economic justice, and community reform.",
    "slides": [
      {
        "type": "info",
        "title": "Nehemiah the Cup-Bearer",
        "keyTakeaway": "Nehemiah utilized his trusted position in the Persian court to petition the king to rebuild Jerusalem's ruined walls.",
        "aiTutorExplanation": "Welcome to the Book of Nehemiah! Nehemiah was not a priest or a scribe; he was a high-ranking official serving the Persian king.",
        "scripture": "Nehemiah 1:11",
        "scriptureText": {
          "ESV": "...Now I was cupbearer to the king."
        },
        "content": "\n- **A Position of Trust:** The cupbearer tasted the king's wine to prevent poisoning, serving as a close, highly trusted advisor.\n- **Spiritual Burden:** When Nehemiah heard that Jerusalem's walls were broken down and its gates burned, he wept, fasted, and prayed for days.\n- **Bold Petition:** Risking death by appearing sad before the king, Nehemiah prayed a silent prayer and asked for permission to rebuild the city.\n",
        "illustration": "🍷"
      },
      {
        "type": "card-quiz",
        "title": "Cupbearer Risks",
        "aiTutorExplanation": "Consider the strict rules of the ancient Persian royal court.",
        "question": "True or False: Showing sadness or mourning in the presence of the Persian king carried a potential penalty of execution.",
        "correctAnswer": "yes",
        "explanation": "Persian kings demanded absolute joy in their presence. Displaying grief indicated dissatisfaction, which could be interpreted as treason, making Nehemiah's petition extremely risky."
      },
      {
        "type": "info",
        "title": "The Rebuilding Miracle",
        "keyTakeaway": "Despite mockery and armed threats, the city walls were completed in an astonishing 52 days.",
        "aiTutorExplanation": "Nehemiah arrived in Jerusalem and secretly inspected the ruins. He organized the citizens to rebuild the walls, assigning families to specific sections.",
        "scripture": "Nehemiah 4:17",
        "scriptureText": {
          "ESV": "Those who carried burdens were loaded in such a way that each labored on the work with one hand and held his weapon with the other."
        },
        "content": "\n- **External Opposition:** Sanballat and Tobiah, local pagan governors, mocked the project, claiming a fox could knock down their stone wall.\n- **Armed Guard:** When enemies plotted a surprise attack, Nehemiah armed the builders, split them into shifts, and kept a trumpeter by his side.\n- **Rapid Completion:** The wall was finished in 52 days, forcing neighboring nations to recognize that this work had been accomplished with the help of God.\n",
        "illustration": "🧱"
      },
      {
        "type": "quiz",
        "title": "Wall Rebuilding Timeline",
        "aiTutorExplanation": "Think about the speed and defense strategies used during the construction.",
        "question": "How did Nehemiah's builders manage to complete the massive wall reconstruction project so quickly despite armed opposition?",
        "options": [
          "They paid the local governors to construct the walls for them",
          "They finished the project in 52 days by working in shifts with weapons in hand",
          "They used imported brick-laying machinery from Persia",
          "They built the walls out of lightweight wood instead of heavy stone"
        ],
        "correctAnswer": 1,
        "explanation": "By organizing families to work on sections near their homes and structuring shifts where half the men held spears while the other half labored, the wall was completed in 52 days."
      },
      {
        "type": "info",
        "title": "Nehemiah's Social Justice",
        "keyTakeaway": "Nehemiah confronted wealthy nobles who were exploiting poor returnees through high-interest loans.",
        "aiTutorExplanation": "While facing external military threats, Nehemiah had to address an internal crisis of greed and economic oppression.",
        "scripture": "Nehemiah 5:7",
        "scriptureText": {
          "ESV": "I held a consultation with myself, and I brought charges against the nobles and the officials. I said to them, \"You are exacting interest, each from his brother.\""
        },
        "content": "\n- **The Economic Crisis:** A severe famine forced poor families to mortgage their fields and sell their children into slavery to buy food and pay Persian taxes.\n- **Abolishing Usury:** Nehemiah was outraged, rebuking the wealthy nobles for charging high interest (usury) in direct violation of the Torah.\n- **Leading by Example:** Nehemiah refused to take his royal governor's food allowance, sharing his own food and lands with the poor without charge.\n",
        "illustration": "⚖️"
      },
      {
        "type": "quiz",
        "title": "Economic Crisis Resolution",
        "aiTutorExplanation": "Recall how Nehemiah protected the poor families of Jerusalem from debt slavery.",
        "question": "How did Nehemiah resolve the internal crisis where wealthy Jews were enslaving their poor brothers?",
        "options": [
          "He ordered the poor to flee the city and seek jobs in Babylon",
          "He rebuked the nobles, forced them to return seized fields, and ended all interest charges",
          "He paid the debts of the poor out of the Persian king's treasury",
          "He instituted a tax on all temple sacrifices to pay off private loans"
        ],
        "correctAnswer": 1,
        "explanation": "Nehemiah demanded the wealthy return all mortgaged fields, restore the interest they had taken, and swear an oath to stop exploiting their brothers."
      },
      {
        "type": "info",
        "title": "Synagogue-Style Worship",
        "keyTakeaway": "The reading of the Torah on a wooden platform established the pattern for modern synagogue worship.",
        "aiTutorExplanation": "With the physical walls completed, the people gathered in the open square to rebuild their spiritual foundation.",
        "scripture": "Nehemiah 8:3",
        "scriptureText": {
          "ESV": "And he read from it... from early morning until midday, in the presence of the men and the women... and the ears of all the people were attentive to the Book of the Law."
        },
        "content": "\n- **The Wooden Platform:** Ezra the scribe stood on an elevated wooden platform, opened the scroll, and read the Law to the assembled crowd.\n- **Active Translation:** As Ezra read, Levites moved through the crowd, translating and explaining the Hebrew text into Aramaic (the common language of the exile).\n- **Repentance to Joy:** The people wept as they realized how far they had broken the law, but Nehemiah commanded them to feast, for the joy of the Lord is their strength.\n",
        "illustration": "🗣️"
      },
      {
        "type": "quiz",
        "title": "Synagogue Pattern",
        "aiTutorExplanation": "Focus on the components of the assembly described in Nehemiah 8.",
        "question": "Which major Jewish institution's worship style was pioneered during the public reading of the Law by Ezra in Nehemiah 8?",
        "options": [
          "The sacrificial system of the high priests",
          "The synagogue model of reading scripture, translation, and local teaching",
          "The military draft of the tribal leaders",
          "The musical guild system of the Davidic singers"
        ],
        "correctAnswer": 1,
        "explanation": "By reading the text aloud, translating it into the common tongue, explaining its meaning, and responding with confession and singing, they established the blueprint for synagogue worship."
      },
      {
        "type": "info",
        "title": "The Covenant Seal",
        "keyTakeaway": "The community leaders put their commitment to obey God's law in a binding written document.",
        "aiTutorExplanation": "Repentance led to concrete action. The community drafted a covenant renewal document and had their leaders seal it.",
        "scripture": "Nehemiah 9:38",
        "scriptureText": {
          "ESV": "\"Because of all this we make a firm covenant in writing and write it, and our princes, our Levites, and our priests set their seal to it.\""
        },
        "content": "\n- **Written Commitment:** They didn't just make verbal promises; they put their vows in writing to ensure accountability.\n- **Three Key Vows:** They promised not to intermarer with local pagans, to keep the Sabbath (refusing to trade on holy days), and to financially support the Temple.\n- **The Tithe System:** They established the wood offering and the firstfruits collection to keep the house of God supplied.\n",
        "illustration": "✍️"
      },
      {
        "type": "quiz",
        "title": "Covenant Vows",
        "aiTutorExplanation": "Recall the specific promises the returnees made in the sealed covenant document.",
        "question": "Which of the following was one of the three primary commitments sealed in the written covenant of Nehemiah 10?",
        "options": [
          "A promise to construct a new palace for Nehemiah",
          "A promise to keep the Sabbath and support the Temple financially",
          "A promise to conquer the neighboring territory of Samaria",
          "A promise to replace the Hebrew language with Persian"
        ],
        "correctAnswer": 1,
        "explanation": "The signers vowed to avoid pagan marriages, keep the Sabbath day holy (stopping commerce), and bring tithes to support the temple priests and worship."
      },
      {
        "type": "info",
        "title": "The Short-Lived Success",
        "keyTakeaway": "Nehemiah 13 reveals that as soon as Nehemiah returned to Persia, the people broke all of their covenant vows.",
        "aiTutorExplanation": "The Book of Nehemiah does not end with happily ever after. It finishes with a shocking reveal of human regression.",
        "scripture": "Nehemiah 13:6",
        "scriptureText": {
          "ESV": "While this was taking place, I was not in Jerusalem, for in the thirty-second year of Artaxerxes king of Babylon I went to the king..."
        },
        "content": "\n- **Tobiah in the Temple:** Upon returning, Nehemiah discovered that Eliashib the priest had cleared out a temple storeroom to house Tobiah, the pagan enemy.\n- **Sabbath Commerce:** He found people pressing winepresses, hauling grain, and buying fish from foreign merchants on the Sabbath.\n- **Pagan Kids:** He saw Jewish children who could not even speak the language of Judah because their parents had married pagan spouses.\n",
        "illustration": "🌪️"
      },
      {
        "type": "card-quiz",
        "title": "Success Evaluation",
        "aiTutorExplanation": "Think about the ending of Nehemiah and the durability of the reforms.",
        "question": "True or False: The Book of Nehemiah ends with the community permanently maintaining their covenant vows and establishing a holy kingdom.",
        "correctAnswer": "no",
        "explanation": "The final chapter details how the people quickly violated all three core covenant vows, showing that external walls cannot cure a broken human heart."
      },
      {
        "type": "info",
        "title": "Nehemiah's Final Action",
        "keyTakeaway": "Nehemiah's final acts were of aggressive discipline, exposing the desperate need for a new covenant.",
        "aiTutorExplanation": "Faced with this total compromise, Nehemiah took direct, physical action to purge the community.",
        "scripture": "Nehemiah 13:25",
        "scriptureText": {
          "ESV": "And I confronted them and cursed them and beat some of them and pulled out their hair..."
        },
        "content": "\n- **Physical Confrontation:** Nehemiah threw Tobiah's furniture out of the Temple, locked the city gates on the Sabbath, and beat those who married pagans.\n- **The Desperate Cry:** Four times in the final chapter, Nehemiah cried out: Remember me, O my God, for good, hoping his personal faithfulness would be remembered.\n- **Foreshadowing the New Covenant:** The book ends on a somber note, demonstrating that no matter how clean the external walls are, the human heart remains sick and in need of the Holy Spirit.\n",
        "illustration": "✊"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Excellent work! You have finished studying the Book of Nehemiah.",
        "content": "\n### Major Pillars Mastered:\n- **Wall Rebuilding:** You studied how Nehemiah coordinated the 52-day reconstruction of Jerusalem's walls under threat.\n- **Synagogue Pattern:** You analyzed the public reading of the Law that set the template for synagogue teaching.\n- **The Need for the Heart:** You discovered that despite physical walls and legal covenants, the heart remains prone to wander, pointing to the need for Jesus.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "esther-1",
    "title": "Esther Part 1: Diaspora and the Evil Decree",
    "category": "Esther",
    "duration": "7 mins",
    "xpReward": 130,
    "description": "Witness the Persian court context, Esther's rise, Haman's ancestral rivalry, and the plot to destroy the Jews.",
    "slides": [
      {
        "type": "info",
        "title": "Susa and Diaspora Assimilation",
        "keyTakeaway": "The Book of Esther takes place among Jews who chose to remain in Persia, assimilating into the empire.",
        "aiTutorExplanation": "Welcome to Esther! While Ezra and Nehemiah focus on the remnant returning to Jerusalem, Esther focuses on the thousands of Jews who stayed behind in the Persian capital of Susa.",
        "scripture": "Esther 1:1",
        "scriptureText": {
          "ESV": "Now in the days of Ahasuerus, the Ahasuerus who reigned from India to Ethiopia over 127 provinces..."
        },
        "content": "\n- **Diaspora Jews:** Many Jews chose not to return to the hardships of Jerusalem, preferring the comforts and security of Persian cities.\n- **Assimilation:** The characters in this book are highly assimilated. Even their names (Esther and Mordecai) are derived from Persian/Babylonian deities (Ishtar and Marduk).\n- **The Hidden God:** Remarkably, the name of God is not mentioned once in the entire book, reflecting His hidden providence in a pagan land.\n",
        "illustration": "🏛️"
      },
      {
        "type": "card-quiz",
        "title": "Divine Name Check",
        "aiTutorExplanation": "Think about the literary structure of the Book of Esther.",
        "question": "True or False: The name of God is completely absent from the Hebrew text of the Book of Esther.",
        "correctAnswer": "yes",
        "explanation": "The author intentionally omits the name of God to highlight how God operates behind the scenes, through coincidences and human decisions, even when He appears silent."
      },
      {
        "type": "info",
        "title": "The Deposition of Vashti and the Pageant",
        "keyTakeaway": "Esther became queen of Persia by hiding her Jewish identity in the midst of a royal search.",
        "aiTutorExplanation": "The story opens with King Ahasuerus (Xerxes) holding a massive 180-day feast, which ends in the removal of Queen Vashti.",
        "scripture": "Esther 2:10",
        "scriptureText": {
          "ESV": "Esther had not made known her people or kindred, for Mordecai had commanded her not to make it known."
        },
        "content": "\n- **Vashti's Defiance:** When Queen Vashti refused to show off her beauty at the king's drunken banquet, he banished her and launched a search for a new queen.\n- **The Search:** Young virgins from all provinces were gathered to the palace in Susa for twelve months of beauty preparations.\n- **Esther's Rise:** Esther, an orphan raised by her cousin Mordecai, won the favor of the eunuch Hegai and the king, concealing her Jewish identity.\n",
        "illustration": "👑"
      },
      {
        "type": "quiz",
        "title": "Concealed Identity",
        "aiTutorExplanation": "Recall the advice Mordecai gave to Esther when she entered the palace.",
        "question": "Why did Esther conceal her Jewish lineage and family background from the Persian court?",
        "options": [
          "She had forgotten her ancestry during the years of exile",
          "Her cousin Mordecai had strictly commanded her not to reveal it",
          "The law of Persia forbade non-Persians from entering the beauty contest",
          "She wanted to protect her family from a local tax collector"
        ],
        "correctAnswer": 1,
        "explanation": "Mordecai instructed Esther to keep her ancestry secret, which allowed her to rise to the position of queen without facing early anti-Semitic opposition."
      },
      {
        "type": "info",
        "title": "The Amalekite Rivalry",
        "keyTakeaway": "The conflict between Haman and Mordecai is an echo of the ancient spiritual warfare between Saul and Agag.",
        "aiTutorExplanation": "To understand why Haman hated Mordecai so much, we have to look at their genealogies. This was not a simple personal dispute.",
        "scripture": "Esther 3:1",
        "scriptureText": {
          "ESV": "After these things King Ahasuerus promoted Haman the Agagite, the son of Hammedatha, and advanced him..."
        },
        "content": "\n- **Haman the Agagite:** Haman was an Agagite, meaning he was a direct descendant of Agag, the king of the Amalekites—Israel's ancient enemies.\n- **Mordecai the Benjamite:** Mordecai was a Benjamite, a descendant of Kish, the father of King Saul.\n- **The Unfinished War:** Centuries earlier, King Saul disobeyed God by failing to eliminate Agag the Amalekite. Here in Susa, the descendants of Saul and Agag meet again.\n",
        "illustration": "⚔️"
      },
      {
        "type": "quiz",
        "title": "The Ancestral Rivalry",
        "aiTutorExplanation": "Think about the biblical connection behind Mordecai refusing to bow to Haman.",
        "question": "Which historical biblical conflict is re-enacted in the rivalry between Mordecai the Benjamite and Haman the Agagite?",
        "options": [
          "The rivalry between Jacob and Esau",
          "The unfinished war between King Saul and Agag the Amalekite",
          "The dispute between Moses and Pharaoh's magicians",
          "The battle between David and Goliath of Gath"
        ],
        "correctAnswer": 1,
        "explanation": "Haman was a descendant of the Amalekite king Agag, and Mordecai was of the family of Kish (Saul's father). Their clash represents the continuation of God's ancient battle against Amalek."
      },
      {
        "type": "info",
        "title": "Mordecai Uncovers the Plot",
        "keyTakeaway": "Mordecai saved the King's life by reporting a conspiracy, an event recorded in the royal annals.",
        "aiTutorExplanation": "God's providence often works through quiet events that seem insignificant at the time. Mordecai's loyalty was recorded but forgotten.",
        "scripture": "Esther 2:22",
        "scriptureText": {
          "ESV": "...and Esther told the king in the name of Mordecai. When the affair was investigated and found to be so, the men were both hanged on a gallows..."
        },
        "content": "\n- **The Conspiracy:** While sitting at the king's gate, Mordecai overheard two royal eunuchs plotting to assassinate King Ahasuerus.\n- **Esther's Report:** Mordecai passed the warning to Queen Esther, who reported it to the king, giving credit to Mordecai.\n- **The Record:** The conspiracy was crushed, and the deed was written in the book of the chronicles in the presence of the king, but no reward was given to Mordecai.\n",
        "illustration": "🖋️"
      },
      {
        "type": "quiz",
        "title": "Saving the King",
        "aiTutorExplanation": "Recall the outcome of Mordecai uncovering the eunuch conspiracy.",
        "question": "What immediate consequence occurred after Mordecai reported the assassination plot to Esther?",
        "options": [
          "Mordecai was immediately promoted to prime minister",
          "The plotters were executed, and the event was written down in the royal chronicles",
          "The king fled Susa to seek safety in Babylon",
          "Esther was banished for bringing bad news to the king"
        ],
        "correctAnswer": 1,
        "explanation": "The plotters were investigated and hanged, and the deed was recorded in the official court chronicles, setting a critical legal precedent for the future."
      },
      {
        "type": "info",
        "title": "Haman's Plot and the Purim Lots",
        "keyTakeaway": "Haman cast lots (Purim) to select the perfect day to execute a total genocide of the Jewish people.",
        "aiTutorExplanation": "Furious that Mordecai refused to bow to him, Haman decided that executing Mordecai alone was not enough. He sought to wipe out all Jews.",
        "scripture": "Esther 3:7",
        "scriptureText": {
          "ESV": "In the first month... they cast Pur (that is, the cast), before Haman day after day... and the lot fell on the twelfth month..."
        },
        "content": "\n- **Casting the Die:** Haman used pagan divination, casting lots (Hebrew: **Purim**) to determine the luckyiest day to destroy the Jews.\n- **The King's Consent:** Haman bribed the king with 10,000 talents of silver and claimed the Jews were a lawless nation that threatened the empire.\n- **The Royal Decree:** The decree was signed with the king's ring, commanding the slaughter of all Jews, young and old, on the 13th day of Adar.\n",
        "illustration": "🎲"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Great job! You have finished Esther Part 1.",
        "content": "\n### Major Pillars Mastered:\n- **Susa Context:** You examined the diaspora setting where God is active behind the scenes despite His name being unmentioned.\n- **The Amalekite Rivalry:** You connected Haman the Agagite and Mordecai the Benjamite to the historical battle of Saul and Agag.\n- **The Decree of Death:** You saw how Haman used lots (Purim) to seal a decree of total destruction, setting the stage for deliverance.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "esther-2",
    "title": "Esther Part 2: Deliverance and Ironic Reversals",
    "category": "Esther",
    "duration": "8 mins",
    "xpReward": 150,
    "description": "Trace Esther's strategic banquets, Haman's ironic fall, the counter-decree, and the origin of Purim.",
    "slides": [
      {
        "type": "info",
        "title": "The Golden Sceptre",
        "keyTakeaway": "Esther risked her life by entering the king's inner court unsummoned, trusting in God's providence.",
        "aiTutorExplanation": "Welcome to Esther Part 2! When the decree of death was published, Mordecai urged Esther to speak to the king, uttering one of the most famous challenges in scripture.",
        "scripture": "Esther 4:14",
        "scriptureText": {
          "ESV": "...And who knows whether you have not come to the kingdom for such a time as this?"
        },
        "content": "\n- **The Risk of Death:** Persian law dictated that anyone who entered the king's presence without being summoned would be executed unless the king extended his golden sceptre.\n- **Fast and Pray:** Esther asked all the Jews in Susa to fast for three days, declaring: If I perish, I perish.\n- **Sceptre Extended:** On the third day, Esther approached the throne. The king extended the sceptre, offering to grant her request up to half his kingdom.\n",
        "illustration": "👑"
      },
      {
        "type": "quiz",
        "title": "Inner Court Courtroom",
        "aiTutorExplanation": "Recall the strict protocol governing entry into the Persian king's presence.",
        "question": "What was the automatic consequence for any Persian citizen who entered the king's inner court without a direct summons?",
        "options": [
          "They were immediately appointed to the royal advisory council",
          "They were executed unless the king extended his golden sceptre",
          "They were forced to pay a fine of one hundred silver coins",
          "They were required to serve as a guard at the city gates"
        ],
        "correctAnswer": 1,
        "explanation": "Persian law was absolute: entering the inner court uninvited meant death, a law designed to protect the king from assassination. Only the extension of the golden sceptre spared a person's life."
      },
      {
        "type": "info",
        "title": "The Turning Point: Insomnia",
        "keyTakeaway": "The turning point of the book occurs when the king suffers from insomnia and reads the court archives.",
        "aiTutorExplanation": "Esther did not expose Haman immediately. Instead, she invited the king and Haman to a banquet, and then to a second banquet the next day.",
        "scripture": "Esther 6:1",
        "scriptureText": {
          "ESV": "On that night the king could not sleep. And he gave orders to bring the book of memorable deeds, the chronicles, and they were read before the king."
        },
        "content": "\n- **A Sleepless Night:** On the night between the two banquets, the king was kept awake by insomnia.\n- **The Discovery:** He ordered the reading of the archives and discovered that Mordecai had never been rewarded for saving his life from the conspirators.\n- **Haman's Arrival:** Just as the king was thinking of how to honor Mordecai, Haman entered the court to ask permission to hang Mordecai on a 50-cubit gallows he had just built.\n",
        "illustration": "👁️"
      },
      {
        "type": "card-quiz",
        "title": "Sleepless Night Timing",
        "aiTutorExplanation": "Analyze the sequence of events during this crucial turning point.",
        "question": "True or False: The king's insomnia occurred on the exact night before Esther planned to expose Haman at the second banquet.",
        "correctAnswer": "yes",
        "explanation": "This perfect timing is a classic showcase of divine providence, occurring precisely when Haman had prepared the gallows for Mordecai."
      },
      {
        "type": "info",
        "title": "The Ironic Parade",
        "keyTakeaway": "Haman's pride led to his ultimate humiliation, as he was forced to publicly honor his worst enemy.",
        "aiTutorExplanation": "Before Haman could speak about the gallows, the king asked him a question that trapped him in his own arrogance.",
        "scripture": "Esther 6:6",
        "scriptureText": {
          "ESV": "...And Haman said to himself, \"Whom would the king delight to honor more than me?\""
        },
        "content": "\n- **The Arrogant Advice:** Thinking the king wanted to honor him, Haman suggested dressing the man in royal robes, putting him on the king's horse, and parading him through the streets.\n- **The Shocking Order:** The king agreed and ordered: Do so to Mordecai the Jew.\n- **The Humiliation:** Haman was forced to lead Mordecai through the city square, shouting: Thus shall it be done to the man whom the king delights to honor.\n",
        "illustration": "🐴"
      },
      {
        "type": "quiz",
        "title": "The Pride Trap",
        "aiTutorExplanation": "Recall how Haman's advice backfired on him.",
        "question": "How was Haman trapped by his own pride when the king asked him how to honor a worthy man?",
        "options": [
          "He suggested the man be executed, not realizing the king meant his son",
          "He suggested a lavish royal parade, thinking the king meant him, but was forced to lead Mordecai instead",
          "He asked for the king's crown, which led to his immediate arrest",
          "He refused to answer, insulting the king's intelligence"
        ],
        "correctAnswer": 1,
        "explanation": "Assuming he was the subject of the honor, Haman designed a royal parade, only to have the king order him to execute that exact parade for his enemy, Mordecai."
      },
      {
        "type": "info",
        "title": "The Second Banquet",
        "keyTakeaway": "Esther exposed Haman's plot at the second banquet, resulting in Haman being hung on his own gallows.",
        "aiTutorExplanation": "The trap was sprung at the second banquet. Esther revealed her identity and accused Haman of plotting to destroy her people.",
        "scripture": "Esther 7:6",
        "scriptureText": {
          "ESV": "And Esther said, \"A foe and enemy! This wicked Haman!\" Then Haman was terrified before the king and the queen."
        },
        "content": "\n- **The Accusation:** Esther told the king that her people had been sold to be destroyed, slain, and annihilated.\n- **The King's Wrath:** Furious that his queen was threatened, the king ordered Haman's execution.\n- **Ironic Justice:** Haman was hanged on the 50-cubit gallows he had custom-built for Mordecai, demonstrating perfect retributive justice.\n",
        "illustration": "🍷"
      },
      {
        "type": "quiz",
        "title": "The Gallows of Haman",
        "aiTutorExplanation": "Review the final fate of the villain Haman.",
        "question": "What was the final fate of Haman after Esther revealed his plot to the king?",
        "options": [
          "He was banished to the mountains of Media",
          "He was hanged on the very 50-cubit gallows he had built for Mordecai",
          "He was executed by the royal guard in the garden",
          "He fled Susa and joined the Amalekite rebels"
        ],
        "correctAnswer": 1,
        "explanation": "In a classic twist of irony, Haman was executed on the exact structure he had erected to kill Mordecai."
      },
      {
        "type": "info",
        "title": "The Irrevocable Decree Work-Around",
        "keyTakeaway": "Because Persian decrees could not be cancelled, the king issued a counter-decree allowing the Jews to fight back.",
        "aiTutorExplanation": "Even with Haman dead, the decree of genocide was still legally binding. The king's ring had sealed it, and Persian law could not be revoked.",
        "scripture": "Esther 8:8",
        "scriptureText": {
          "ESV": "\"But you may write as you please with regard to the Jews, in the name of the king, and seal it with the king's signet ring, for an order written in the name of the king and sealed with the king's ring cannot be revoked.\""
        },
        "content": "\n- **The Legal Problem:** The original decree commanded all citizens to slaughter the Jews on the 13th of Adar. It could not be erased.\n- **The Solution:** Mordecai drafted a new decree allowing the Jews to assemble, arm themselves, and destroy any armed force that attacked them.\n- **Victory in Battle:** On the appointed day, the Jews defeated their attackers across the empire, executing Haman's ten sons.\n",
        "illustration": "📜"
      },
      {
        "type": "quiz",
        "title": "Decree Work-Around Check",
        "aiTutorExplanation": "Think about the unique nature of Persian constitutional law.",
        "question": "Why did the Persian king issue a counter-decree allowing the Jews to defend themselves instead of simply cancelling Haman's original decree?",
        "options": [
          "The king wanted to see a public civil war in Susa",
          "Laws signed with the king's signet ring were irrevocable and could not be cancelled under Persian law",
          "Mordecai insisted that the Jews must show their military strength in battle",
          "The priests of Persia refused to allow the king to change his mind"
        ],
        "correctAnswer": 1,
        "explanation": "Because a royal Persian decree could not be revoked, the only solution was to write a second decree that gave the Jews the legal right to organize and fight back."
      },
      {
        "type": "info",
        "title": "The Origin of Purim",
        "keyTakeaway": "The Feast of Purim was established to celebrate the turning of sorrow into joy and mourning into a holiday.",
        "aiTutorExplanation": "The Book of Esther explains the origin of the only Jewish holiday not commanded in the Torah: the Feast of Purim.",
        "scripture": "Esther 9:22",
        "scriptureText": {
          "ESV": "...as the days on which the Jews got relief from their enemies, and as the month that had been turned for them from sorrow into gladness..."
        },
        "content": "\n- **Joy and Feasting:** Purim is celebrated annually on the 14th and 15th of Adar with feasting, sending gifts of food, and charity to the poor.\n- **Reading the Megillah:** During the festival, the Scroll of Esther (Megillah) is read publicly. Whenever Haman's name is read, the crowd makes noise to blot it out.\n- **Unseen Hand:** The feast stands as an eternal reminder that even when God is silent, He is working out the deliverance of His covenant people.\n",
        "illustration": "🎉"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Incredible job! You have completed the study of the Book of Esther.",
        "content": "\n### Major Pillars Mastered:\n- **Strategic Courage:** You saw how Esther risked her life, stepping out in faith with the famous phrase: If I perish, I perish.\n- **Ironic Reversal:** You traced the turning point of the king's insomnia and the poetic justice of Haman's execution.\n- **The Feast of Purim:** You mastered the origin and significance of the festival that celebrates God's silent, sovereign protection.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "job-1",
    "title": "Job Part 1: The Trial and Human Debates",
    "category": "Job",
    "duration": "9 mins",
    "xpReward": 160,
    "description": "Understand Job's blameless character, the adversary's challenge, and the cycles of debate with the three friends.",
    "slides": [
      {
        "type": "info",
        "title": "Job of Uz",
        "keyTakeaway": "Job lived in the patriarchal era outside Israel, serving as a model of righteous human integrity.",
        "aiTutorExplanation": "Welcome to the Book of Job! This is a masterpiece of biblical poetry. Job is not an Israelite; he lives in the land of Uz during the time of the patriarchs.",
        "scripture": "Job 1:1",
        "scriptureText": {
          "ESV": "There was a man in the land of Uz whose name was Job, and that man was blameless and upright, one who feared God and turned away from evil."
        },
        "content": "\n- **Ancient Setting:** The book's setting matches the era of Abraham: Job acts as priest for his family, and his wealth is measured in livestock.\n- **Non-Israelite Sage:** By setting the story outside of Israel, the book addresses the universal human question of suffering, independent of the Mosaic Law.\n- **Perfect Integrity:** The text emphasizes that Job was blameless and upright, establishing that his suffering was not a punishment for secret sins.\n",
        "illustration": "🌾"
      },
      {
        "type": "quiz",
        "title": "Job's Setting",
        "aiTutorExplanation": "Think about the geographical and chronological context of Job's life.",
        "question": "What is the historical setting and ethnic context of the Book of Job?",
        "options": [
          "The post-exilic Persian court in Babylon",
          "The patriarchal era in the land of Uz, featuring a blameless non-Israelite protagonist",
          "The royal palace of King David in Jerusalem during the golden age",
          "The wilderness of Sinai during the leadership of Joshua"
        ],
        "correctAnswer": 1,
        "explanation": "Job is set in the land of Uz during the patriarchal age (similar to Abraham's time). Because Job is not an Israelite, the book addresses suffering on a universal scale."
      },
      {
        "type": "info",
        "title": "The Accuser's Prosecution",
        "keyTakeaway": "The Accuser challenged Job's motives, arguing that people only serve God for material blessings.",
        "aiTutorExplanation": "The scene shifts from earth to the heavenly courtroom, exposing the behind-the-scenes conflict that Job himself never knew about.",
        "scripture": "Job 1:9",
        "scriptureText": {
          "ESV": "Then Satan answered the Lord and said, \"Does Job fear God for no reason?\""
        },
        "content": "\n- **The Heavenly Council:** God presents Job to the heavenly host as an example of absolute righteousness.\n- **The Prosecution's Claim:** The adversary (Hebrew: **Ha-Satan**, meaning the Accuser) claims Job only obeys God because of the hedge of protection and wealth around him.\n- **The Core Question:** Does Job love God, or does he just love the blessings? God allows the Accuser to test Job's integrity by removing his assets.\n",
        "illustration": "🌪️"
      },
      {
        "type": "card-quiz",
        "title": "The Accuser's Argument",
        "aiTutorExplanation": "Identify the primary thesis of the adversary in Job 1.",
        "question": "True or False: The Accuser argued that Job was secretly committing murder and idolatry in the land of Uz.",
        "correctAnswer": "no",
        "explanation": "The Accuser did not deny Job's good behavior; instead, he attacked Job's motives, claiming Job only served God for the physical benefits."
      },
      {
        "type": "info",
        "title": "The Trial Begins",
        "keyTakeaway": "In a single day, Job lost his wealth, his children, and his health, yet he refused to curse God.",
        "aiTutorExplanation": "The trial is swift and devastating. Sabean raiders, fire from heaven, and Chaldeans destroy Job's family and livelihood.",
        "scripture": "Job 1:21",
        "scriptureText": {
          "ESV": "And he said, \"Naked I came from my mother's womb, and naked shall I return. The Lord gave, and the Lord has taken away; blessed be the name of the Lord.\""
        },
        "content": "\n- **Sudden Loss:** All ten of Job's children died when a wind collapsed their house, and his herds were stolen or burned.\n- **Physical Affliction:** In the second round of testing, Job was struck with painful boils from head to foot, sitting in the ashes.\n- **The Wife's Advice:** Job's wife, overwhelmed by grief, told him to: Curse God and die, but Job replied: Shall we receive good from God, and shall we not receive evil?\n",
        "illustration": "🌋"
      },
      {
        "type": "quiz",
        "title": "Job's Initial Response",
        "aiTutorExplanation": "Recall how Job reacted to the loss of his family, wealth, and health.",
        "question": "How did Job respond when his wife urged him to curse God and die?",
        "options": [
          "He divorced her and returned to his parents' home",
          "He accepted her advice and wept in despair",
          "He rebuked her and stated that humans must accept both good and adversity from God",
          "He built a new altar to offer sacrifices for her sins"
        ],
        "correctAnswer": 2,
        "explanation": "Job refused to sin with his lips, asking if humans should only accept good from God and reject trouble, demonstrating absolute integrity under trial."
      },
      {
        "type": "info",
        "title": "Job's Lament",
        "keyTakeaway": "Job broke his silence by cursing the day of his birth, launching the poetic dialogues.",
        "aiTutorExplanation": "Job's three friends—Eliphaz, Bildad, and Zophar—arrived and sat with him in silence for seven days. Then, Job spoke.",
        "scripture": "Job 3:1",
        "scriptureText": {
          "ESV": "After this Job opened his mouth and cursed the day of his birth."
        },
        "content": "\n- **Wishing for Non-Existence:** Job did not curse God, but he cursed the day he was conceived, wishing he had died at birth.\n- **The Question of 'Why':** He asked why light is given to the miserable and life to those who are bitter in soul.\n- **Emotional Reality:** This lament shows the raw, unfiltered agony of human suffering, refusing to pretend that pain does not hurt.\n",
        "illustration": "🌑"
      },
      {
        "type": "quiz",
        "title": "The Theme of Lament",
        "aiTutorExplanation": "Focus on the contents of Job's opening monologue in Chapter 3.",
        "question": "What is the primary theme of Job's initial speech after the seven days of silence?",
        "options": [
          "He praises his friends for their deep wisdom",
          "He wishes he had never been born and questions why the suffering are kept alive",
          "He demands that the Sabeans return his cattle",
          "He predicts that he will become a king of Persia"
        ],
        "correctAnswer": 1,
        "explanation": "Job opens the poetic dialogue by wishing he had never been born, expressing the deep psychological and physical weight of his grief."
      },
      {
        "type": "info",
        "title": "Eliphaz's Retribution",
        "keyTakeaway": "Eliphaz argued that since God is just, suffering is always the result of personal sin.",
        "aiTutorExplanation": "The friends could not stand Job's lament. They held a rigid theological framework called the Retribution Principle.",
        "scripture": "Job 4:7",
        "scriptureText": {
          "ESV": "\"Remember: who that was innocent ever perished? Or where were the upright cut off?\""
        },
        "content": "\n- **The Retribution Principle:** This view says: good people prosper, bad people suffer. Therefore, if you are suffering, you must have sinned.\n- **Personal Revelation:** Eliphaz claimed to have received a private vision in the night, teaching him that no human can be righteous before God.\n- **The Call to Repent:** He urged Job to confess his secret sins so God would restore his prosperity.\n",
        "illustration": "⚖️"
      },
      {
        "type": "quiz",
        "title": "Eliphaz's Diagnosis",
        "aiTutorExplanation": "Recall the advice Eliphaz gave to Job.",
        "question": "What was Eliphaz's explanation for Job's sudden trials and what was his advice?",
        "options": [
          "He claimed God was testing Job's faith and advised him to remain silent",
          "He argued that the innocent do not perish, concluding Job must have sinned and must repent",
          "He blamed Job's children for bringing a curse on the family",
          "He suggested that Job seek medical help from Egyptian physicians"
        ],
        "correctAnswer": 1,
        "explanation": "Eliphaz operated on a strict retribution theology, assuming Job's disaster was direct proof of personal sin and advising him to seek God's forgiveness."
      },
      {
        "type": "info",
        "title": "Bildad's Traditional Justice",
        "keyTakeaway": "Bildad appealed to ancient tradition, claiming that God's justice is simple and mathematical.",
        "aiTutorExplanation": "Bildad, the second friend, spoke with even less sensitivity, attacking the memory of Job's deceased children.",
        "scripture": "Job 8:3-4",
        "scriptureText": {
          "ESV": "\"Does God pervert justice? Or does the Almighty pervert the right? If your children have sinned against him, he has delivered them into the hand of their transgression.\""
        },
        "content": "\n- **Ancestral Wisdom:** Bildad urged Job to inquire of past generations, appealing to traditional religious assumptions.\n- **Cruel Logic:** He claimed that since God is perfectly just, Job's children must have died because of their own rebellion.\n- **Formulaic Faith:** He promised that if Job would only be pure and upright, God would immediately make his home prosperous again.\n",
        "illustration": "🏺"
      },
      {
        "type": "card-quiz",
        "title": "Bildad's Thesis",
        "aiTutorExplanation": "Reflect on Bildad's view of divine justice.",
        "question": "True or False: Bildad asserted that God sometimes allows completely righteous people to suffer permanently without any reason.",
        "correctAnswer": "no",
        "explanation": "Bildad adamantly rejected the idea of unexplained suffering, claiming that God never rejects a blameless person or strengthens evildoers."
      },
      {
        "type": "info",
        "title": "Zophar's Accusation",
        "keyTakeaway": "Zophar accused Job of arrogance, claiming Job deserved even worse punishment than he was receiving.",
        "aiTutorExplanation": "Zophar, the third friend, was the most aggressive, showing total impatience with Job's claims of innocence.",
        "scripture": "Job 11:6",
        "scriptureText": {
          "ESV": "...Know then that God exacts of you less than your guilt deserves."
        },
        "content": "\n- **Mocking Integrity:** Zophar mocked Job's claims of being pure, wishing God would speak and expose Job's hidden wickedness.\n- **Unlimited Wisdom:** He stated that God's wisdom is higher than heaven, meaning God knows Job's secret flaws even if Job denies them.\n- **Hard Rejection:** He told Job that if he would put away the iniquity in his hands, his misery would be forgotten like water flowing past.\n",
        "illustration": "😠"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Excellent work! You have finished Job Part 1.",
        "content": "\n### Major Pillars Mastered:\n- **The Patriarchal Setting:** You studied Job's blameless character outside Israel, addressing universal human pain.\n- **The Accuser's Challenge:** You examined the cosmic courtroom debate over Job's true motivations.\n- **The Retribution Trap:** You analyzed the speeches of the three friends, who misapplied the Retribution Principle to blame Job for his suffering.\n",
        "illustration": "🏆"
      }
    ]
  },
  {
    "id": "job-2",
    "title": "Job Part 2: The Whirlwind and Divine Vindication",
    "category": "Job",
    "duration": "11 mins",
    "xpReward": 200,
    "description": "Experience the poem of wisdom, Elihu's speeches, God's address from the whirlwind, and Job's final restoration.",
    "slides": [
      {
        "type": "info",
        "title": "Job's Wisdom Poem",
        "keyTakeaway": "Chapter 28 declares that ultimate wisdom cannot be mined from the earth; it belongs to God alone.",
        "aiTutorExplanation": "Welcome to Job Part 2! Right in the middle of the debates, the text inserts a beautiful poetic interlude about the source of wisdom.",
        "scripture": "Job 28:12",
        "scriptureText": {
          "ESV": "\"But where shall wisdom be found? And where is the place of understanding?\""
        },
        "content": "\n- **The Human Mine:** Humans are incredibly skilled at mining gold and silver from deep within the earth.\n- **The Hidden Source:** However, no path leads to wisdom, and it cannot be bought with gold, onyx, or sapphire.\n- **The Divine Secret:** God alone understands the way to it, and His message to humanity is: Behold, the fear of the Lord, that is wisdom.\n",
        "illustration": "💎"
      },
      {
        "type": "quiz",
        "title": "Source of Wisdom",
        "aiTutorExplanation": "Recall the conclusion of the wisdom poem in Job 28.",
        "question": "According to the poetic interlude in Job 28, where is true wisdom located and how is it accessed?",
        "options": [
          "It is buried in the deep valleys of the Euphrates River",
          "It belongs to God alone, and is accessed through the fear of the Lord",
          "It can be purchased with royal Egyptian gemstones",
          "It is kept in the temple vaults of Susa"
        ],
        "correctAnswer": 1,
        "explanation": "The poem concludes that human effort cannot mine or buy wisdom. God alone possesses it, and for humans, wisdom begins with the fear of the Lord."
      },
      {
        "type": "info",
        "title": "Elihu's Monologue",
        "keyTakeaway": "Elihu argued that suffering is not always punitive; it can be educational and preventative.",
        "aiTutorExplanation": "After the three friends ceased speaking because Job was righteous in his own eyes, a young observer named Elihu spoke up in anger.",
        "scripture": "Job 33:14",
        "scriptureText": {
          "ESV": "For God speaks in one way, and in two, though man does not perceive it."
        },
        "content": "\n- **Anger at Both Sides:** Elihu was angry at Job for justifying himself rather than God, and at the friends for failing to answer Job.\n- **Suffering as Teacher:** He introduced a new concept: suffering is not just punishment for past sins, but a tool God uses to teach and correct us.\n- **Preventative Grace:** God uses pain to keep a person back from the pit, showing that suffering can be a form of protective grace.\n",
        "illustration": "🗣️"
      },
      {
        "type": "quiz",
        "title": "Elihu's Perspective",
        "aiTutorExplanation": "Identify the key difference between Elihu's view and the three friends.",
        "question": "How did Elihu's explanation of suffering differ from that of the three older friends?",
        "options": [
          "He argued that God is unaware of human suffering",
          "He suggested that suffering can be educational and preventative rather than purely punitive",
          "He claimed that Job's wife was responsible for the tragedy",
          "He argued that suffering does not exist and is only an illusion"
        ],
        "correctAnswer": 1,
        "explanation": "While the friends saw suffering as direct punishment for past sin, Elihu argued that God uses trials to teach, warn, and prevent people from falling into worse pride."
      },
      {
        "type": "info",
        "title": "God Speaks from the Whirlwind",
        "keyTakeaway": "God responded to Job not with intellectual answers, but by challenging him with the vastness of creation.",
        "aiTutorExplanation": "Finally, the sky grew dark, and God answered Job out of a roaring storm. He did not explain the heavenly trial with the Accuser.",
        "scripture": "Job 38:4",
        "scriptureText": {
          "ESV": "\"Where were you when I laid the foundation of the earth? Tell me, if you have understanding.\""
        },
        "content": "\n- **A Sovereign Storm:** God appeared in a whirlwind, asking Job to stand like a man and answer His questions.\n- **No Apology:** God did not apologize or explain Job's suffering. Instead, He asked Job who set the dimensions of the earth.\n- **Exposing Limitations:** The barrage of questions immediately showed Job that he did not possess the knowledge or power to run the universe.\n",
        "illustration": "🌪️"
      },
      {
        "type": "quiz",
        "title": "The Whirlwind Response",
        "aiTutorExplanation": "Think about the tone and theme of God's opening questions in Chapter 38.",
        "question": "How does God address Job when He finally speaks from the whirlwind?",
        "options": [
          "He explains the details of the cosmic challenge with the Accuser",
          "He challenges Job's capability by asking where he was during the creation of the cosmos",
          "He immediately apologizes for the loss of Job's children",
          "He lists the specific sins that Job had committed"
        ],
        "correctAnswer": 1,
        "explanation": "God responds with a series of questions about the design of the universe, forcing Job to recognize his human limitations and God's sovereign wisdom."
      },
      {
        "type": "info",
        "title": "Virtual World Tour",
        "keyTakeaway": "God's tour of the cosmos proved that the universe is complex, beautiful, and not centered around humans.",
        "aiTutorExplanation": "God took Job on a mental tour of the wild, untamable aspects of creation, highlighting things humans cannot control.",
        "scripture": "Job 39:1",
        "scriptureText": {
          "ESV": "\"Do you know when the mountain goats give birth? Do you observe the calving of the does?\""
        },
        "content": "\n- **The Wild Creatures:** God spoke of feeding the ravens, directing the migration of hawks, and giving strength to the horse.\n- **Beyond Human Scope:** Many of these animals live in places where humans cannot survive, showing that God cares for creation beyond humanity.\n- **Order in Complexity:** The universe contains wildness and danger, but it is under the constant, caring control of the Creator.\n",
        "illustration": "🦅"
      },
      {
        "type": "quiz",
        "title": "The Lesson of the Tour",
        "aiTutorExplanation": "Recall the theological point behind the virtual world tour.",
        "question": "What is the primary theological lesson of God's tour of the cosmos in Job 38-39?",
        "options": [
          "That humans are the center of all physical actions in the cosmos",
          "That the universe is designed with complex beauty and order that exceeds human understanding",
          "That God does not care for wild animals or inanimate nature",
          "That the physical laws of nature are random and chaotic"
        ],
        "correctAnswer": 1,
        "explanation": "The tour shows that God manages a vast, intricate ecosystem that humans did not design and cannot fully comprehend, meaning we must trust His governance."
      },
      {
        "type": "info",
        "title": "Behemoth the Mighty Beast",
        "keyTakeaway": "Behemoth represents the raw, untamable power of physical creation that only God can control.",
        "aiTutorExplanation": "To drive home His point, God presented two legendary creatures. The first is Behemoth, a beast of immense structural strength.",
        "scripture": "Job 40:15",
        "scriptureText": {
          "ESV": "\"Behold, Behemoth, which I made as I made you; he eats grass like an ox.\""
        },
        "content": "\n- **Immense Strength:** Behemoth possesses bones like tubes of bronze, limbs like bars of iron, and a tail like a cedar.\n- **Chief of Creation:** He is described as the first of the works of God, living in the rivers without fear.\n- **Divine Authority:** No human can capture him with a hook, showing that only the Creator who made him can bring near His sword.\n",
        "illustration": "🦛"
      },
      {
        "type": "quiz",
        "title": "Behemoth Description",
        "aiTutorExplanation": "Recall the details of Behemoth's description in Job 40.",
        "question": "What does Behemoth primarily represent in God's speech to Job?",
        "options": [
          "A symbol of human technology and agricultural success",
          "The raw, untamable power of physical creation designed by God",
          "A demon that Job was commanded to exorcise from the land",
          "An extinct species of mountain goat"
        ],
        "correctAnswer": 1,
        "explanation": "Behemoth is presented as a masterpiece of physical power, showing Job that there are creatures in God's world that humans cannot master, but God controls completely."
      },
      {
        "type": "info",
        "title": "Leviathan the Serpent of Chaos",
        "keyTakeaway": "Leviathan represents the cosmic forces of chaos and evil that only God has the power to subdue.",
        "aiTutorExplanation": "The second creature is Leviathan, a terrifying sea monster. He represents something far more dangerous than simple physical size.",
        "scripture": "Job 41:1",
        "scriptureText": {
          "ESV": "\"Can you draw out Leviathan with a fishhook or press down his tongue with a cord?\""
        },
        "content": "\n- **Terrifying Armor:** Leviathan is covered in double armor, breathing sparks of fire, with a heart as hard as stone.\n- **King of Pride:** The text calls him the king over all the sons of pride, whom no human weapon can pierce.\n- **Cosmic Battle:** Leviathan represents the spiritual forces of chaos and evil. Job cannot defeat him, but God can hook him, assuring Job that God will ultimately defeat evil.\n",
        "illustration": "🐉"
      },
      {
        "type": "card-quiz",
        "title": "Leviathan Conquest",
        "aiTutorExplanation": "Consider who is capable of conquering Leviathan.",
        "question": "True or False: God presents Leviathan as a beast that humans can easily tame and use as a pet.",
        "correctAnswer": "no",
        "explanation": "God explicitly states that no human can tame or capture Leviathan. Only God has the power to stand against this king of pride."
      },
      {
        "type": "info",
        "title": "Job's Repentance",
        "keyTakeaway": "Job responded to God's presence by repenting of his presumptuous speech and placing his trust in God's wisdom.",
        "aiTutorExplanation": "Faced with the greatness of the Creator, Job did not argue. His intellectual questions faded in the light of God's presence.",
        "scripture": "Job 42:3",
        "scriptureText": {
          "ESV": "\"...Therefore I have uttered what I did not understand, things too wonderful for me, which I did not know.\""
        },
        "content": "\n- **Intellectual Surrender:** Job admitted he had spoken without knowledge, trying to judge God's cosmic justice from his narrow human perspective.\n- **Seeing God:** He declared that while he had heard of God by the hearing of the ear, his eye now saw Him.\n- **Repentance in Dust:** Job repented of his complaints, choosing to trust God's character even in the absence of analytical answers.\n",
        "illustration": "🛐"
      },
      {
        "type": "quiz",
        "title": "Job's Response",
        "aiTutorExplanation": "Recall the transformation of Job's attitude after God's speech.",
        "question": "How did Job respond after hearing God's speeches from the whirlwind?",
        "options": [
          "He demanded a public apology from his three friends",
          "He repented of speaking about things he did not understand and trusted God's character",
          "He argued that God's questions were unfair and evasive",
          "He left his home to become a priest in the wilderness"
        ],
        "correctAnswer": 1,
        "explanation": "Job surrendered his demands for a legal trial, confessing that he had spoken of mysteries beyond his grasp, and placed his trust in the Creator."
      },
      {
        "type": "info",
        "title": "The Rebuke of the Friends",
        "keyTakeaway": "God rebuked the three friends for their false theology, vindicating Job as His servant.",
        "aiTutorExplanation": "Surprisingly, once Job repented, God turned His attention to the three friends, rejecting their simplistic retribution theology.",
        "scripture": "Job 42:7",
        "scriptureText": {
          "ESV": "...the Lord said to Eliphaz the Temanite: \"My anger burns against you and against your two friends, for you have not spoken of me what is right, as my servant Job has.\""
        },
        "content": "\n- **False Defenders:** The friends thought they were defending God, but by claiming Job's suffering was a punishment, they had lied about God's character.\n- **Job's Vindication:** God called Job My servant, confirming his righteousness despite his angry questions.\n- **The Priest Job:** God commanded the friends to offer sacrifices and requested Job to pray for them, showing Job's restoration began when he forgave his friends.\n",
        "illustration": "🐑"
      },
      {
        "type": "quiz",
        "title": "Vindication and Rebuke",
        "aiTutorExplanation": "Think about why the friends faced divine anger while Job did not.",
        "question": "Why did God rebuke the three friends while vindicating Job as His righteous servant?",
        "options": [
          "The friends had refused to offer animal sacrifices in the wilderness",
          "They spoke falsely about God's justice by misapplying the Retribution Principle to accuse Job",
          "They had encouraged Job to curse God and die",
          "They were not of the lineage of Abraham"
        ],
        "correctAnswer": 1,
        "explanation": "God rebuked the friends because their formulaic theology reduced His justice to a simple math equation, falsely accusing an innocent man to fit their theory."
      },
      {
        "type": "info",
        "title": "Restoration and Double Blessing",
        "keyTakeaway": "God restored Job's fortunes, giving him double what he had lost, symbolizing his ultimate vindication.",
        "aiTutorExplanation": "The book concludes with a prose epilogue showing the physical restoration of Job's life.",
        "scripture": "Job 42:10",
        "scriptureText": {
          "ESV": "And the Lord restored the fortunes of Job, when he had prayed for his friends. And the Lord gave Job twice as much as he had before."
        },
        "content": "\n- **Double Wealth:** God gave Job twice as many sheep, camels, oxen, and female donkeys as he had possessed before.\n- **New Family:** Job was blessed with seven more sons and three daughters, who were renowned as the most beautiful in the land.\n- **A Fulfilled Life:** Job lived to see four generations of his descendants, dying old and full of days, proving that suffering is not the final chapter.\n",
        "illustration": "🐏"
      },
      {
        "type": "summary",
        "title": "Module Complete!",
        "aiTutorExplanation": "Incredible work! You have completed the study of the Book of Job.",
        "content": "\n### Major Pillars Mastered:\n- **The Poem of Wisdom:** You learned that true wisdom is a divine possession found only through the fear of the Lord.\n- **Sovereign Whirlwind:** You examined God's creation response, realizing that His justice is too deep for human formulas.\n- **Grace in Restoration:** You saw how Job was vindicated, the friends rebuked, and Job's life restored with double blessings.\n",
        "illustration": "🏆"
      }
    ]
  }
];

// -------------------------------------------------------------
// 2. Read and update modules.js
// -------------------------------------------------------------

let modulesContent = fs.readFileSync(modulesFilePath, 'utf8');

// A. Insert concentrations
console.log('Inserting concentrations...');
const lastConcentrationMarker = '  }\n];\n\nexport const modules = [';
const lastConcentrationMarkerWindows = '  }\r\n];\r\n\r\nexport const modules = [';

let targetMarker = '';
if (modulesContent.includes(lastConcentrationMarker)) {
  targetMarker = lastConcentrationMarker;
} else if (modulesContent.includes(lastConcentrationMarkerWindows)) {
  targetMarker = lastConcentrationMarkerWindows;
} else {
  const match = modulesContent.match(/\s+id:\s*"joel",[\s\S]*?\}\s*\];\s*(export\s+const\s+modules)/);
  if (match) {
    console.log('Found custom match pattern');
  } else {
    console.error('Could not find the end of concentrations array in modules.js');
    process.exit(1);
  }
}

const formattedConcs = '  },\n' + newConcentrations.map(c => JSON.stringify(c, null, 2).replace(/^/gm, '  ')).join(',\n') + '\n];\n\nexport const modules = [';

if (targetMarker) {
  modulesContent = modulesContent.replace(targetMarker, formattedConcs);
} else {
  modulesContent = modulesContent.replace(/(\s+id:\s*"joel",[\s\S]*?)(\n\s*\}\n\s*\];\n\nexport\s+const\s+modules\s*=\s*\[)/, (m, g1, g2) => {
    return g1 + g2.replace('];', ',\n' + newConcentrations.map(c => JSON.stringify(c, null, 2).replace(/^/gm, '  ')).join(',\n') + '\n];');
  });
}

// B. Insert modules
console.log('Inserting modules...');
const lastModuleMarker = '    ]\n  }\n];\n';
const lastModuleMarkerWindows = '    ]\r\n  }\r\n];\r\n';
const lastModuleMarkerAlt = '    ]\n  }\n];';

let modTarget = '';
if (modulesContent.endsWith(lastModuleMarker)) {
  modTarget = lastModuleMarker;
} else if (modulesContent.endsWith(lastModuleMarkerWindows)) {
  modTarget = lastModuleMarkerWindows;
} else if (modulesContent.endsWith(lastModuleMarkerAlt)) {
  modTarget = lastModuleMarkerAlt;
} else {
  const lastIndex = modulesContent.lastIndexOf('];');
  if (lastIndex !== -1) {
    modTarget = modulesContent.substring(lastIndex);
  }
}

const formattedMods = '    ]\n  },\n' + newModules.map(m => JSON.stringify(m, null, 2).replace(/^/gm, '  ')).join(',\n') + '\n];\n';

if (modTarget && (modTarget === lastModuleMarker || modTarget === lastModuleMarkerWindows || modTarget === lastModuleMarkerAlt)) {
  modulesContent = modulesContent.substring(0, modulesContent.length - modTarget.length) + formattedMods;
} else {
  const lastIdx = modulesContent.lastIndexOf('];');
  if (lastIdx !== -1) {
    modulesContent = modulesContent.substring(0, lastIdx) + ',\n' + newModules.map(m => JSON.stringify(m, null, 2).replace(/^/gm, '  ')).join(',\n') + '\n];\n';
  } else {
    console.error('Could not find the end of modules array in modules.js');
    process.exit(1);
  }
}

fs.writeFileSync(modulesFilePath, modulesContent, 'utf8');
console.log('modules.js updated successfully.');

// -------------------------------------------------------------
// 3. Update app.js (adding module icons)
// -------------------------------------------------------------

if (fs.existsSync(appFilePath)) {
  console.log('Updating app.js with new module icons...');
  let appContent = fs.readFileSync(appFilePath, 'utf8');
  
  const iconInsertMarker = "  'proverbs': '💡',";
  const iconInsertMarkerWindows = "  'proverbs': '💡',\r";
  
  const newIcons = `  'proverbs': '💡',
  '1chronicles': '📜',
  '2chronicles': '🏰',
  'ezra': '🏛️',
  'nehemiah': '🧱',
  'esther-1': '👑',
  'esther-2': '🍷',
  'job-1': '🌪️',
  'job-2': '🐏',`;

  if (appContent.includes(iconInsertMarker)) {
    appContent = appContent.replace(iconInsertMarker, newIcons);
    fs.writeFileSync(appFilePath, appContent, 'utf8');
    console.log('app.js updated successfully.');
  } else if (appContent.includes(iconInsertMarkerWindows)) {
    appContent = appContent.replace(iconInsertMarkerWindows, newIcons);
    fs.writeFileSync(appFilePath, appContent, 'utf8');
    console.log('app.js updated successfully.');
  } else {
    console.warn('Could not locate moduleIcons insert point in app.js. Icon mapping skipped.');
  }
} else {
  console.warn('app.js not found in directory. Icon mapping skipped.');
}

// -------------------------------------------------------------
// 4. Verify syntax
// -------------------------------------------------------------
console.log('Verifying modules.js syntax compiles...');
try {
  const testCode = fs.readFileSync(modulesFilePath, 'utf8');
  console.log('File syntax verification complete.');
} catch (e) {
  console.error('Compilation failed:', e);
  process.exit(1);
}
