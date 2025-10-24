# Landscape Ecology Socratic Tutor

Multi-user educational platform for teaching Landscape Ecology concepts through AI-powered Socratic dialogue.

## 🚀 Production Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Railway
- **Database**: PostgreSQL on Railway

## Features

- 🔐 **Authentication System** - Student and Professor roles
- 📚 **Assignment Management** - Professors create and manage assignments
- 💬 **AI Tutoring** - Gemini-powered Socratic chat progression
- 📊 **Progress Tracking** - 4-stage learning progression (Comprehension → Evidence → Analysis → Advanced)
- ✅ **Grading System** - Professors grade student chat transcripts

## Local Development

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete production deployment instructions.
