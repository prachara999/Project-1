# Forest Guardian: Wildwood Rescue — Beginner Guide

**Course:** CIS045-3 Distributed Service Architectures. **Language:** HTML, CSS, JavaScript and PHP.

## 1. What you need

- Windows computer with XAMPP (Apache and PHP). **MySQL is NOT needed** in this version.
- Chrome, Edge or Firefox.
- Internet access to load the required live University Fish Game API puzzle.
- VS Code (optional, for reading and changing code).

## 2. Install (Windows / XAMPP)

1. Install XAMPP from https://www.apachefriends.org/ .
2. Open XAMPP Control Panel and press **Start** next to **Apache**. You do not need to start MySQL.
3. Extract this ZIP. Copy the **FishQuest_Complete** folder into `C:\xampp\htdocs\`.
4. In your browser, open **http://localhost/FishQuest_Complete/** (do not double-click `index.php`).
5. Select an avatar, enter a username (3–20 letters/numbers/underscores) and a password (at least six characters), then select **Create account**.
6. Click **Explore the Woods**. Move with arrow keys or WASD. Gather glowing seeds, avoid thorny brambles, and collect 12 seeds before time runs out.
7. When you win, select **Solve API challenge**. The Forest Guardian story uses the required live Fish Game API puzzle: count the fish and chests in its image and submit your answer. A correct answer starts Level 2 automatically.
8. Explore Elderwood in Level 2: trees grow denser as the adventure continues. Your best score and recent results are saved to `data/players.json` on the local PHP server.
9. Sign out, then sign in with the same account to demonstrate a persistent virtual identity.

**Troubleshooting:** If `localhost` does not load, start Apache. If PHP source appears in the browser, you are not using a PHP server. If the API challenge fails, check your internet, PHP SSL certificates and the university API availability. Do not disable SSL certificate verification. If you move the project folder, use the new URL. If login fails, verify that `data/players.json` is writable by PHP.

## 3. Understanding each file

| File | Beginner explanation |
|---|---|
| `index.php` | The HTML structure: login, menu, game canvas and API challenge screens. |
| `assets/style.css` | Controls colors, layout, mobile responsiveness and buttons. |
| `js/main.js` | Handles user actions and switches between screens. |
| `js/game.js` | Handles forest guardian movement, seed collection, bramble collisions, timer, scoring, and woodland drawing. |
| `js/api.js` | Sends asynchronous HTTP requests to PHP and reads JSON responses. |
| `server/common.php` | Shared server helpers, sessions and JSON-file storage. |
| `server/auth.php` | Registration, login, logout, password hashing and session cookies. |
| `server/score.php` | Saves and reads game results. |
| `server/fish-api.php` | Calls the required Fish Game API and checks answers; this API integration is retained beneath the new forest theme. |
| `data/players.json` | Local storage for registered players and scores; never publish it. |

## 4. The four assessment themes

1. **Low coupling / high cohesion:** `js/game.js` only implements gameplay; `js/api.js` only handles HTTP requests; `js/main.js` handles UI events; server files handle their own backend responsibilities. Explain why this is easier to change than one huge HTML file.
2. **Event-driven programming:** `addEventListener('keydown', ...)` in `main.js` reacts to keys; button click handlers start levels; `requestAnimationFrame` in `game.js` updates movement; seed and bramble collisions trigger score and health changes.
3. **Interoperability:** Browser JavaScript calls your PHP endpoint with `fetch`; `server/fish-api.php` contacts `https://marcconrad.com/uob/fish/api.php?out=json` over HTTPS and parses JSON. The question image comes from the API. The server retains the answer instead of exposing it in the browser.
4. **Virtual identity:** `auth.php` hashes passwords with `password_hash`, checks with `password_verify`, creates a PHP session cookie (HTTP-only), and regenerates the session ID on login. State-changing requests use a CSRF token. Sign out and sign back in to show saved identity.

## 5. Testing checklist

- [ ] Create an account; check duplicate usernames are rejected.
- [ ] Sign out; check wrong password is rejected; sign in correctly.
- [ ] Use keyboard and mobile controls; test pause (`P`).
- [ ] Collect glowing seeds; check score increases by 10 per seed.
- [ ] Hit a thorny bramble; check lives decrease and temporary invulnerability works.
- [ ] Win Level 1; confirm score is saved.
- [ ] Solve a **live** Fish Game API question; confirm Level 2 starts automatically.
- [ ] Play Level 2; confirm faster brambles, a larger seed target, and trees appearing over time.
- [ ] Refresh browser; check saved best score and level unlock.
- [ ] Temporarily disconnect internet; confirm API shows a clear error.

## 6. Academic integrity and video

The assessment permits AI-generated code but requires you to acknowledge it and explain the code yourself. This project was generated with help from **OpenAI ChatGPT (GPT-6), November 2026**, and was based on a user-supplied earlier `game1.zip` prototype. The external puzzle service is the **Fish Game API** by Marc Conrad, University of Bedfordshire: https://marcconrad.com/uob/fish/doc.php . Include these acknowledgements when submitting; describe which portions you personally changed. Do not claim you wrote code you did not write.

Your authentic video must be **no more than 10 minutes** and use your own voice. Suggested plan: demonstration (1–2 minutes); architecture and cohesion/coupling (2 minutes); events (2 minutes); API interoperability (2 minutes); identity/security and alternatives (2 minutes). Compare at least one alternative for each theme. Record the video yourself; do not use AI to produce it.

The assignment also requires evidence that you presented your work to the tutor by Week 8 or earlier. **Submission deadline in the uploaded brief: 4 December 2026 before 10 a.m.** Verify any changes on BREO.

## 7. Limitations (explain these in your video)

- The project uses a JSON file instead of MySQL for easier beginner installation. It is a **local learning prototype**, not a production web service.
- Game scores are sent from the browser and could be falsified by a technical user; production games should validate results server-side.
- Local HTTP is appropriate for development only; deploy with HTTPS to protect passwords in transit.
- The live API is a third-party dependency; it needs internet and may sometimes be unavailable.
- The code must be personally tested on your own Windows/XAMPP setup before submission.

## 8. Alternative for users with PHP already installed

From inside the project directory, run `php -S localhost:8000 router.php`, then open `http://localhost:8000/`. This optional command is for development; use XAMPP if you are a beginner. Never upload the `data` folder to a public server without proper access controls.

## 9. Original files

The user's original HTML prototype is preserved in `docs/original_prototype/` for comparison only. The working application entry point is **`index.php`**, not those old HTML files. The original empty PHP files were replaced with the new server modules. The current Forest Guardian theme is a customization; the live Fish Game API puzzle remains in place for the assignment's interoperability requirement.
