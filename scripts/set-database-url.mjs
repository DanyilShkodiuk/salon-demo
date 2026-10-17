// Saves DATABASE_URL into .env.local without echoing the secret to the screen.
import fs from "node:fs";
import readline from "node:readline";

const FILE = ".env.local";

function readSecret(prompt) {
  if (!process.stdin.isTTY) {
    // Piped input (used in automated checks): read the first line.
    return new Promise((resolve) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (c) => (data += c));
      process.stdin.on("end", () => resolve(data.split(/\r?\n/)[0].trim()));
    });
  }
  // Interactive: read raw keystrokes so nothing is echoed and the prompt stays visible.
  return new Promise((resolve) => {
    let secret = "";
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off("data", onData);
      process.stdout.write("\n");
      resolve(secret.trim());
    };
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") return finish();
        if (ch === "\u0003") {
          process.stdout.write("\n");
          process.exit(130); // Ctrl+C
        }
        if (ch === "\u007f" || ch === "\b") secret = secret.slice(0, -1);
        else if (ch >= " ") secret += ch;
      }
    };
    process.stdin.on("data", onData);
  });
}

const value = await readSecret("Paste the Neon connection string (nothing will show), then press Enter:\n> ");

if (!/^postgres(ql)?:\/\/[^\s"']+$/.test(value)) {
  console.error("That does not look like a Postgres connection string (it should start with postgresql://). Nothing was saved.");
  process.exit(1);
}

let host = "";
try {
  host = new URL(value).hostname;
} catch {
  console.error("The connection string could not be parsed. Nothing was saved.");
  process.exit(1);
}

const lines = fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8").split(/\r?\n/) : [];
const kept = lines.filter((l) => l.trim() !== "" && !l.startsWith("DATABASE_URL="));
kept.push(`DATABASE_URL="${value}"`);
fs.writeFileSync(FILE, kept.join("\n") + "\n");

console.log(`Saved DATABASE_URL to ${FILE} (host: ${host}).`);
