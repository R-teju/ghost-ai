import { auth, createClerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  projectId: z.string(),
})

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      // Empty body
    }

    const result = chatSchema.safeParse(body)
    if (!result.success) {
      return Response.json({ error: "Invalid chat payload" }, { status: 400 })
    }

    const { messages, projectId } = result.data

    // Fetch the project to verify access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 })
    }

    // Verify Access: User is owner OR has their email in ProjectCollaborator
    let isAuthorized = project.ownerId === userId

    if (!isAuthorized) {
      const currentUserObj = await clerk.users.getUser(userId)
      const userEmails = currentUserObj.emailAddresses.map((e) => e.emailAddress.toLowerCase())

      const collabMatch = await prisma.projectCollaborator.findFirst({
        where: {
          projectId,
          email: {
            in: userEmails,
          },
        },
      })
      if (collabMatch) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    // Detect design-intent queries for optional Trigger.dev background task
    const cleanLastMessage = messages[messages.length - 1]?.content.toLowerCase() || ""
    const isDesignQuery = /\b(design|create|add|delete|remove|update|layout|connect|architecture|pipeline|schema|model|service|component|e-commerce|ecommerce|cicd|event-driven)\b/i.test(cleanLastMessage)

    // Try triggering the background design agent if available (non-blocking)
    if (isDesignQuery) {
      try {
        const { generateDesign } = await import("@/trigger/design-agent")
        await generateDesign.trigger({
          projectId,
          roomId: projectId,
          prompt: messages[messages.length - 1]?.content || "",
          userId,
        })
      } catch (triggerError) {
        console.warn("Trigger.dev design agent not available:", triggerError)
      }
    }

    // --- Primary Path: Gemini AI ---
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (apiKey) {
      try {
        const model = google("gemini-2.5-flash")
        const response = await generateText({
          model,
          messages: [
            {
              role: "system",
              content: `You are Ghost AI, a professional full-stack software architecture assistant.
You are assisting the user inside their workspace project named "${project.name}" (Description: "${project.description || "none"}").

Your role:
- Provide concise, expert architecture design advice
- When the user asks to design a system, describe the components and their interactions
- Use markdown formatting: **bold** for emphasis, \`code\` for technical terms, bullet lists for structure
- Keep responses focused and actionable (150-300 words)
- Be professional but approachable

You must return a JSON response matching this schema:
{
  "content": "Your markdown-formatted chat reply describing the architecture or answering questions.",
  "specs": "A detailed technical specification in markdown format. Include sections for System Components, Data Flow, and Technology Choices. Leave empty string if not applicable.",
  "template": null
}

IMPORTANT: Return ONLY valid JSON. No markdown fences around the JSON.`,
            },
            ...messages,
          ],
        })

        const responseText = response.text.trim()
        let content = "I couldn't generate a response."
        let specs = ""
        let template: Record<string, unknown> | null = null

        try {
          // Strip any markdown code fences the model might have added
          let cleanJson = responseText
          if (cleanJson.startsWith("```json")) cleanJson = cleanJson.substring(7)
          if (cleanJson.startsWith("```")) cleanJson = cleanJson.substring(3)
          if (cleanJson.endsWith("```")) cleanJson = cleanJson.substring(0, cleanJson.length - 3)
          cleanJson = cleanJson.trim()

          const parsed = JSON.parse(cleanJson)
          content = parsed.content || responseText
          specs = parsed.specs || ""
          template = parsed.template || null
        } catch {
          // If JSON parsing fails, use the raw text as the content
          content = responseText
        }

        return Response.json({ content, specs, template })
      } catch (aiError) {
        console.error("Gemini AI error, falling back to offline mode:", aiError)
        // Fall through to offline mode
      }
    }

    // --- Fallback Path: High-quality offline responses ---
    return Response.json(generateOfflineResponse(cleanLastMessage, project.name, project.description))
  } catch (error) {
    console.error("Chat error:", error)
    return Response.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}

/**
 * Generates high-quality offline responses with canvas templates for architecture presets.
 * Used when no AI API key is available.
 */
