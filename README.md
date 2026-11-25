# Khatwa Code (خطوة كود) website

Formerly "CodePath Academy". Renamed in November 2026 to avoid confusion with the US nonprofit CodePath (codepath.org). The repository name and GitHub Pages URL still say `codepath-academy`; rename the repository later if you want the URL to match.

A static, bilingual (Arabic RTL / English LTR) single-page website. The globe button in the header switches language and remembers the choice. No build step and no framework: one `index.html` file with inline CSS and JavaScript, plus `og-image.png` for social sharing.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole site: header, hero, instructor, courses, learning path, why us, student projects, FAQ, contact form, footer. |
| `brand/` | Logo and app icon (SVG and PNG, dark, light and transparent versions). |
| `og-image.png` | 1200×630 image shown when the link is shared on WhatsApp, X, LinkedIn, etc. |
| `admin.html` | Password-protected dashboard to read and manage registrations from the Google Sheet. |
| `google-apps-script.gs` | The Google Apps Script behind the form and the dashboard. |

## Editing content

Open `index.html` and scroll to the `<script>` block near the bottom. Everything editable is at the top of it:

- **`SITE`**: WhatsApp number, email, social links, instructor photo, form endpoint. Empty values are hidden automatically.
- **Language**: every text in the data below has `ar` and `en` versions. English for the fixed page text is in the `EN` object; the Arabic lives in the HTML itself. `SITE.defaultLang` sets the starting language.
- **`EXPERIENCE`, `APPS`, `SKILLS`**: the instructor's work history, published apps and skills, taken from the CV.
- **`COURSES`**: the four courses. Each has `duration`, `price`, `startDate` and `availability` fields. Leave them `""` to show "يُحدَّد لاحقاً", or fill them in (for example `duration: "8 أسابيع"`).
- **`PROJECTS`**: the student project gallery. These are currently clearly labelled illustrative examples. Replace them with real student work when available, and remove the yellow notice in the `#projects` section.
- **`FAQ`**: question and answer pairs.

The instructor text is in the `#about` section of the HTML. Keep it to verified facts only.

### Add the instructor photo and logo

1. Put the photo next to `index.html`, for example `assets/instructor.jpg` (around 800×1000 px, compressed JPG or WebP).
2. Set `instructorPhoto: "assets/instructor.jpg"` in `SITE`.
3. The logo mark is an inline SVG in the header and footer. To use the official logo instead, replace the two `<svg>` blocks inside `.brand` with `<img src="assets/logo.svg" alt="" width="40" height="40">`, and update the favicon `<link rel="icon">` in the `<head>`.

## Connecting the enquiry form to Google Sheets

Without a URL the form runs in **demo mode**: it validates the fields, says clearly that nothing was sent, and offers a WhatsApp button with the enquiry already written out.

To save every enquiry as a row in a Google Sheet:

1. Create a new Google Sheet (for example "Khatwa Code – Enquiries").
2. In the sheet, open **Extensions → Apps Script**.
3. Delete what is in `Code.gs`, paste the contents of [`google-apps-script.gs`](google-apps-script.gs), and click **Save**.
4. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* = **Me** and *Who has access* = **Anyone**, then **Deploy**. Approve the permissions Google asks for.
5. Copy the **Web app URL** (it ends in `/exec`) and set it in `index.html`:
   `googleSheetUrl: "https://script.google.com/macros/s/…/exec",`
6. Commit and push. The "Demo form" badge disappears and enquiries land in the **Enquiries** tab, with a timestamp.

**Email alerts:** the script emails the sheet owner for every new enquiry (set `NOTIFY_EMAIL` in the script to use another address). In Apps Script → Project Settings, tick *Show "appsscript.json"*, replace that file with [`appsscript.json`](appsscript.json) from this repo, then run `testNotify` once from the editor to approve the permissions.

If you change the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Registrations dashboard (`admin.html`)

A private page for reading and managing the registrations in the Google Sheet: totals, new-this-week, a by-course breakdown, a 30-day chart, search and filters, a detail panel with WhatsApp / call / email buttons, a status for each student (New, Contacted, Enrolled, Waitlist, Not interested), private notes, delete, and CSV export.

The page itself holds no data. It asks the Apps Script for the rows, and the script only answers when the admin password is right (20 wrong tries lock it for 15 minutes). The page is marked `noindex`.

**Set it up once:**

1. In the sheet, open **Extensions → Apps Script**, replace `Code.gs` with the new [`google-apps-script.gs`](google-apps-script.gs), and click **Save**.
2. **Project Settings (⚙️) → Script Properties → Add script property**: Property `ADMIN_PASSWORD`, Value a long password only you know (at least 12 characters). Save.
3. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.** The URL stays the same, so the website form keeps working.
4. Open `https://<your-site>/admin.html` (on GitHub Pages: https://gargorey.github.io/codepath-academy/admin.html) and sign in with that password.

To change the password later, edit the script property; no redeploy needed. To point the dashboard at another Apps Script deployment, use the **Script link** button in its header: it tests the link before saving it. The dashboard also warns you when the website form (`googleSheetUrl` in index.html) sends to a different link than the dashboard reads from. The sheet gets the extra columns **Status**, **Notes** and **Payment plan** the first time the new script runs. Older rows show as *New*. Open `admin.html?demo` to try the dashboard with sample data.

## Prices and installments

`PRICES` in `index.html` (and `PRICE` in `admin.html`) hold the prices in US dollars: $30 per course and $100 for the Full Diploma. The form asks how the student wants to pay: in full, or in installments. Installment requests are saved in the sheet's **Payment plan** column, flagged in the dashboard, and mean you contact the student to agree the payment schedule.

## Student projects section

Hidden for now. Set `showStudentProjects: true` in `SITE` to show it again once you have real student work.

## Deploying

Any static host works. The quickest options:

- **Netlify Drop**: drag the folder onto https://app.netlify.com/drop.
- **GitHub Pages**: push the folder to a repository, then Settings → Pages → deploy from the `main` branch.
- **Vercel / Cloudflare Pages**: import the repository; no build command, output directory is the root.

After deploying, change `og:image` in the `<head>` to the full URL (for example `https://your-domain.com/og-image.png`), because social networks need an absolute link.

## Checked before delivery

- Desktop (1366px) and phone (390px) layouts, no horizontal scrolling
- RTL alignment with mixed Arabic and English terms
- Mobile menu, section navigation, course detail windows (`#course-<id>` links can be shared)
- Form validation errors and the demo-mode WhatsApp hand-off
- WhatsApp links point to https://wa.me/966531104828
