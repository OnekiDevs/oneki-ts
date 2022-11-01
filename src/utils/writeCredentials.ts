import { writeFile } from 'node:fs/promises'
await import('dotenv').then(({ config }) => config())

await writeFile('google_credentials.json', JSON.stringify(process.env.FIREBASE_TOKEN ?? {}, null, 4))
