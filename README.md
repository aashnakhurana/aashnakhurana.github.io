# Aashna Khurana — Academic Portfolio

Personal academic website for Aashna Khurana, Ph.D. (Inclusive Education · Boston College).

A fully static, dependency-free site: plain HTML + CSS + vanilla JS. No build step.

## Structure

```
index.html        the whole site (single page)
css/style.css     theme (light default + dark toggle), layout, animations
js/main.js        theme persistence, mobile nav, scroll reveals, tabs, counters
media/            headshot + downloadable CV (the only published assets)
Assets/           PRIVATE source material — git-ignored, never published
```

## Publish on GitHub Pages (free)

1. Create a GitHub account (if needed) at https://github.com/join — pick a username
   like `aashnakhurana`.
2. Create a new **public** repository named exactly `<username>.github.io`
   (e.g. `aashnakhurana.github.io`). Don't add a README when asked.
3. In Terminal, from this folder:

   ```bash
   cd ~/Desktop/Portfolio
   git remote add origin https://github.com/<username>/<username>.github.io.git
   git push -u origin main
   ```

4. Wait ~2 minutes. The site is live at `https://<username>.github.io`.

To update the site later: edit the files, then

```bash
git add -A && git commit -m "Update site" && git push
```

> The `Assets/` folder (dissertation, in-press manuscripts) is excluded by
> `.gitignore` and will never be uploaded. Only `media/` (headshot + CV) is public.

## Local preview

Any static server works, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
