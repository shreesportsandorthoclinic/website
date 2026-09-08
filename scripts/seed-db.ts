/* Loads the database's starting content.
 *
 *   npm run db:seed              Insert every health-library article from
 *                                lib/content.ts (body = the shared starter
 *                                copy). Existing rows are left untouched, so
 *                                this is safe to re-run and never overwrites
 *                                edits the clinic has made.
 *
 *   npm run db:seed -- --demo    Also insert the sample appointments from
 *                                lib/seed.ts, so the staff screens have
 *                                something to show. Do NOT use --demo against
 *                                the real clinic database.
 *
 *   npm run db:reset             Empty all three tables, then seed articles
 *                                and the demo appointments. Development only.
 *
 * Reads DATABASE_URL from .env (falling back to the ambient environment).
 * Run the schema first: paste db/schema.sql into the Supabase SQL editor.
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { articleBody, articles } from "../lib/content";
import { seedAppointments } from "../lib/seed";

/* Minimal .env loader — avoids a dependency just for a dev script. */
try {
  const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* no .env file — rely on the environment */
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (checked .env and the environment).");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const withDemo = reset || process.argv.includes("--demo");

const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
  if (reset) {
    await sql`truncate appointments, articles, otp_codes, schedule_closures`;
    await sql`delete from schedule_hours`;
    console.log("cleared: appointments, articles, otp_codes, schedule_closures, schedule_hours");
  }

  /* Seven weekday rows with the default hours (08:00–14:00 & 19:00–21:00).
     Safe to re-run — existing rows are left as the clinic set them. */
  const hourRows = await sql`
    insert into schedule_hours (weekday) values (0),(1),(2),(3),(4),(5),(6)
    on conflict (weekday) do nothing
    returning weekday
  `;
  console.log(`schedule_hours: ${hourRows.length} weekday rows created`);

  let insertedArticles = 0;
  for (const article of Object.values(articles)) {
    const rows = await sql`
      insert into articles (key, title, category, read, date, author, excerpt, image, body)
      values (
        ${article.key}, ${article.title}, ${article.category}, ${article.read},
        ${article.date}, ${article.author}, ${""},
        ${sql.json({ src: article.image.src, alt: article.image.alt })},
        ${sql.json(articleBody)}
      )
      on conflict (key) do nothing
      returning key
    `;
    insertedArticles += rows.length;
  }
  const total = Object.keys(articles).length;
  console.log(`articles: ${insertedArticles} inserted, ${total - insertedArticles} already present`);

  if (withDemo) {
    let insertedAppointments = 0;
    for (const appointment of seedAppointments) {
      const rows = await sql`
        insert into appointments
          (id, name, phone, email, age, type, date, time, status, reason, history, reference, notes, created_at)
        values (
          ${appointment.id}, ${appointment.name}, ${appointment.phone}, ${appointment.email},
          ${appointment.age}, ${appointment.type}, ${appointment.date}, ${appointment.time},
          ${appointment.status}, ${appointment.reason}, ${appointment.history},
          ${appointment.reference}, ${appointment.notes ?? null}, ${appointment.createdAt}
        )
        on conflict (id) do nothing
        returning id
      `;
      insertedAppointments += rows.length;
    }
    console.log(`demo appointments: ${insertedAppointments} inserted`);
  }

  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 5 }).catch(() => {});
  process.exit(1);
});
