# MoodTrip

MoodTrip is a mood-aware place recommendation system that combines live place discovery with machine-learning ranking, explainable recommendations, group mood handling, and user feedback learning.

**Live application:** [mood-trip-chi.vercel.app](https://mood-trip-chi.vercel.app/)

## What it does

- Converts a selected or written mood into a structured preference profile.
- Finds nearby places using public location and place-data sources.
- Ranks candidates with a distilled neural ranker plus content and contextual-bandit signals.
- Uses 22 ranking features covering mood, place category, distance, rating, crowd fit, group mode, and time context.
- Explains model decisions with Integrated Gradients-style feature attribution.
- Supports group mood blending and explicit **Good Pick / Not For Me** feedback.
- Includes an anonymous Supabase feedback pipeline for cross-user learning when configured.
- Provides a transparent ML evaluation lab instead of presenting synthetic benchmarks as real-user performance.
- Includes an in-app help chat for planner steps, location and map troubleshooting, mood detection, group mode, reviews, feedback, history and privacy. The server-side AI endpoint answers free-form questions from documented product facts; curated local answers remain available during provider outages.

### Help chat

`/api/help` accepts either a server-side `AI_GATEWAY_API_KEY` or a Vercel deployment `VERCEL_OIDC_TOKEN` when OIDC is enabled for this project. Neither credential belongs in browser code. Until one is configured, the chat falls back to its built-in app guidance. The endpoint limits conversation length and output size and applies a per-instance request limit. It does not persist chat history. AI Gateway usage may draw from the Vercel team's credits; review its usage and budget settings before opening the site to substantial public traffic.

## ML architecture

The offline training pipeline compares Random Forest, XGBoost, and MLP ranking models and distills the ensemble into a compact browser-side neural network. The shipped model artifact is loaded by the frontend for low-latency ranking. Controlled synthetic preference simulation is used for pretraining/evaluation when real interaction data is unavailable; the pipeline can fine-tune on explicit real feedback once enough rows are available.

See [ml/MODEL_CARD.md](ml/MODEL_CARD.md) and [ml/README.md](ml/README.md) for model details.

## Tech stack

React 19 · Vite · Motion · Leaflet · JavaScript · Python · scikit-learn · XGBoost · Supabase · Vercel · Vitest · Playwright

## Run locally

```bash
npm ci
npm run dev
```

For production verification:

```bash
npm test
npm run build
npm run test:e2e
```

## Optional shared feedback learning

MoodTrip works without a database using device-local feedback. For anonymous cross-user learning, create the schema in [ml/supabase_schema.sql](ml/supabase_schema.sql) and configure these server-side environment variables:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose the service-role key to browser code. More setup notes are in [ml/SUPABASE.md](ml/SUPABASE.md).

## Training

```bash
python -m pip install -r ml/requirements.txt
python ml/train_moodtrip.py
```

The training script regenerates `ml/model_artifacts.json`. It can optionally consume real anonymous feedback from Supabase or a local JSON export.

## Testing and CI

- Vitest covers ranking/model utilities.
- Playwright covers the recommendation and feedback experience.
- GitHub Actions runs tests, validates the Python training script, builds the production app, and runs browser E2E checks.
- Dependencies are lockfile-backed for reproducible installs.

## Data and limitations

MoodTrip intentionally uses public/open data providers. Place, review, street-imagery, and coverage quality vary by location and cannot guarantee the same worldwide coverage as proprietary map platforms. Current benchmark metrics based on controlled preference simulation should not be interpreted as real-world user satisfaction. Real feedback evaluation is reported separately when sufficient data exists.

## Privacy

Feedback is designed to be anonymous. The application uses generated session/recommendation identifiers rather than requiring an account. Raw feedback should only be written through the server-side API, with database access protected by RLS and server-held credentials.

## Project structure

```
api/                 Vercel serverless APIs
ml/                  training pipeline, model card, schema, artifacts
src/                 React UI and browser-side ranking
tests/               Playwright E2E tests
.github/workflows/   CI and ML retraining workflows
```

## Live demo

The standalone production deployment is available at [mood-trip-chi.vercel.app](https://mood-trip-chi.vercel.app/). It is also linked directly from the [portfolio](https://divyansh-portfolio-pearl.vercel.app/).

---

Built as an ML/data-science portfolio project with emphasis on transparent evaluation, explainability, and practical recommendation-system engineering.
