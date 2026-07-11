# Scriptura Content Creation Guide

This guide explains how to add new courses, concentrations, and interactive study slides to the Scriptura Bible Study App.

---

## Step 1: Understand the Data Files

Study content is split for maintainability (the old single `modules.js` was 6k+ lines):

| Path | Purpose |
|------|---------|
| `content/concentrations.js` | Course groupings (`concentrations` array) |
| `content/module-index.js` | Lightweight metadata for all modules (no slides) — used at startup |
| `content/modules/*.js` | Full module + slide data (lazy-loaded when a lesson starts) |
| `modules.js` | Exports `concentrations`, stub `modules[]`, and `ensureModuleLoaded()` |

After editing full content files, refresh the index:

```bash
npm run build:module-index
npm run sync:public
```

App code still imports from `modules.js` — you do not need to change imports when adding content.

Also: `app.js` wires logic; module icons live in constants / UI maps as needed.

### Source of truth vs `public/`

Edit files at the **repo root** (`app.js`, `js/`, `content/`, `modules.js`, `style.css`, …).  
Firebase Hosting serves **`public/`** only. Before deploy (or after editing):

```bash
npm run sync:public
```

CI runs the same sync on merge/PR. Do not hand-edit only under `public/` — changes will be overwritten.

### Card-quiz shape

Always use the `questions` array (legacy top-level `question` / `correctAnswer` is normalized by `npm run normalize:card-quiz`):

```javascript
{
  type: "card-quiz",
  title: "…",
  aiTutorExplanation: "…",
  questions: [
    { question: "…", correctAnswer: "yes", explanation: "…" }
  ]
}
```

---

## Step 2: Define a Concentration

Edit `content/concentrations.js`. Each concentration represents a course topic grouping:

```javascript
export const concentrations = [
  {
    id: "your-concentration-id",       // Unique kebab-case identifier
    title: "Concentration Title",       // Displayed in UI
    description: "Brief description of the course topic.",
    modules: ["module-id-1", "module-id-2"] // Ordered list of module IDs
  }
];
```

---

## Step 3: Define a Module

Add a module object to the right group file under `content/modules/` (or create a new group file and import it from the root `modules.js` barrel). Each module is metadata plus an ordered `slides` array:

```javascript
{
  id: "your-module-id",           // Match the ID in the concentration modules list
  title: "Module Title",
  category: "Category Name",       // Used for display badge
  duration: "15 mins",             // Estimated study time
  xpReward: 150,                   // XP rewarded on completion
  description: "Summary of what this module covers.",
  slides: [
    // Slide objects go here (see Step 4)
  ]
}
```

---

## Step 4: Add Slides

You can mix and match four types of slide objects inside the `slides` array:

### 1. Info Slide (`type: "info"`)
Used to present core teachings, scripture verses, and key takeaways.
```javascript
{
  type: "info",
  title: "Slide Header",
  keyTakeaway: "One-sentence highlighted summary.",
  aiTutorExplanation: "Deeper explanation shown in the slide-up AI Tutor sheet.",
  scripture: "Genesis 1:1", // Optional
  scriptureText: {           // Optional
    ESV: "In the beginning...",
    NIV: "...",
    KJV: "..."
  },
  content: "Use markdown-style double asterisks for **bolding** and double newlines for paragraph breaks.",
  illustration: "📖" // Large emoji icon displayed at the top
}
```

### 2. Yes/No Card Quiz (`type: "card-quiz"`)
Presents a statement where the user immediately taps "Yes" or "No".
```javascript
{
  type: "card-quiz",
  title: "Scriptura Card Check",
  aiTutorExplanation: "Explanation displayed if user opens the tutor.",
  question: "The statement to evaluate.",
  correctAnswer: "yes", // Must be "yes" or "no" (all lowercase)
  explanation: "Explanation shown after the user submits their answer."
}
```

### 3. Multiple Choice Quiz (`type: "quiz"`)
Presents a question with 4 options.
```javascript
{
  type: "quiz",
  title: "Active Recall Check",
  aiTutorExplanation: "Explanation displayed if user opens the tutor.",
  question: "The multiple choice question?",
  options: [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  correctAnswer: 1, // 0-based index of the correct option (1 is Option 2)
  explanation: "Explanation shown after answer submission."
}
```

### 4. Summary Slide (`type: "summary"`)
The final slide of the module, showing completion congratulations.
```javascript
{
  type: "summary",
  title: "Module Complete!",
  aiTutorExplanation: "Congrats message for completing this topic.",
  content: "You've successfully finished this topic! Let's proceed to the next module.",
  illustration: "🏆"
}
```

---

## Step 5: Configure the Module Icon in `app.js`

Open [app.js](file:///Users/marcus/.gemini/antigravity/scratch/Scriptura/app.js) and locate the `moduleIcons` map near the top. Add your new module ID and its display emoji icon:

```javascript
const moduleIcons = {
  'your-module-id': '🌟', // Key must match your-module-id exactly
};
```

---

## Step 6: Deploy Changes

Save your edits and deploy the updated application to Firebase Hosting by running:
```bash
npx -y firebase-tools@latest deploy --only hosting --project scriptura-study-2026
```
