import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './app/generated/prisma/client/index.js'

async function check() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const projects = await prisma.project.findMany()
  console.log('Projects in DB:', projects.map(p => ({ id: p.id, name: p.name })))
  
  await prisma.$disconnect()
  await pool.end()
}

check().catch(console.error)
