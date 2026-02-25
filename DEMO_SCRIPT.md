# KrishiRakshak — Demo Video Script

**Target Duration:** 4–5 minutes
**Format:** Phone screen recording + voiceover
**Upload:** YouTube (Unlisted)

---

## INTRO (0:00 – 0:30)

**SHOW:** App home screen on phone (green header, 3 feature cards)

**SAY:**
> "Hi, I'm Ghazi Anwer from Team Gwonder."
>
> "I'm presenting KrishiRakshak — an AI-powered safety assistant for India's 200 million farmers."
>
> "Built for Challenge #3: Rural Innovation and Sustainable Systems."
>
> "KrishiRakshak uses AWS Bedrock and Rekognition to bring safety guidance, hazard detection, and job hazard checklists — all in Hindi and English, working completely offline."

**ACTION:** Slowly scroll the home screen to show all 3 feature cards.

---

## PROBLEM (0:30 – 1:00)

**SHOW:** PPT slides 2–3 (briefly, 5 seconds each) or speak over the app

**SAY:**
> "42% of India's workforce is in agriculture — that's over 260 million people."
>
> "Pesticide exposure alone causes over 200,000 poisoning cases every year."
>
> "Farm machinery accidents, heat stroke, and chemical burns are daily risks."
>
> "Most farmers don't have access to safety information in their language — and they're often offline."
>
> "KrishiRakshak solves this with three AI-powered features."

**ACTION:** Transition back to app home screen.

---

## DEMO 1 — Voice Safety Q&A (1:00 – 2:15)

**SAY:** "Let me show you the Voice Q&A feature."

**ACTION:** Tap "Voice Q&A" card on home screen.

### Step 1 — Hindi question (1:05)

**ACTION:** Tap the microphone button.

**SAY (in Hindi):** "कीटनाशक कैसे छिड़कना चाहिए?" _(How should pesticide be sprayed?)_

**SHOW:**
- Transcription appearing in real-time
- "Thinking..." indicator
- AI response appearing in Hindi
- Auto-TTS reading the response aloud

**SAY (voiceover while TTS plays):**
> "The app transcribes my Hindi speech, sends it to AWS Bedrock — Claude Haiku — and returns a detailed safety answer in Hindi."
>
> "It even reads the answer aloud for farmers with limited literacy."

### Step 2 — English question (1:45)

**ACTION:** Tap the language toggle to switch to English.

**ACTION:** Tap microphone and say: "How to work safely in summer heat?"

**SHOW:**
- English response appearing
- Sources and confidence score

**SAY:**
> "I can switch to English — same AI, same quality. The app shows sources and a confidence score for every response."
>
> "Powered by Amazon Bedrock — Claude Haiku. Responses are cached locally so they work offline next time."

**ACTION:** Briefly show a sample question chip being tapped (optional).

---

## DEMO 2 — Hazard Detection (2:15 – 3:15)

**SAY:** "Next — camera-based hazard detection."

**ACTION:** Tap Back, then tap "Hazard Detection" card.

### Step 1 — Capture image (2:20)

**ACTION:** Tap "Take Photo" or "Upload from Gallery."

> **TIP:** Pre-load a photo of farm equipment, a tractor, or pesticide containers on the phone for a clean demo.

**SHOW:**
- Image preview on screen
- Tap "Analyze Hazards"
- "AI analyzing image..." spinner with scanning overlay

**SAY:**
> "I can take a photo or upload one. The app sends the image to Amazon Rekognition for analysis."

### Step 2 — Results (2:45)

**SHOW:**
- Overall risk banner (colored — red/orange/yellow)
- Severity badges: CRITICAL, HIGH, MEDIUM, LOW
- List of detected hazards

**ACTION:** Tap a hazard card to expand it — show the recommendation.

**SAY:**
> "The AI identifies specific hazards — rated by severity from Critical to Low."
>
> "Each hazard has a detailed safety recommendation in both Hindi and English."

