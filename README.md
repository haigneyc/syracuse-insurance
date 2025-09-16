# syracuse-insurance
# Syracuse Small Business Liability – Lead Gen Site

Production‑ready scaffold for hosting your **small business liability insurance** landing page on **GitHub Pages** with a custom domain, plus wiring notes for n8n/Zapier, call tracking, and analytics.

---

## Repo structure

```
.
├─ index.html                 # Landing page (from canvas)
├─ /assets/                   # (optional) images, CSS, JS
│  ├─ logo.svg
│  ├─ styles.css              # if you split styles from index.html
│  └─ main.js                 # if you split JS from index.html
├─ CNAME                      # (optional) add your custom domain, e.g., syracusebusinessinsurance.com
├─ /docs/                     # (optional) extra pages
│  ├─ privacy.html
│  └─ terms.html
├─ README.md                  # this file
└─ .github/
   └─ workflows/
      └─ pages.yml            # (optional) GitHub Actions deploy for Pages
```

> If you keep everything in `index.html`, that’s fine—GitHub Pages will serve it from the repo root.

---

## Quick start

1. **Create repo** on GitHub and add `index.html`.

2. **Enable GitHub Pages**

* Go to **Settings → Pages**
* Build and deployment → **Deploy from a branch**
* Branch: `main` (root `/`)
* Save; you’ll get a temporary URL like `https://USERNAME.github.io/REPO/`

3. **Add a custom domain** (optional but recommended)

* Buy a domain (Namecheap, Cloudflare, Google Domains, etc.)
* In repo **Settings → Pages → Custom domain**, enter your domain (e.g., `syracusebusinessinsurance.com`) and **Enforce HTTPS**. This writes a `CNAME` file automatically. Alternatively, add a `CNAME` file yourself with the single line:

```
syracusebusinessinsurance.com
```

* **DNS records (typical)**

  * `www` **CNAME** → `USERNAME.github.io.`
  * Apex/root (`@`) **A** → GitHub Pages IPs:

    * `185.199.108.153`
    * `185.199.109.153`
    * `185.199.110.153`
    * `185.199.111.153`
  * If your DNS supports **ALIAS/ANAME**, you can point the apex to `USERNAME.github.io.` instead of using A records.

> After DNS propagation and GitHub Pages finishing its build, the site should be live at your domain with HTTPS.

---

## Configure the form endpoint

Your current `index.html` posts to `action="https://YOUR_N8N_OR_WEBHOOK_URL_HERE"`. Replace with your automation endpoint.

### Option A — n8n (self‑hosted on Unraid or cloud)

* Node: **Webhook** (POST) → **IF** (spam/validation) → **Google Sheets** or **Postgres** → **Email/SMS** (to agent) → **HTTP Request** (to CRM, optional)
* **Expected POST keys** from the page:

  * `name`, `business`, `phone`, `email`, `zip`, `business_type`, `employees`, `annual_revenue`, `renewal_month`, `current_insurer`, `coverage[]`, `notes`, `best_time`, `consent`
  * Hidden tracking: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`, `referrer`, `landing_path`, `timestamp`, `time_on_page_ms`, `user_agent`
* **Spam controls**: Reject if `company_hp` (honeypot) is non‑empty; rate‑limit repeated emails/phones.
* **Deliver to agent**: Send an email and/or SMS with the formatted lead. Example subject: `New SMB Liability Lead – ${name} (${zip})`.

### Option B — Zapier/Make

* Trigger: **Webhooks by Zapier (Catch Hook)**
* Steps: **Filter** (require `consent=true`), **Formatter** (normalize phone), **Google Sheets**/**HubSpot**/**Email by Zapier** to agent.

---

## Call tracking & dynamic numbers

* Use **CallRail** or **Twilio** for Dynamic Number Insertion (DNI). Replace the header phone and insert the provider’s snippet to swap numbers per traffic source.
* Forward calls to your contact’s number; record call duration for pay‑per‑call models.

---

## Analytics

* **Google Tag Manager (GTM)**: add your container ID in `index.html` and track `lead_form_submit` events (already pushed to `dataLayer`).
* **GA4**: within GTM, send an event when the form submits and on the thank‑you state.
* **Meta Pixel** (optional): track `Lead` events for Facebook campaigns.

---

## Privacy, terms & consent

* Update the consent checkbox label to match your compliance needs.
* Create `/docs/privacy.html` and `/docs/terms.html`. Link them from the footer.
* If you resell leads, disclose how data is shared with licensed agents.

Minimal privacy template (replace with your own policy/lawyer‑reviewed text):

```html
<!doctype html><html><head><meta charset="utf-8"><title>Privacy Policy</title></head>
<body>
<h1>Privacy Policy</h1>
<p>We collect the information you submit (e.g., name, phone, email, business details) to connect you with licensed insurance agents who can provide a quote. We may share your information with one or more agents solely for that purpose. We do not sell personal information for unrelated marketing.</p>
<p>By submitting the form, you consent to be contacted by phone, SMS, or email regarding your request. You can opt out at any time.</p>
</body></html>
```

---

## Optional GitHub Actions workflow

If you prefer Actions‑based deploys instead of Pages “Deploy from branch”, add `.github/workflows/pages.yml`:

```yaml
name: Deploy static site to Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

> After the first run, the Pages URL appears in the workflow summary.

---

## Testing checklist

* [ ] Form POST hits your webhook and returns 200
* [ ] Lead shows up in Sheet/DB and agent receives email/SMS within 1–2 minutes
* [ ] Consent box required and works
* [ ] UTM fields populate when visiting with `?utm_source=…`
* [ ] Call tracking number replaces header phone on paid traffic
* [ ] HTTPS enabled on custom domain; no mixed‑content errors

---

## Roadmap (nice‑to‑haves)

* reCAPTCHA v3 or hCaptcha
* Server‑side phone and email validation (e.g., Kickbox/Twilio Lookup)
* Thank‑you page with Calendly embed for instant appointment setting
* Multi‑vertical expansion (Auto, Life) with route‑by‑product to different contacts

---

## License

MIT or proprietary—choose what you prefer. If open‑sourcing, include an MIT `LICENSE` file.
