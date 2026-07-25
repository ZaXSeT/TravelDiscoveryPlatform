// Creates or repairs demo accounts without sending a single email.
//
// The built-in Supabase mailer allows 2 messages/hour project-wide and refuses to deliver to
// anyone outside the project team, which makes live registration unreliable to demo. The
// service role can mark an address confirmed directly, so an account is usable immediately.
// Fulfils the pre-verified seed user called for in Phase0/02_USER_AND_AUTH_FLOWS.md §1.
//
//   node --env-file=.env.local scripts/demo-user.ts create <email> <password> [name]
//   node --env-file=.env.local scripts/demo-user.ts confirm <email>
//   node --env-file=.env.local scripts/demo-user.ts list
//
// Requires SUPABASE_SERVICE_ROLE_KEY. Never import this from application code.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: node --env-file=.env.local scripts/demo-user.ts <command>",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findByEmail(email: string) {
  const target = email.trim().toLowerCase();
  // No getUserByEmail in supabase-js v2 — page through the directory instead.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function create(email: string, password: string, name?: string) {
  if (!email || !password) {
    throw new Error("Usage: create <email> <password> [name]");
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error(
      "Password must be at least 8 characters and contain a letter and a number " +
        "(matches the app's own sign-up rules).",
    );
  }

  const existing = await findByEmail(email);
  if (existing) {
    // Idempotent: reset the known password and confirm, so a half-finished signup from an
    // undelivered email becomes usable instead of erroring out.
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    console.log(`Updated existing user ${email} — confirmed, password reset.`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // marks the address verified; no mail is sent
    user_metadata: name ? { display_name: name } : undefined,
  });
  if (error) throw new Error(error.message);
  console.log(`Created ${email} (${data.user?.id}) — already confirmed, ready to sign in.`);
}

async function confirm(email: string) {
  if (!email) throw new Error("Usage: confirm <email>");
  const user = await findByEmail(email);
  if (!user) throw new Error(`No account found for ${email}.`);
  if (user.email_confirmed_at) {
    console.log(`${email} is already confirmed (${user.email_confirmed_at}).`);
    return;
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  console.log(`Confirmed ${email} — they can sign in now, no email needed.`);
}

async function list() {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw new Error(error.message);
  if (data.users.length === 0) {
    console.log("No users yet.");
    return;
  }
  for (const u of data.users) {
    const state = u.email_confirmed_at ? "confirmed" : "UNCONFIRMED";
    console.log(`${state.padEnd(12)} ${u.email ?? "(no email)"}  created ${u.created_at}`);
  }
}

const [command, ...args] = process.argv.slice(2);

const run =
  command === "create"
    ? create(args[0] ?? "", args[1] ?? "", args[2])
    : command === "confirm"
      ? confirm(args[0] ?? "")
      : command === "list"
        ? list()
        : Promise.reject(
            new Error(
              "Usage:\n" +
                "  create <email> <password> [name]   create a pre-confirmed account\n" +
                "  confirm <email>                    confirm an account stuck unconfirmed\n" +
                "  list                               show accounts and their state",
            ),
          );

run.catch((err: Error) => {
  console.error(err.message);
  // exitCode rather than exit(): a hard exit while the HTTP client is still tearing down
  // trips a libuv assertion on Windows and prints a scary trace after the real message.
  process.exitCode = 1;
});
