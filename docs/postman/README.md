# Testing bookings with Postman

`shree-booking.postman_collection.json` drives the whole public booking flow
from Postman, so you can fire test appointments at `/staff` without touching a
browser — and, right now, **without a working inbox**.

## Import and run

1. Postman → **Import** → drop in `shree-booking.postman_collection.json`.
2. Open the collection's **Variables** tab and set `baseUrl`:
   - `http://localhost:3000` while `npm run dev` is running, or
   - `https://shreesportsandortho.in` to test the live site.
3. Send the four requests **in order**. Each one writes what the next needs
   into a collection variable, so you only press Send:

   | # | Request | What it does | Saves |
   | - | ------- | ------------ | ----- |
   | 1 | `GET /api/availability?day=1` | Lists tomorrow's slots | `slot` (first free one) |
   | 2 | `POST /api/otp/request` | Issues a 6-digit code | `otpId`, `code` |
   | 3 | `POST /api/otp/verify` | Trades the code for a token | `verificationToken` |
   | 4 | `POST /api/booking` | Creates the appointment | `reference` |

   Or hit **Run collection** to do all four in one go.

The new appointment lands as **PENDING** on `/staff`, and the Telegram alert
fires if `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` are set.

## Why this works before email is switched on

`/api/otp/request` returns the code in the response as `devCode` **whenever
there is no email provider configured** (`RESEND_API_KEY` unset) — see
`app/api/otp/request/route.ts`. Request 3's test script picks it up
automatically.

**The moment you set `RESEND_API_KEY`, `devCode` stops being returned.** From
then on: send request 2, read the code out of the inbox for `email`, paste it
into the `code` variable, and send request 3. Nothing else changes. There is
deliberately no bypass that skips verification — `/api/booking` refuses any
request without a valid token, and that is the only thing stopping a script
from filling the clinic's day with fake appointments.

## Things that will bite you

- **`day` is an offset, not a date.** `1` = tomorrow, up to `10`. A calendar
  date is never accepted.
- **`closed: true` from request 1** means the clinic is shut that day (weekly
  hours or a closure). Raise `day` and send again.
- **429 on request 2** is the 30-second resend cooldown. Wait, then resend.
  Four live codes per address is the ceiling.
- **401 on request 4** means the token is missing, older than 30 minutes, or
  was minted for a different email/phone — the token is bound to both, so
  changing `email` or `phone` means redoing requests 2 and 3.
- **409 on request 4** means the slot went while you were testing. Re-run
  request 1.
- Use an email you control. Every test booking is a real row in the real
  database — clear them from `/staff` when you are done.
