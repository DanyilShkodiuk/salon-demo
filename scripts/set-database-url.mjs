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
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = rl._writeToOutput.bind(rl);
    let muted = false;
    rl._writeToOutput = (s) => {
      if (!muted) write(s);
    };
    process.stdout.write(prompt);
    muted = true;
    rl.question("", (answer) => {
      muted = false;
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

const value = await readSecret("Paste the Neon connection string (nothing will show), then press Enter: ");

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
