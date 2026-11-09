# Celebration Suite v1.5.0 — Intelligent Questionnaires & Planning

## Questionnaire template library
- Adds eight comprehensive starter templates for Universal Event Discovery, Wedding Planning, Wedding Day-of Coordination, Birthday & Social Celebrations, Baby Shower & Gender Reveal, Corporate Events & Retreats, Destination Weddings & Travel, and Holiday Home Decor.
- New planner accounts receive the starter library the first time Questionnaires is opened.
- Templates remain fully editable and deletable after creation. Deleted templates are not recreated automatically.

## Review before publishing
- Planners can start from a template, remove irrelevant questions, add custom questions, and preview the exact client-facing questionnaire before assigning it.
- Assigned questionnaires can be saved as drafts, edited again, previewed, and then published/sent.

## ChatGPT / OpenAI planning automation
- Uses the existing server-side `OPENAI_API_KEY` and the OpenAI Responses API.
- Submitted questionnaire answers can generate a draft planning checklist and milestone timeline.
- AI output is explicitly a draft: it never modifies the live event plan automatically.
- Planners can edit, add, or remove generated tasks and milestones before publishing.
- If OpenAI is unavailable or not configured, Celebration Suite creates a conservative fallback planning draft instead of failing the workflow.
- Optional `OPENAI_QUESTIONNAIRE_MODEL` can override the questionnaire planning model; otherwise the existing `OPENAI_MODEL` is reused.

## Event Workspace integration
- Published questionnaire planning items use the existing editable `workspace_data.checklist` and `workspace_data.timeline` structures.
- Duplicate title/date pairs are skipped when republishing.
- Checklist and timeline items retain their questionnaire source for traceability.

## Safety and privacy
- OpenAI calls remain server-side; the API key is never sent to the browser.
- AI is instructed not to invent bookings, payments, approvals, vendors, contacts, or exact times.
- Unknown dates remain blank and assumptions are shown to the planner for review.