**ACTION:** Tap the speaker icon on one hazard card.

**SHOW:** TTS reading the Hindi recommendation.

**SAY:**
> "Farmers can tap the speaker icon to hear the recommendation read aloud."
>
> "Powered by Amazon Rekognition with 22 agricultural hazard patterns."

---

## DEMO 3 — JHA Safety Checklist (3:15 – 3:55)

**SAY:** "Finally — Job Hazard Analysis checklists."

**ACTION:** Tap Back, then tap "Safety Checklist" card.

### Step 1 — Select template (3:20)

**ACTION:** Tap "Pesticide Application Safety" template card.

**SHOW:**
- Bilingual checklist items (English + Hindi)
- PPE badges (Mask, Gloves, Boots)
- Progress bar at 0%

**SAY:**
> "Pre-built safety checklists for common farming tasks. Each step shows the required PPE."

### Step 2 — Check items (3:30)

**ACTION:** Tap checkboxes on 3–4 items in sequence.

**SHOW:**
- Checkboxes animating green with checkmarks
- Progress bar filling smoothly
- Items getting strikethrough

**ACTION:** Tap the speaker icon on one item.

**SHOW:** TTS reading the Hindi step aloud.

**SAY:**
> "Large checkboxes designed for outdoor use. Progress auto-saves — close the app, come back, and it's right where you left off."
>
> "This feature works 100% offline. No internet needed."

---

## PWA Features (3:55 – 4:15)

**SAY:** "KrishiRakshak is a Progressive Web App."

**ACTION:** Show the "Add to Home Screen" banner or browser install prompt.

**SHOW:**
- App icon on phone home screen
- App opening in standalone mode (no browser bar)
- Online/offline indicator in header

**SAY:**
> "Farmers can install it to their home screen — no app store needed."
>
> "The service worker caches everything. Even in areas with no connectivity, the app fully works."

**ACTION:** (Optional) Toggle airplane mode briefly to show offline indicator.

---

## Architecture (4:15 – 4:35)

**SHOW:** Architecture slide (PPT slide 8) or speak over the app

**SAY:**
> "The architecture is simple and cost-effective."
>
> "React PWA connects to API Gateway, which routes to Lambda functions."
>
> "Lambda calls Bedrock for Q&A and Rekognition for image analysis."
>
> "Offline-first: service workers cache API responses, and all checklist data lives in localStorage."
>
> "Total cost: approximately 7 cents per user per month."

---

## CLOSING (4:35 – 5:00)

**SHOW:** App home screen or closing slide

**SAY:**
> "KrishiRakshak can scale to millions of farmers across India."
>
> "It brings maritime-grade safety thinking to agriculture — the world's most dangerous industry."
>
> "Built with AWS Bedrock, Amazon Rekognition, Lambda, and API Gateway."
>
> "Thank you for watching."

**SHOW:** GitHub URL and live demo URL on screen:
```
GitHub: github.com/Sameer786/krishirakshak-ai
Demo:   krishirakshak.vercel.app
```

---

## Recording Tips

1. **Screen recorder:** Use built-in recorder (Android: swipe down → Screen Record; iOS: Control Center)
2. **Orientation:** Portrait mode (the app is mobile-first)
3. **Audio:** Record in a quiet room. Use earbuds with mic if possible
4. **Practice:** Do 2–3 dry runs before the real recording
5. **Pre-load data:**
   - Have a farm equipment photo ready in gallery for Hazard Detection
   - Have the JHA checklist partially filled to show resume feature
   - Ask a question in Voice Q&A beforehand so cache has a response for offline demo
6. **Editing:** Use CapCut (free) or similar to:
   - Add title card at start
   - Add text overlays for AWS service names
   - Trim any pauses or mistakes
   - Add background music (optional, low volume)
7. **Upload:** YouTube as **Unlisted** — share the link in submission
8. **Duration target:** 4:30 – 5:00 (do not exceed 5 minutes)
