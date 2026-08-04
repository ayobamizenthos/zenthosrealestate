const email = process.argv[2]
if (!email) {
  console.error('Usage: npm run make-admin -- <email>')
  process.exit(1)
}

const accessToken = process.env.SUPABASE_ACCESS_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!accessToken || !projectRef) {
  console.error('SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF must be set in .env.local.')
  process.exit(1)
}

const safeEmail = email.replace(/'/g, "''")

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `insert into public.admin_users (user_id, role)
              select id, 'super_admin' from auth.users where email = '${safeEmail}'
              on conflict (user_id) do update set role = 'super_admin'
              returning user_id`,
  }),
})

if (!response.ok) {
  console.error(await response.text())
  process.exit(1)
}

const rows = await response.json()
if (rows.length === 0) {
  console.error(`No account found for ${email}. Register at /register first, then re-run.`)
  process.exit(1)
}

console.log(`${email} is now a super admin.`)
