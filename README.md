# Elevatr: Swipeable Elevator Pitch Video Platform

Elevatr is a full-stack web app where startups and applicants upload short elevator pitch videos — then swipe through each other like Tinder, but with a purpose. Applicants can browse and react to startups, and startups can do the same in return. Think TikTok meets job fairs, powered by real-time matching and bite-sized videos.

The platform is powered by Firebase, Google Cloud Platform, FFmpeg, Cloud Run, Docker, and Next.js — everything runs serverlessly for maximum scalability. Built and deployed using a **Mac** environment in the **`us-east1`** GCP region.

Try the website here: https://elevatr-web-client-799609004854.us-east1.run.app/

## 🚀 Built With

<p align="left">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=000" alt="Firebase"/></a>
  <a href="https://cloud.google.com/run"><img src="https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" alt="Google Cloud Run"/></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/></a>
  <a href="https://ffmpeg.org/"><img src="https://img.shields.io/badge/FFmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" alt="FFmpeg"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
</p>

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend Setup (Video Processing Service)](#backend-setup-video-processing-service)
- [Frontend Setup (Next.js)](#frontend-setup-nextjs)
- [Firebase Functions](#firebase-functions)
- [Cloud Storage & Pub/Sub](#cloud-storage--pubsub)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features
- Google Auth login
- Upload videos to GCS with signed URLs
- Trigger FFmpeg-based processing via Cloud Pub/Sub
- Store metadata in Firestore
- Serve and display video list + watch pages

---

## Tech Stack
- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **Backend**: Node.js, Express, Firebase Functions, FFmpeg
- **Infra**: Docker, Google Cloud Run, Pub/Sub, Cloud Storage, Firestore
- **Auth**: Firebase Auth (Google sign-in)

---

## Project Structure

<pre>
.
├── elevatr-api-service/     # Firebase Cloud Functions (v2)
├── elevatr-web-client/      # Next.js App
├── elevatr-video-service/   # Express + FFmpeg + GCP SDK
└── utils/                   # CORS config, etc
</pre>

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`)
- VS Code (recommended)
- Firebase project created at [Firebase Console](https://console.firebase.google.com)

### Optional

- Thunder Client (VS Code extension for API testing)

---

## Backend Setup (Video Processing Service)

1. **Install Dependencies**:

```bash
cd elevatr-video-service
npm install
```
2. **Install FFmpeg** (on Mac using Homebrew):
```bash
brew install ffmpeg
```
3. Test Locally:
```bash
npm run start
```
4. Dockerize:

- Add Dockerfile and .dockerignore

- Build image:
```bash
docker build --platform linux/amd64 -t elevatr-video-service .
```
---
## Cloud Storage & Pub/Sub

1. **Create Buckets:**:

```bash
gsutil mb -l us-east1 --pap=enforced gs://elevatr-raw-videos
gsutil mb -l us-east1 gs://elevatr-processed-videos
```
2. **Configure Notification:**:
```bash
gsutil notification create -t elevatr-topic -f json -e OBJECT_FINALIZE gs://elevatr-raw-videos
```
3. Create Pub/Sub Topic + Subscription:
```bash
gcloud pubsub topics create elevatr-topic
gcloud pubsub subscriptions create elevatr-subscription --topic=elevatr-topic --push-endpoint=YOUR_CLOUD_RUN_URL
```
---
## Firebase Functions

1. **Init Functions:**:

```bash
mkdir elevatr-api-service && cd elevatr-api-service
firebase init functions
```
2. **Install & Write Functions:**:
```bash
npm install firebase-functions@latest firebase-admin@latest @google-cloud/storage
```
3. Deploy:
```bash
firebase deploy --only functions
```
4. Functions Created:

- createUser: Firestore user creation on auth

- generateUploadUrl: Creates signed upload URL

- getVideos: Retrieves list of processed videos

---
## Frontend Setup (Next.js)

1. **Create App:**:

```bash
mkdir elevatr-api-service && cd elevatr-api-service
firebase init functions
```
2. **Add Firebase SDK:**:
```bash
npm install firebase
```
3. Pages Created:

- /: Home with video thumbnails

- /watch?v=...: Watch page with embedded video


4. Components:

- Navbar (with Google Sign In)

- Upload Button (uses signed URLs)

5. Firebase Auth + Firestore Setup

- Enable Google Sign-in in Firebase Console

- Create Firestore DB in production mode

---

## Deployment

1. Artifact Registry + Build:

```bash
gcloud artifacts repositories create elevatr-video-repo --repository-format=docker --location=us-east1

docker build --platform linux/amd64 -t us-east1-docker.pkg.dev/<PROJECT_ID>/elevatr-video-repo/elevatr-video-service .

docker push us-east1-docker.pkg.dev/<PROJECT_ID>/elevatr-video-repo/elevatr-video-service
```

2. Deploy to Cloud Run:

```bash
gcloud run deploy elevatr-video-service \
  --image us-east1-docker.pkg.dev/<PROJECT_ID>/elevatr-video-repo/elevatr-video-service \
  --region=us-east1 \
  --platform managed \
  --timeout=3600 \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=1 \
  --ingress=internal
```

Please reach out regarding these commands, there are 2 different names for elevatr-video-repo/elevatr-video-service

3. Assign Roles

- Grant Storage Object Admin + Service Account Token Creator to Cloud Function SA

- run.invoker for generateUploadUrl

---

## Troubleshooting 

- CORS Errors: Run GCS CORS config command with utils/gcs-cors.json
- Firebase deploy fails: Delete node_modules & retry npm install
- Signed URL issues: Check IAM permissions for functions
- Slow processing: Pub/Sub may re-deliver messages, add idempotency using Firestore status field

---

## References

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [FFmpeg Docs](https://ffmpeg.org/documentation.html)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

## License

Will work on this
