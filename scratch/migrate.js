const { Client } = require("pg");
require("dotenv").config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Migrating database:", connectionString);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  const sql = `
    CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ARCHIVED');

    CREATE TABLE "Project" (
        "id" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
        "canvasJsonPath" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
    );

    CREATE TABLE "ProjectCollaborator" (
        "id" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "ProjectCollaborator_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "ProjectCollaborator_projectId_email_key" ON "ProjectCollaborator"("projectId", "email");

    CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");
    CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

    CREATE INDEX "ProjectCollaborator_email_idx" ON "ProjectCollaborator"("email");
    CREATE INDEX "ProjectCollaborator_projectId_createdAt_idx" ON "ProjectCollaborator"("projectId", "createdAt");

    ALTER TABLE "ProjectCollaborator" ADD CONSTRAINT "ProjectCollaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  `;

  try {
    await client.connect();
    console.log("Connected successfully. Running migration SQL...");
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

main();
