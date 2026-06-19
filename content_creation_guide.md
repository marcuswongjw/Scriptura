# Berea Content Creation Guide

This guide explains how to add new courses, concentrations, and interactive study slides to the Berea Bible Study App.

---

## Step 1: Understand the Data Files

All study content is managed in two primary files inside the project directory:
1. `modules.js`: Contains the structural definitions of concentrations and all module/slide content.
2. `app.js`: Contains logic and configuration maps, such as the module icons.

---

## Step 2: Define a Concentration in `modules.js`

At the top of [modules.js](file:///Users/marcus/.gemini/antigravity/scratch/scriptura/modules.js), locate the `concentrations` array. Each concentration represents a course topic grouping:

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

## Step 3: Define a Module in `modules.js`

Under the `modules` array in `modules.js`, add a new module object. Each module is made of metadata and a sequential series of slides:

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
  title: "Berea Card Check",
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

Open [app.js](file:///Users/marcus/.gemini/antigravity/scratch/scriptura/app.js) and locate the `moduleIcons` map near the top. Add your new module ID and its display emoji icon:

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
