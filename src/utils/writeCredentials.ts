import { writeFile } from 'node:fs/promises'
await import('dotenv').then(({ config }) => config())

await writeFile('google_credentials.json', process.env.FIREBASE_TOKEN ?? '{}')
