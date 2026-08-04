import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const accessToken = process.env.SUPABASE_ACCESS_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!accessToken || !projectRef) {
  console.error('SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF must be set in .env.local.')
  process.exit(1)
}

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

async function runSql(label, sql) {
  process.stdout.write(`  ${label} … `)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!response.ok) {
    console.log('FAILED')
    console.error(`\n${await response.text()}\n`)
    process.exit(1)
  }

  console.log('ok')
  return response.json()
}

const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
const files = (await readdir(migrationsDir)).filter(name => name.endsWith('.sql')).sort()

for (const file of files) {
  await runSql(file, await readFile(join(migrationsDir, file), 'utf8'))
}

if (process.argv.includes('--seed')) {
  await runSql('seed.sql', await readFile(join(process.cwd(), 'supabase', 'seed.sql'), 'utf8'))
}

const tables = await runSql(
  'verify',
  "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
)

console.log(`\nTables: ${tables.map(row => row.table_name).join(', ')}`)
