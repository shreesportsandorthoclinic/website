/* Prints the Telegram chat IDs that have messaged the bot recently.
 *
 * Setup:
 *   1. In Telegram, message @BotFather → /newbot → follow the prompts.
 *      Copy the bot token it gives you.
 *   2. Put it in .env as TELEGRAM_BOT_TOKEN=... (or pass it as the first
 *      argument to this script).
 *   3. Have each person who should get alerts (the doctor, the front desk)
 *      open the bot and tap Start / send it any message.
 *   4. Run:  npx tsx scripts/telegram-chat-id.ts
 *   5. Put the printed id(s) in TELEGRAM_CHAT_ID, comma-separated for more
 *      than one, in .env and in the Cloudflare Worker's variables.
 */
import { readFileSync } from "node:fs";

try {
  const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* no .env */
}

const token = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("No token. Pass it as an argument or set TELEGRAM_BOT_TOKEN in .env.");
  process.exit(1);
}

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = (await res.json()) as {
  ok: boolean;
  description?: string;
  result?: Array<{ message?: { chat: { id: number; type: string; title?: string; first_name?: string; username?: string } } }>;
};

if (!data.ok) {
  console.error("Telegram API error:", data.description);
  process.exit(1);
}

const chats = new Map<number, string>();
for (const update of data.result ?? []) {
  const chat = update.message?.chat;
  if (chat) {
    const label = chat.title || chat.first_name || chat.username || chat.type;
    chats.set(chat.id, label);
  }
}

if (chats.size === 0) {
  console.log(
    "No recent messages. Have the doctor open the bot and send it any message, then re-run.\n" +
      "(Telegram only keeps updates for 24h and only until they are read.)",
  );
} else {
  console.log("Chat IDs that have messaged the bot:\n");
  for (const [id, label] of chats) console.log(`  ${id}\t${label}`);
  console.log(`\nTELEGRAM_CHAT_ID=${[...chats.keys()].join(",")}`);
}
