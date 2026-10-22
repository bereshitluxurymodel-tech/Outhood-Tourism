import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Interactive, run-it-yourself script: replaces the well-known demo
// passwords (and optionally the admin email) in whichever database your
// local .env points at. Passwords are typed hidden (nothing is shown as you type), never echoed, never
// written to a file, and never printed.

const prisma = new PrismaClient();

const MIN_LENGTH = 12;

// Plain visible prompt — used for non-secret questions (e.g. the email).
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Secret prompt: reads raw keystrokes and prints NOTHING for them, so the
// password is never shown on screen (readline-based masking is unreliable
// on Windows terminals, where the terminal itself echoes the typing).
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);

    if (!stdin.isTTY) {
      console.error("\nThis script must be run in an interactive terminal so the password can be hidden.");
      process.exit(1);
    }

    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      process.stdout.write("\n");
    };

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          finish();
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          // Ctrl+C
          finish();
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
        } else {
          value += ch;
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function askNewPassword(label: string): Promise<string | null> {
  for (;;) {
    const first = await askHidden(`New password for ${label} (min ${MIN_LENGTH} chars, Enter to skip): `);
    if (first === "") return null;
    if (first.length < MIN_LENGTH) {
      console.log(`  Too short — use at least ${MIN_LENGTH} characters.`);
      continue;
    }
    const second = await askHidden("  Type it again to confirm: ");
    if (first !== second) {
      console.log("  Those didn't match — try again.");
      continue;
    }
    return first;
  }
}

async function main() {
  const accounts = [
    { label: "ADMIN", email: "admin@outhood.dev", role: "ADMIN" as const },
    { label: "SUPPLIER", email: "supplier@outhood.dev", role: "SUPPLIER" as const },
    { label: "CUSTOMER", email: "customer@outhood.dev", role: "CUSTOMER" as const },
  ];

  console.log("\nRotate demo credentials. Nothing you type here is saved anywhere except as a hash in the database.\n");

  for (const account of accounts) {
    // The admin may already have a new email from an earlier run — find by role.
    const user =
      account.role === "ADMIN"
        ? await prisma.user.findFirst({ where: { role: "ADMIN" } })
        : await prisma.user.findUnique({ where: { email: account.email } });

    if (!user) {
      console.log(`${account.label}: no such account found — skipping.\n`);
      continue;
    }

    console.log(`${account.label} account (currently ${user.email})`);

    let newEmail: string | undefined;
    if (account.role === "ADMIN") {
      const typed = (await ask("  New admin email (Enter to keep current): ")).trim().toLowerCase();
      if (typed !== "") {
        if (!typed.includes("@")) {
          console.log("  That doesn't look like an email — keeping the current one.");
        } else {
          const taken = await prisma.user.findUnique({ where: { email: typed } });
          if (taken && taken.id !== user.id) {
            console.log("  That email is already used by another account — keeping the current one.");
          } else {
            newEmail = typed;
          }
        }
      }
    }

    const newPassword = await askNewPassword(account.label);

    if (newPassword === null && newEmail === undefined) {
      console.log("  Nothing changed.\n");
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(newEmail !== undefined ? { email: newEmail } : {}),
        ...(newPassword !== null ? { passwordHash: await bcrypt.hash(newPassword, 10) } : {}),
      },
    });
    console.log(`  Updated${newEmail !== undefined ? " email" : ""}${newEmail !== undefined && newPassword !== null ? " and" : ""}${newPassword !== null ? " password" : ""}.\n`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
