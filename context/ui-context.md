
---

## File: `ui-context.md`

```markdown
# UI Context

## Design System

### Color Palette
- **Primary**: `#000000` (black) / `#ffffff` (white)
- **Accent**: [Your brand color, e.g., `#6366f1` indigo]
- **Background**: `#ffffff` (light) / `#0a0a0a` (dark)
- **Surface**: `#f5f5f5` (light) / `#171717` (dark)
- **Text Primary**: `#171717` (light) / `#fafafa` (dark)
- **Text Secondary**: `#737373` (light) / `#a3a3a3` (dark)
- **Border**: `#e5e5e5` (light) / `#262626` (dark)
- **Success**: `#22c55e`
- **Warning**: `#f59e0b`
- **Error**: `#ef4444`

### Typography
- **Font**: Inter (or Geist for Next.js 15)
- **Headings**: font-semibold, tracking-tight
- **Body**: font-normal, leading-relaxed
- **Small/Caption**: text-sm, text-muted-foreground

### Spacing Scale
- Use Tailwind's default spacing (4 = 1rem = 16px)
- Container max-width: `max-w-7xl`
- Section padding: `py-12` to `py-24`
- Card padding: `p-6`
- Gap between elements: `gap-4` to `gap-6`

## Component Library (Shadcn/ui)

### Always Available Components
- Button (`variant`: default, secondary, ghost, destructive, outline, link)
- Input / Textarea
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Dialog, AlertDialog
- DropdownMenu
- Badge
- Avatar
- Skeleton
- Toast / Sonner
- Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- Select, Switch, Checkbox, RadioGroup
- Tabs, Accordion
- Sheet, Drawer
- Tooltip, Popover

### Custom Components
Build these on top of Shadcn/ui primitives:
- `PageHeader` — Consistent page title + description + actions
- `EmptyState` — Illustration + text + CTA for empty lists
- `LoadingState` — Skeleton or spinner with text
- `ErrorState` — Error message with retry button
- `DataTable` — Sortable, filterable table
- `SearchInput` — Debounced search with icon

## Layout Patterns

### Page Layout
```tsx
<div className="container mx-auto px-4 py-8">
  <PageHeader
    title="Page Title"
    description="What this page does"
    action={<Button>Create New</Button>}
  />
  <div className="mt-8">
    {/* Page content */}
  </div>
</div>

### Card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item._id}>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>{/* Content */}</CardContent>
    </Card>
  ))}
</div>

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>

## Animation Guidelines
Use framer-motion for complex animations
Keep animations under 300ms
Use ease-out for entrances, ease-in for exits
Respect prefers-reduced-motion
### Responsive Breakpoints
Mobile first approach
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
## Accessibility
All interactive elements must be keyboard accessible
Use proper heading hierarchy (h1 → h2 → h3)
Include aria-labels for icon-only buttons
Ensure color contrast ratio ≥ 4.5:1
Support screen readers with proper semantic HTML