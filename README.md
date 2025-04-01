# Transly

Transly is an advanced audio transcription and translation service powered by OpenAI's Whisper (utilizing whisper cpp for transcription). It offers real-time conversion of audio and video files into text with high accuracy, supporting multiple languages and various export formats.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Local Development](#local-development)
- [Running the Project](#running-the-project)

## Overview
Transly provides:
- AI-powered transcription using OpenAI’s Whisper (utilizing whisper cpp for transcription).
- A modern frontend built with React and Vite.
- A robust backend using Express, Prisma, and PostgreSQL.
- A clean UI with custom components and Tailwind CSS.

## Features
- **Accurate Transcriptions:** Generate precise text from audio and video files.
- **Easy Export:** Download transcripts in various formats DOCX, TXT , SRT.
- **User Management:** Secure registration and login with JWT tokens.
- **Responsive Design:** Mobile-first and fully responsive UI.

## Architecture
- **Frontend:** React (using Vite), React Router, custom UI components from Shadcn.
- **Backend:** Express API with Prisma ORM connecting to a PostgreSQL database.
- **File Upload & Processing:** Multer is used for file uploads, and Whisper handles transcription.

## Local Development

### Prerequisites
- Node.js (>= 14)
- Docker
- Git

### Clone the Repository

```bash
git clone https://github.com/HarshitVashisht/Transly.git
cd Transly
```

### Frontend Setup (located in `\client`)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with the following content:
   ```
   VITE_API_URL=http://localhost:3001
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup (located in `\backend`)

1. Start the backend using Docker Compose:
   ```bash
   docker-compose up
   ```
2. For first-time setup, run Prisma migrations:
   ```bash
   docker exec npx prisma migrate dev
   ```

## Running the Project
- Access the client at [http://localhost:3000](http://localhost:3000).
- The backend API runs on [http://localhost:3001](http://localhost:3001).


