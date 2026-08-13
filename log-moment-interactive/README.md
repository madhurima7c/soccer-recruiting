# Log Moment — Today + Field 7 (interactive)

Mobile prototype: coach **Today** schedule with pull-up day sheet → **Field 7** player carousel → log moments.

## Open on GitHub Pages

After deploy from the `maddy` branch:

**https://madhurima7c.github.io/soccer-recruiting/log-moment-interactive/**

## Run locally

```bash
cd log-moment-interactive
python3 -m http.server 8083
```

Open **http://localhost:8083/**

## Flow

1. **Today** — calendar strip, day summary sheet (pull up for full schedule)
2. Tap **Field 7** → live match + horizontal player cards
3. Select a player → moments/events chips + **Log moment**

Designed for **402×874** (iPhone). Uses GSAP for sheet motion.

## Figma

- Today: [node 2539:28515](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=2539-28515)
- Field 7: [node 2539:28373](https://www.figma.com/design/4kiWtsFEQozwERuqGiuO1p/Design-for-Soccer-Recruiting?node-id=2539-28373)
