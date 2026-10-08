# ChessResults.in — Web Spectator Portal

Official public web spectator portal for **Chess Pairing App**. Displays real-time pairings, results, live standings, age/gender category filters, and digital score entry for chess tournaments worldwide.

Domain: **https://chessresults.in**

---

## 📁 Project Structure

```text
chess-results-web/
├── index.html        # Complete standalone web app (Vanilla JS + Firestore SDK)
├── CNAME             # GoDaddy custom domain routing (chessresults.in)
├── netlify.toml      # Netlify headers, SPA rewrites, and security policies
├── vercel.json       # Vercel zero-config rewrite rules
├── _redirects        # Netlify SPA clean URL redirects
├── package.json      # Local preview scripts
└── preview.bat       # 1-Click local Windows preview launcher
```

---

## 🚀 How to Run Locally

### Option 1: One-Click (Windows)
Double-click `preview.bat`. It will open `http://localhost:3000` automatically in your browser.

### Option 2: Command Line
```bash
npm start
# or
npx serve -l 3000 .
```

---

## 🌐 Deployment Instructions

### Method A: Netlify Drop (Recommended - 60 Seconds, 100% Free SSL)

1. Go to **https://app.netlify.com/drop**
2. Drag and drop this entire `chess-results-web` folder into the upload box.
3. In Netlify Site Settings $\rightarrow$ **Domain Management**:
   - Add **`chessresults.in`**.
4. In your **GoDaddy DNS Management**:
   - Add `A` record: Name `@` $\rightarrow$ Value `75.2.60.5`
   - Add `CNAME` record: Name `www` $\rightarrow$ Value `<your-site-name>.netlify.app`

---

### Method B: Vercel (100% Free)

1. Run in this directory:
   ```bash
   npx vercel --prod
   ```
2. In Vercel Project Settings $\rightarrow$ **Domains**:
   - Add **`chessresults.in`**.
3. In GoDaddy DNS:
   - Add `A` record: Name `@` $\rightarrow$ Value `76.76.21.21`
   - Add `CNAME` record: Name `www` $\rightarrow$ Value `cname.vercel-dns.com`

---

### Method C: GoDaddy cPanel Web Hosting

1. Log in to GoDaddy cPanel $\rightarrow$ Open **File Manager**.
2. Navigate to `public_html`.
3. Upload `index.html` directly into `public_html`.
4. Your website is live immediately at `https://chessresults.in`.

---

## 🔗 Public Tournament URL Scheme

Spectators and parents can access any live tournament directly via:
```text
https://chessresults.in/?code={JOIN_CODE}
```
Example:
```text
https://chessresults.in/?code=MUSM40
```
