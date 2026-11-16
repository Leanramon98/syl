# Feature: Family Invitations, RSVP & Admin Management

- **Objective**: Build a complete family-centric wedding invitation system featuring:
  1. Lightweight persistent SQLite backend matching SomosBoda domain model (`GuestGroup`, `WeddingGuest`, RSVP tokens, dietary requirements).
  2. Protected Admin Dashboard (`/admin`) for managing guest groups, tracking RSVP status (attending/declined/pending), viewing dietary restrictions, and copying pre-filled WhatsApp invitation links.
  3. Personalized Invitation Page (`/invitacion/:token`) presenting the luxury animated 3D envelope customized for the family/group, opening to the wedding card and an interactive RSVP confirmation form.
- **Constraints**:
  - Zero-friction deployment: self-contained in Docker with persistent SQLite storage in `./data/wedding.db`.
  - Native Node 22+ `node:sqlite` (no binary compilation required).
  - TypeScript types and JSON contracts compatible with SomosBoda (`marketplace-api`).
  - Mobile-first responsive UI adhering to luxury editorial aesthetic (Cormorant Garamond, Montserrat, gold/cream palette).
  - Clean separation: API server (`server/`), Admin (`src/components/Admin/`), and Family Invitation (`src/components/FamilyInvitation/`).

## Checklist

- [x] Task 1: Create backend server with Node 22 `node:sqlite`, schema migrations, and REST endpoints (`/api/admin/*`, `/api/rsvp/*`).
- [x] Task 2: Configure Vite proxy and local scripts for unified development and production build.
- [x] Task 3: Build Admin Dashboard (`/admin`) with login gate, metrics, guest group CRUD, and WhatsApp link copying.
- [x] Task 4: Build Family Invitation route (`/invitacion/:token`) integrating 3D gatefold envelope with personalized family greeting and RSVP confirmation form.
- [x] Task 5: Update Dockerfile & docker-compose for single-container production deployment with persistent volume.
- [x] Task 6: Test end-to-end flow: admin creates group -> copy WhatsApp link -> open invitation -> submit RSVP -> admin reflects updated metrics and status.

## Evidence & Verification
- **Build verification**: `npm run build` completed cleanly with zero TypeScript / Vite compilation errors.
- **Backend automated test**: Verified `server/db.js` group creation, slug/token generation, public token resolution, RSVP submission, and metrics calculation.
- **Docker**: Single multi-stage container on `node:22-alpine` serving both static assets and API with `./data` volume mount for SQLite persistence.
