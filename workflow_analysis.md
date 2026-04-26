# System Workflow Analysis: Collaboration Platform (CollabCreation)

I have analyzed the current project structure and workflow. Here is a detailed breakdown of what I've understood from the codebase (Django backend and React frontend).

## 1. Core Concept
The platform is a marketplace connecting **Brands** and **Creators**. Brands post projects, and Creators apply for them. Once hired, a "Collaboration" is formed with a secure workflow involving Escrow payments, direct chat, and dispute resolution.

---

## 2. User Roles & Profiles
- **User Types**: Every user is either a `Brand` or a `Creator`.
- **Onboarding**: 
    - Users sign up and must complete their profiles.
    - **Creators**: Provide full name, handle, platform (Instagram/YouTube), followers count, and bio.
    - **Brands**: Provide brand name, website, and primary goal.
    - **Approval**: Profiles are flagged for admin approval before they become fully active.

---

## 3. Project Workflow
1.  **Project Creation**: A Brand creates a `Project` (Title, Description, Budget, Deadline, Skills).
2.  **Browsing**: Creators browse the `ProjectList` to find relevant work.
3.  **Application**: Creators submit an `Application` with a pitch.
4.  **Hiring**: The Brand reviews applications and hires a Creator.
5.  **Collaboration (Mutual Workspace)**: 
    - Hiring creates a `Collaboration` instance.
    - This opens a shared workspace (`MutualPage`).
    - Both parties can chat directly.
    - A deadline timer tracks the remaining time for the project.

---

## 4. Financial & Payment Workflow (Escrow)
- **Brand Wallet**: Brands can add funds (mockup shows Razorpay, PayPal, Stripe).
- **Escrow**: When a project starts, the budget is held in Escrow (to protect both parties).
- **Payment Release**: Once the project is complete, the Brand "Releases" the payment to the Creator's wallet.
- **Creator Wallet**: Creators can withdraw their earned balance.

---

## 5. Conflict & Resolution
- **Disputes**: If a deadline is missed or quality is poor, either party can raise a `Dispute`.
- **Resolution**: Disputes involve evidence uploads and messages, which are likely reviewed by an admin or settled within the platform.
- **Ratings**: Upon completion, both parties rate each other, contributing to their global `average_rating`.

---

## 6. Technical Architecture
- **Backend (Django)**: 
    - Apps: `accounts` (auth/profiles), `chat` (messaging), `creator_profiles` (legacy or shared logic), `disputes` (resolution).
    - Database: Currently SQLite (`db.sqlite3`), with plans to migrate to **Supabase** (PostgreSQL).
- **Frontend (React/Vite)**: 
    - Styling: Glassmorphism/Modern UI (`index.css`, `App.css`).
    - Routing: `react-router-dom` with pages for Dashboard, Wallet, Chat, and Collaboration.
    - API: Centralized in `frontend/src/utils/api.js`.

---

## 7. Current Limitations & Areas for Improvement
- **Static Content**: Some parts (like Wallet) currently use hardcoded data.
- **Onboarding Logic**: Needs to be more robust (currently relies on simple role checks).
- **Real-time Chat**: Likely needs WebSocket integration (Django Channels) for better performance.
- **Mobile Responsiveness**: The UI is modern but needs thorough testing across devices.

---

### Next Steps:
1.  **Database Migration**: Finalize the Supabase connection.
2.  **Backend Refactoring**: Consolidate model logic and implement proper API endpoints for all workflows.
3.  **Frontend Polish**: Recreate the format with "proper functioning" (connecting the mockups to the real backend data).
