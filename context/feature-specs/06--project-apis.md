the database schema is ready.Build the backend project API routes only.

- `GET /api/projects`,list current user's projects
- `POST /api/projects` ,create project
- `PATCH /api/projects/[projectID]` , rename project
- `DELETE /api/projects/[projectID]` , delete project 

## Rules

Use the authenticated Clerk user ID as `ownerID`.

when creating :

- default missing project name to `Untitled Project`
- use the schema's existing ID strategy ,do not add seguential IDs

Security :

- unauthenticated requests return `401`
- only the project owner can resume or delete 
- non-owner mutations return `403`

Keep this backend-only.do not wire the ui yet

## check when done
- routes exist for list/create/rename/delete
- owner checks are enforced for renmae/delete
- `401` and `403` responses are handled correctly
- `npm run build`passes 