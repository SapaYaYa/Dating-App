---
name: Clerk CAPTCHA verification
description: Distinguishes a correctly mounted Clerk CAPTCHA from Cloudflare bot rejection in automated preview tests.
---

Clerk custom sign-up flows should keep the visible human-verification widget available while the sign-up request is pending; successful human completion lets the same request continue automatically.

**Why:** Playwright-style preview automation can render and click the widget but still receive Cloudflare Turnstile `600010`, a generic bot-detection failure. That result does not prove that a real user cannot complete the challenge.

**How to apply:** Verify that the widget is visible and unclipped with automation, but use a normal browser or real device for the final completion check. Do not weaken bot protection merely to make automated testing pass.