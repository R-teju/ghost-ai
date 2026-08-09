prisma is already installed. add the project data models,Prisma client singleton and first migration

## models
Create `prisma/models/projects.prisma`.

Add `project`:

- owner ID mapped to Clerk user
- name
- optional description
- status enum: `DRAFT`,`ARCHIVED`
- `canvasJsonPath` for future canvas blob storge
- timestamps
- indexes on owner ID and creation date

Add `ProectCollabortor`:
- project relation with cascade delete
- collaborator email
- unique constraint on project/email
- indexes on email and project/date

Do not add extra fields unless required by prisma.

## PRISMA CLIENT
create `lib/prisma.ts` as a cached singleton.

Branch by`DATABASE_URL`:
- if it starts with `prisma+postgres://`, use accelerate
- otherwise use direct `@prisma/adapter-pg`

cache the client on `global` in development for hot reloads.

## Migration

Run the migration and generate the client.

## dependencies

Already installed:
- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

## Check when done

- schema has both models with correct relations and indexes
- `lib/prisma.ts` exports one cached prisma instance 
- migration runs successfully 
- `npm run build` passes