function generateOfflineResponse(
  message: string,
  projectName: string,
  projectDescription: string | null
): { content: string; specs: string; template: Record<string, unknown> | null } {
  const cleanMessage = message.trim()

  // Architecture pattern matchers
  const isEcommerce = /\b(e-commerce|ecommerce|shop|cart|checkout|store|scale)\b/i.test(cleanMessage)
  const isCicd = /\b(ci\/cd|cicd|pipeline|jenkins|github actions|deploy|deployment)\b/i.test(cleanMessage)
  const isEventDriven = /\b(event-driven|event driven|kafka|rabbit|pubsub|pub\/sub|broker|mq)\b/i.test(cleanMessage)
  const hasHello = /\b(hello|hi|hey|greetings)\b/i.test(cleanMessage)
  const hasDatabase = /\b(database|schema|model|postgres|sql|nosql|mongodb|dynamodb)\b/i.test(cleanMessage)
  const hasAuth = /\b(auth|login|signup|clerk|identity|session|token)\b/i.test(cleanMessage)
  const hasApi = /\b(api|route|crud|endpoint|gateway)\b/i.test(cleanMessage)

  if (isEcommerce) {
    return {
      content: `I've generated a **high-scale e-commerce backend architecture** on your canvas!\n\nHere's an overview of the design:\n- **API Gateway** — Single entry point with rate limiting and SSL termination\n- **Auth & User Services** — Handles registration, login, and JWT-based RBAC\n- **Product Catalog + Redis Cache** — Fast reads (<10ms) backed by NoSQL storage\n- **Order Service + Message Queue** — Asynchronous checkout processing\n- **Notification Service** — Event-driven email/SMS confirmations\n\nSwitch to the **Specs** tab for the full technical specification document.`,
      specs: `# E-Commerce Architecture Specification\n\n## 1. Executive Summary\nA high-scale e-commerce backend system designed for throughput, resilience, and sub-10ms catalog reads.\n\n## 2. System Components\n\n### API Gateway\n- **Purpose**: Unified entry point for all client applications\n- **Responsibilities**: Route aggregation, rate limiting (1000 req/s), SSL termination, request validation\n- **Technology**: Kong / AWS API Gateway / Nginx\n\n### Auth & User Service\n- **Purpose**: Identity and Access Management\n- **Responsibilities**: User registration, sign-in, JWT issuance, RBAC enforcement\n- **Technology**: Clerk / Auth0 / Custom JWT service\n\n### Product Catalog Service\n- **Purpose**: Product metadata, categories, inventory management\n- **Database**: NoSQL (MongoDB / DynamoDB) for flexible schemas and high write throughput\n- **Caching**: Redis layer guaranteeing <10ms latency for hot product pages\n\n### Order Processing Service\n- **Purpose**: Checkout handling, invoicing, purchase records\n- **Communication**: Publishes \`order.created\` events to Message Broker for async fulfillment\n\n### Message Queue\n- **Purpose**: Decouples order processing from downstream services\n- **Technology**: Kafka / RabbitMQ\n- **Topics**: \`orders\`, \`notifications\`, \`inventory-updates\`\n\n### Notification Service\n- **Purpose**: Email/SMS confirmations, order status updates\n- **Triggers**: Subscribes to \`order.created\` and \`order.shipped\` events\n\n## 3. Data Flow\n1. Client authenticates → Auth Service → JWT returned\n2. Product browse → API Gateway → Catalog Service → Redis Cache (fallback: NoSQL DB)\n3. Order placement → API Gateway → Order Service → writes DB → publishes event to MQ\n4. MQ delivers event → Notification Service sends confirmation\n\n## 4. Non-Functional Requirements\n- **Availability**: 99.9% uptime SLA\n- **Latency**: <10ms for cached reads, <200ms for writes\n- **Scalability**: Horizontal scaling of stateless services behind load balancer`,
      template: {
        nodes: [
          { id: "gw", type: "canvasNode", position: { x: 100, y: 180 }, style: { width: 130, height: 48 }, data: { label: "API Gateway", shape: "pill", color: "teal" } },
          { id: "auth", type: "canvasNode", position: { x: 300, y: 50 }, style: { width: 130, height: 60 }, data: { label: "Auth Service", shape: "rectangle", color: "blue" } },
          { id: "users", type: "canvasNode", position: { x: 300, y: 180 }, style: { width: 130, height: 60 }, data: { label: "User Service", shape: "rectangle", color: "blue" } },
          { id: "orders", type: "canvasNode", position: { x: 300, y: 310 }, style: { width: 130, height: 60 }, data: { label: "Order Service", shape: "rectangle", color: "blue" } },
          { id: "catalog", type: "canvasNode", position: { x: 520, y: 180 }, style: { width: 140, height: 60 }, data: { label: "Catalog Service", shape: "rectangle", color: "blue" } },
          { id: "redis", type: "canvasNode", position: { x: 525, y: 50 }, style: { width: 130, height: 48 }, data: { label: "Redis Cache", shape: "pill", color: "amber" } },
          { id: "mq", type: "canvasNode", position: { x: 530, y: 310 }, style: { width: 120, height: 75 }, data: { label: "Message Queue", shape: "hexagon", color: "amber" } },
          { id: "db", type: "canvasNode", position: { x: 740, y: 180 }, style: { width: 120, height: 75 }, data: { label: "NoSQL Database", shape: "cylinder", color: "purple" } },
          { id: "notif", type: "canvasNode", position: { x: 735, y: 310 }, style: { width: 130, height: 60 }, data: { label: "Notification Svc", shape: "rectangle", color: "green" } },
        ],
        edges: [
          { id: "e_gw_auth", source: "gw", target: "auth", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_gw_users", source: "gw", target: "users", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_gw_orders", source: "gw", target: "orders", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_gw_catalog", source: "gw", target: "catalog", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_users_db", source: "users", target: "db", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_catalog_db", source: "catalog", target: "db", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_catalog_redis", source: "catalog", target: "redis", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_orders_db", source: "orders", target: "db", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_orders_mq", source: "orders", target: "mq", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_mq_notif", source: "mq", target: "notif", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
        ],
      },
    }
  }

  if (isCicd) {
    return {
      content: `I've generated the **CI/CD Pipeline** workflow on your canvas!\n\nHere's an overview of the stages:\n- **GitHub Repo** — Code hosting with webhook triggers on push/PR\n- **Build Stage** — Compiles application assets and binaries\n- **Test Stage** — Linting, unit tests, integration tests, security scans\n- **Docker Build** — Multi-stage container image packaging\n- **Registry** — Versioned image artifact storage\n- **K8s Deploy** — Rolling deployment to Kubernetes cluster\n\nSwitch to the **Specs** tab for the full pipeline specification.`,
      specs: `# CI/CD Deployment Pipeline Specification\n\n## 1. Executive Summary\nAutomated continuous integration and deployment pipeline from code push to production Kubernetes deployment.\n\n## 2. Pipeline Stages\n\n### GitHub Repository\n- **Purpose**: Source code hosting and event triggering\n- **Events**: Push to \`main\`, pull request synchronization\n- **Hooks**: Webhook to CI runner on code events\n\n### Build Stage\n- **Purpose**: Compile application assets and static binaries\n- **Technology**: Bun/npm build, Webpack, Vite, or Go build\n- **Duration Target**: <2 minutes\n\n### Test Stage\n- **Purpose**: Code correctness validation\n- **Tasks**: Linter execution, unit tests, integration tests, SAST security scans\n- **Technology**: Jest, Vitest, or Playwright\n- **Gate**: Pipeline fails on any test failure\n\n### Docker Build\n- **Purpose**: Container image packaging\n- **Optimization**: Multi-stage builds to minimize image size (<100MB target)\n- **Tagging**: \`latest\`, git SHA, semantic version\n\n### Container Registry\n- **Purpose**: Artifact repository for versioned images\n- **Technology**: Docker Hub, Amazon ECR, or GitHub Container Registry\n- **Retention**: Keep last 10 tagged versions\n\n### Kubernetes Deployment\n- **Purpose**: Production cluster hosting\n- **Strategy**: Rolling update with zero-downtime\n- **Health Checks**: Readiness and liveness probes configured\n\n## 3. Execution Flow\n\`GitHub Push\` → \`Build\` → \`Test\` → \`Docker Build\` → \`Push to Registry\` → \`K8s Rolling Deploy\``,
      template: {
        nodes: [
          { id: "repo", type: "canvasNode", position: { x: 50, y: 100 }, style: { width: 85, height: 85 }, data: { label: "GitHub Repo", shape: "circle", color: "zinc" } },
          { id: "build", type: "canvasNode", position: { x: 200, y: 112 }, style: { width: 120, height: 60 }, data: { label: "Build Stage", shape: "rectangle", color: "blue" } },
          { id: "test", type: "canvasNode", position: { x: 380, y: 92 }, style: { width: 105, height: 105 }, data: { label: "Test Stage", shape: "diamond", color: "amber" } },
          { id: "docker", type: "canvasNode", position: { x: 545, y: 112 }, style: { width: 110, height: 75 }, data: { label: "Docker Build", shape: "hexagon", color: "teal" } },
          { id: "registry", type: "canvasNode", position: { x: 715, y: 118 }, style: { width: 130, height: 48 }, data: { label: "Registry", shape: "pill", color: "purple" } },
          { id: "deploy", type: "canvasNode", position: { x: 900, y: 105 }, style: { width: 100, height: 75 }, data: { label: "K8s Deploy", shape: "cylinder", color: "green" } },
        ],
        edges: [
          { id: "e_repo_build", source: "repo", target: "build", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_build_test", source: "build", target: "test", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_test_docker", source: "test", target: "docker", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_docker_registry", source: "docker", target: "registry", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_registry_deploy", source: "registry", target: "deploy", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
        ],
      },
    }
  }

  if (isEventDriven) {
    return {
      content: `I've generated the **Event-Driven Analytics** architecture on your canvas!\n\nHere's an overview of the event processing path:\n- **Web Client & API Ingestion** — Entry points for client actions and data\n- **Kafka Event Hub** — High-throughput stream ingestion (100K+ events/sec)\n- **Billing & Analytics Consumers** — Workers subscribing to topic payloads\n- **Data Warehouse** — Aggregated storage for BI reporting\n\nSwitch to the **Specs** tab for event schemas and processing topology details.`,
      specs: `# Event-Driven Analytics Specification\n\n## 1. Executive Summary\nHigh-throughput event-driven system for real-time analytics processing and billing automation.\n\n## 2. System Components\n\n### Web Client\n- **Purpose**: User-facing application emitting behavioral events\n- **Events**: Page views, clicks, purchases, form submissions\n\n### API Ingestion Layer\n- **Purpose**: Validates incoming HTTP payloads and translates to event streams\n- **Technology**: FastAPI / Express / Go\n- **Throughput**: 50K+ requests/second\n\n### Kafka Event Hub\n- **Purpose**: Scalable event streaming broker\n- **Topics**: \`orders\`, \`clicks\`, \`metrics\`, \`billing-events\`\n- **Retention**: 7 days default, 30 days for billing topics\n- **Partitioning**: By user ID for ordered processing\n\n### Billing Consumer\n- **Purpose**: Process payment events and update ledger\n- **Triggers**: Subscribes to \`orders\` and \`billing-events\` topics\n- **Guarantees**: Exactly-once processing semantics\n\n### Analytics Service\n- **Purpose**: Real-time aggregation, clickstream calculations\n- **Triggers**: Subscribes to \`clicks\` and \`metrics\` topics\n- **Output**: Materialized views for dashboard queries\n\n### Data Warehouse\n- **Purpose**: Historical storage and business intelligence\n- **Technology**: ClickHouse / Snowflake / BigQuery\n- **Ingestion**: Batch loads every 5 minutes from analytics service\n\n## 3. Event Flow\n\`Web Client\` → \`API Ingestion\` → \`Kafka Event Hub\` → \`Consumers (Billing, Analytics)\` → \`Data Warehouse\``,
      template: {
        nodes: [
          { id: "client", type: "canvasNode", position: { x: 50, y: 150 }, style: { width: 130, height: 48 }, data: { label: "Web Client", shape: "pill", color: "zinc" } },
          { id: "ingest", type: "canvasNode", position: { x: 240, y: 144 }, style: { width: 130, height: 60 }, data: { label: "API Ingestion", shape: "rectangle", color: "blue" } },
          { id: "kafka", type: "canvasNode", position: { x: 440, y: 136 }, style: { width: 120, height: 75 }, data: { label: "Kafka Event Hub", shape: "hexagon", color: "amber" } },
          { id: "billing", type: "canvasNode", position: { x: 640, y: 50 }, style: { width: 130, height: 60 }, data: { label: "Billing Consumer", shape: "rectangle", color: "teal" } },
          { id: "analytics", type: "canvasNode", position: { x: 640, y: 240 }, style: { width: 130, height: 60 }, data: { label: "Analytics Svc", shape: "rectangle", color: "teal" } },
          { id: "db", type: "canvasNode", position: { x: 840, y: 232 }, style: { width: 110, height: 75 }, data: { label: "Data Warehouse", shape: "cylinder", color: "purple" } },
        ],
        edges: [
          { id: "e_client_ingest", source: "client", target: "ingest", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_ingest_kafka", source: "ingest", target: "kafka", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_kafka_billing", source: "kafka", target: "billing", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_kafka_analytics", source: "kafka", target: "analytics", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
          { id: "e_analytics_db", source: "analytics", target: "db", type: "canvasEdge", markerEnd: { type: "arrowclosed", color: "#71717a" } },
        ],
      },
    }
  }

  if (hasHello) {
    return {
      content: `Welcome! I'm **Ghost AI**, your architecture copilot for **"${projectName}"**.\n\nI can help you with:\n- 🏗️ **System Architecture** — Design microservices, event-driven, or monolithic systems\n- 🔄 **CI/CD Pipelines** — Build automated deployment workflows\n- 🗄️ **Database Design** — Model schemas and data relationships\n- 🔐 **Authentication Flows** — Configure identity and access management\n\nTry one of the **AI Architect** presets, or describe what you'd like to build!`,
      specs: "",
      template: null,
    }
  }

  if (hasDatabase) {
    return {
      content: `For **"${projectName}"**, I recommend a clean relational model. Since we have **Prisma** set up with **PostgreSQL**, we can structure your data layer with proper relations and indexes.\n\nHere's what I suggest:\n- \`User\` model with email, name, and timestamps\n- \`Session\` model for auth session tracking\n- Proper **foreign keys** and **cascade deletes**\n- **Indexes** on frequently queried columns\n\nWould you like me to generate a full Prisma schema snippet?`,
      specs: `# Database Schema Specification\n\n## Proposed Models for "${projectName}"\n\n\`\`\`prisma\nmodel User {\n  id        String   @id @default(uuid())\n  email     String   @unique\n  name      String?\n  role      String   @default("member")\n  sessions  Session[]\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([email])\n  @@index([createdAt])\n}\n\nmodel Session {\n  id        String   @id @default(uuid())\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  token     String   @unique\n  expiresAt DateTime\n  createdAt DateTime @default(now())\n\n  @@index([userId])\n  @@index([expiresAt])\n}\n\`\`\``,
      template: null,
    }
  }

  if (hasAuth) {
    return {
      content: `Ghost AI is configured with **Clerk** for secure session authentication.\n\nHere's how auth works in your project:\n- **Identity Provider**: Clerk handles registration, sign-in, and MFA\n- **Session Management**: JWT-based with server-side validation\n- **Access Control**: RBAC with Owner and Collaborator tiers\n- **Protected Routes**: Server-side redirects via Clerk middleware\n\nWould you like me to customize the role system or add additional access tiers?`,
      specs: `# Authentication Architecture Specification\n\n## Identity Provider\n- **Service**: Clerk Auth\n- **Session Type**: JWT with server-side validation\n- **MFA**: Supported via Clerk dashboard configuration\n\n## Access Control\n- **Model**: Role-Based Access Control (RBAC)\n- **Roles**: Owner (full access), Collaborator (read/write), Viewer (read-only)\n- **Enforcement**: Middleware-level checks on all protected routes\n\n## Session Flow\n1. User signs in via Clerk UI components\n2. Clerk issues JWT token\n3. Server validates JWT on each request\n4. User identity available via \`auth()\` helper`,
      template: null,
    }
  }

  if (hasApi) {
    return {
      content: `Your project has the following **API routes** already configured:\n\n- \`GET /api/projects\` — List all user projects\n- \`POST /api/projects\` — Create a new project\n- \`DELETE /api/projects/[id]\` — Delete a project\n- \`POST /api/projects/[id]/collaborators\` — Add a collaborator\n- \`POST /api/chat\` — AI assistant chat\n- \`POST /api/specs/generate\` — Generate specifications\n\nWould you like me to design additional microservice endpoints?`,
      specs: `# API Routes Specification\n\n## Existing Endpoints\n| Method | Path | Purpose |\n|--------|------|--------|\n| GET | \`/api/projects\` | List all projects for authenticated user |\n| POST | \`/api/projects\` | Create a new project |\n| DELETE | \`/api/projects/[id]\` | Delete a project (owner only) |\n| POST | \`/api/projects/[id]/collaborators\` | Add collaborator by email |\n| POST | \`/api/chat\` | AI assistant chat with context |\n| POST | \`/api/specs/generate\` | Generate specifications from canvas |`,
      template: null,
    }
  }

  // Generic response for any other prompt
  return {
    content: `I've analyzed your request for **"${projectName}"**.\n\nTo create a detailed architecture, try asking me to:\n- **"Design an e-commerce backend"** — Full microservices architecture\n- **"Create a CI/CD pipeline"** — Automated deployment workflow\n- **"Set up an event-driven system"** — Kafka/message queue architecture\n\nOr describe your specific system requirements and I'll design a custom architecture for you. You can also use the **AI Architect** presets on the left for one-click architectures.`,
    specs: "",
    template: null,
  }
}
