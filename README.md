# Exegesis Web

## Project documentation

- [Complete web manual](docs/APPLICATION_GUIDE.md): browser features, reading and
  study workflows, localization, push, caching, media, billing and deployment.
- [Cross-platform documentation and PDF export instructions](../PROJECT_DOCUMENTATION.md).

The original project tooling/setup notes follow.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Web environment

Web push requires `VITE_FIREBASE_VAPID_KEY`, generated under Firebase Console > Project settings > Cloud Messaging > Web Push certificates. The app intentionally does not provide a default for this value.

The Firebase web app and its service worker are fixed to the `exegesis-bd116` project so foreground and background messaging cannot drift onto different projects.

`VITE_API_URL` optionally overrides the backend origin.

When testing the Android app against a local backend, create the ignored
`web/.env.development.local` with `VITE_API_URL=http://localhost:5001` and restart
Vite. Otherwise a production URL in `.env` can send admin replies through Railway
while the phone uses the local server. Shared database messages may still appear,
but the local server's Firebase credentials cannot send pushes for production.
The Support Inbox displays its backend URL and reports push acceptance separately
from saving the message. Configure production credentials separately on Railway.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
# hfm-exegesis-web
