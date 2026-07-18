# Campus Connect

A student/faculty opportunities module: register, browse, post, and share internships, hackathons, and events straight to X or Instagram.

## Pages

```
post-section/
├── index.html            Post an opportunity (form + live preview)
├── register.html          Student / faculty registration
├── login.html              Login (PRN + password)
├── project-panel.html      Browse, search, filter & share opportunities
├── style.css
├── script.js                index.html logic
├── auth.js                  register.html + login.html logic
├── project-panel.js         project-panel.html logic
└── backend/
    ├── schema.sql            Run first — creates `users` and `opportunities`
    ├── db.php                 Set your MySQL credentials here
    ├── register.php            Creates an account (PRN must be unique)
    ├── login.php                Verifies PRN + password, starts a session
    ├── submit_post.php          Inserts a new opportunity as "Pending"
    └── list_opportunities.php   Returns approved opportunities as JSON
```

## Setup

1. **Database** — import the schema:
   ```
   mysql -u root -p < backend/schema.sql
   ```
2. **Credentials** — open `backend/db.php` and set `$DB_HOST`, `$DB_NAME`, `$DB_USER`, `$DB_PASS`.
3. **Uploads folder** — `backend/uploads/` is created automatically the first time someone attaches a poster/PDF.
4. **Serve it** — place the folder on a PHP-enabled server (XAMPP/WAMP/LAMP) and open the pages through it (not by double-clicking the file), so the relative backend fetch calls resolve.

## How the pieces connect

- **Registration** (`register.php`) stores `full_name`, `prn` (unique), a hashed password, and `role` (student/faculty) in `users`.
- **Login** (`login.php`) checks the PRN + password and starts a PHP session.
- **Posting** (`submit_post.php`) inserts a new row into `opportunities` with `status = 'Pending'`.
- **Admin approval** (not built yet, but the table is ready for it):
  ```sql
  SELECT * FROM opportunities WHERE status = 'Pending' ORDER BY created_at DESC;
  UPDATE opportunities SET status = 'Approved', reviewed_at = NOW() WHERE id = ?;
  ```
- **Project panel** (`list_opportunities.php`) only returns rows where `status = 'Approved'`, so nothing unreviewed shows up publicly. Each card has an **Apply** button (the registration link) and two share buttons:
  - **X** opens a pre-filled tweet intent with the title, category, and link.
  - **Instagram** has no public web intent for posting, so the button copies a ready-made caption to the clipboard and opens instagram.com — the user pastes it into their own post or story.

## Design notes

- Typography: Space Grotesk for headings/logo, Inter for body text, IBM Plex Mono for meta data (PRNs, deadlines, categories) — gives the form fields an "official record" feel appropriate for a college system.
- The project panel cards and the live preview on the post page intentionally share the same visual language, so an opportunity looks the same whether you're about to submit it or already browsing it live.
- Before hooking this into a full admin system, note that `login.php` starts a session but no page currently checks that session — add a simple `session_start()` + redirect guard at the top of `index.html`'s PHP equivalent (or an API check) if you want posting restricted to logged-in users only.
