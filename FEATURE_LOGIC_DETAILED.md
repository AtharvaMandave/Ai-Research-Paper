# ARPS - Feature Logic & Implementation Details

This document provides a deep dive into the technical implementation and logic behind the key features of the AI Research Paper Studio (ARPS).

---

## 1. AI Paper Generation Engine
**Core Logic:** Multi-step "Chain of Thought" generation with external knowledge retrieval.
**Location:** `ai-engine/main.py` -> `generate_paper` endpoint.

### The 4-Step Process:

#### Step 1: Knowledge Retrieval (Search)
- **Goal:** Prevent hallucinations by grounding the AI in real-world data.
- **Tool:** `duckduckgo-search` (Python library).
- **Logic:**
  1.  The engine takes the user's topic (e.g., "Quantum Computing in Healthcare").
  2.  It constructs a search query: `"{topic} research paper academic"`.
  3.  It fetches the top 6 results, extracting the **Title**, **URL**, and **Snippet**.
  4.  These "Real Sources" are formatted into a context block to be injected into the LLM prompts.

#### Step 2: Structured Outlining
- **Goal:** Ensure the paper follows a logical academic flow before writing content.
- **Model:** Groq (Llama 3.3 70B).
- **Prompt Strategy:** The LLM is asked to return *only* a JSON object containing the Title, Abstract, Keywords, and a list of Sections (Introduction, Methodology, etc.).
- **Fallback:** If JSON parsing fails, a hardcoded template is used to ensure resilience.

#### Step 3: Section-by-Section Generation
- **Goal:** Generate high-quality, human-like content for each section defined in the outline.
- **Context Injection:** The "Real Sources" from Step 1 are inserted into the prompt for *every* section, allowing the AI to cite them naturally (e.g., "As shown in [1]...").
- **Humanization Logic:** A specific set of "Humanization Rules" is appended to every prompt to defeat AI detectors:
  - *Vary sentence length dramatically.*
  - *Avoid AI clichés ("It is important to note", "In conclusion").*
  - *Use active voice and rhetorical questions.*
  - *Include specific numbers/metrics.*

#### Step 4: Reference Compilation
- **Goal:** Create a valid IEEE reference list.
- **Logic:**
  - If real sources were found in Step 1, they are formatted into IEEE style: `[1] "Title," Available: URL, Accessed: 2024.`
  - If no sources were found (offline mode), the AI generates "realistic placeholder" citations but marks them as such.

---

## 2. Professional Plagiarism Checker
**Core Logic:** Real-time web search + Set-based similarity analysis.
**Location:** `ai-engine/main.py` -> `check_plagiarism` endpoint.

### The Algorithm:

1.  **Segmentation:**
    - The input text is split into sentences using regex `(?<=[.!?])\s+`.
    - Only sentences > 30 characters are analyzed to avoid false positives on short phrases.

2.  **Live Search (DuckDuckGo):**
    - The system checks the first 5 sentences (to respect rate limits).
    - For each sentence, it performs an exact phrase search or keyword search on DuckDuckGo.
    - **Rate Limiting:** A `0.3s` delay is enforced between searches to prevent IP bans.

3.  **Similarity Calculation (Word Overlap):**
    - For every search result found, the snippet is compared to the original sentence.
    - **Method:** Set Intersection.
      ```python
      overlap = len(sentence_words & snippet_words) / len(sentence_words)
      ```
    - **Threshold:** If `overlap > 0.4` (40%), the sentence is flagged as plagiarized.

4.  **Scoring:**
    - `Final Score = (Matched Sentences / Total Checked Sentences) * 100`
    - The response includes the specific URL and Title of the source found.

---

## 3. AI Content Detector (Multi-Layer)
**Core Logic:** Hybrid approach combining Statistical Metrics + Pattern Recognition + LLM Evaluation.
**Location:** `ai-engine/main.py` -> `detect_ai_content` endpoint.

### Layer 1: Statistical Metrics (`textstat`)
- **Readability:** AI models often output text in a specific readability range (Flesch Reading Ease 45-65). If the text falls strictly in this range, it's flagged.
- **Sentence Variance:** Humans vary sentence length significantly. AI is consistent.
  - *Logic:* Calculate variance of sentence lengths. If `variance < 20`, it indicates AI uniformity.

### Layer 2: Pattern Recognition (Regex)
- **Transition Words:** AI overuses words like "Furthermore", "Moreover", "In conclusion".
  - *Logic:* Count occurrences. If `> 3` in a short text, it's flagged.
- **Contractions:** AI writes formally ("do not" vs "don't").
  - *Logic:* If text > 500 chars and has *zero* contractions, it's flagged as "Formal AI Style".

### Layer 3: LLM Evaluation
- **The Judge:** The text + the collected statistical indicators are sent to Llama 3.3.
- **Prompt:** "Analyze for unnatural perfection, lack of personal voice, and generic statements."
- **Scoring:**
  ```python
  Final Score = LLM_Probability + (Number_of_Indicators * 8%)
  ```
  This hybrid score is much more accurate than LLM detection alone.

---

## 4. Real-Time Collaboration Engine
**Core Logic:** WebSocket events broadcasting state changes to rooms.
**Location:** `server/index.js` (Backend) & `client/src/components/ResearchEditor.js` (Frontend).

### Architecture:
- **Socket.io Rooms:** Each document is a "room" identified by `documentId`.
- **State Management:** The server maintains a `Map<DocumentId, Set<UserId>>` to track who is where.

### Event Flow:
1.  **Join:** User enters a document -> Client emits `join-document`.
    - Server adds user to room, notifies others (`user-joined`), and sends current user list.
2.  **Edit:** User types -> Client emits `document-update` with the `delta` (change) and `cursorPosition`.
    - Server broadcasts `receive-update` to all *other* sockets in the room.
    - *Note:* The current implementation uses a simple broadcast. For production scaling, this would typically be upgraded to CRDTs (Yjs) to handle conflict resolution automatically, though the current socket broadcast works for basic concurrent editing.
3.  **Cursor Tracking:**
    - Client emits `cursor-move` on every selection change.
    - Server broadcasts `cursor-update` so others see the colored cursor name tag.

---

## 5. Format & Improve Engine
**Core Logic:** Task-specific Prompt Engineering.
**Location:** `ai-engine/main.py` -> `improve_text` endpoint.

### The "Action" Logic:
The endpoint accepts an `action` parameter which maps to a specific, optimized system prompt:

| Action | Logic / Prompt Focus |
| :--- | :--- |
| **grammar** | "Fix errors only, do not change meaning." |
| **academic_tone** | "Rewrite in formal academic tone. Make scholarly." |
| **remove_plagiarism** | "Rewrite to be 100% original. Change structure & vocab." |
| **expand** | "Add details, examples, and explanations." |
| **summarize** | "Condense while preserving key points." |

**Truncation Strategy:**
To prevent context window errors, all text inputs are passed through a `truncate_text()` helper that limits input to ~4000 characters before sending to the LLM.
