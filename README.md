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

## Connecting the enquiry form

Without a backend the form runs in **demo mode**: it validates the fields, clearly says nothing was sent, and offers a WhatsApp button with the enquiry already written out.

To receive submissions for real:

1. Create a free form at [Formspree](https://formspree.io) (or Getform, Basin, etc.) and copy its endpoint URL, e.g. `https://formspree.io/f/abcdwxyz`.
2. Set `formEndpoint: "https://formspree.io/f/abcdwxyz"` in `SITE`.
3. The "نموذج تجريبي" badge disappears and the form sends JSON to that endpoint, with real success and error messages.

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
