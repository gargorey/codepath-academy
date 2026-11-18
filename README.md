# CodePath Academy website

A static, bilingual (Arabic RTL / English LTR) single-page website. The globe button in the header switches language and remembers the choice. No build step and no framework: one `index.html` file with inline CSS and JavaScript, plus `og-image.png` for social sharing.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole site: header, hero, instructor, courses, learning path, why us, student projects, FAQ, contact form, footer. |
| `og-image.png` | 1200×630 image shown when the link is shared on WhatsApp, X, LinkedIn, etc. |

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

1. Create a new Google Sheet (for example "CodePath Academy – Enquiries").
2. In the sheet, open **Extensions → Apps Script**.
3. Delete what is in `Code.gs`, paste the contents of [`google-apps-script.gs`](google-apps-script.gs), and click **Save**.
4. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* = **Me** and *Who has access* = **Anyone**, then **Deploy**. Approve the permissions Google asks for.
5. Copy the **Web app URL** (it ends in `/exec`) and set it in `index.html`:
   `googleSheetUrl: "https://script.google.com/macros/s/…/exec",`
6. Commit and push. The "Demo form" badge disappears and enquiries land in the **Enquiries** tab, with a timestamp.

If you change the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

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
