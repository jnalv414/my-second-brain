# Design System - Voxa Theme

This document defines the design system requirements for the My Second Brain frontend, based on the Voxa chat interface.

## Color Palette

### Brand Colors
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `primary` | `#339989` | `51, 153, 137` | Primary actions, accents, active states |
| `secondary` | `#7de2d1` | `125, 226, 209` | Gradients, highlights |

### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `background-light` | `#f8f9fa` | Main background |
| `surface-light` | `#ffffff` | Cards, elevated surfaces |
| `text-light` | `#131515` | Primary text |

### Dark Mode (Default)
| Token | Hex | Usage |
|-------|-----|-------|
| `background-dark` | `#131515` | Main background |
| `surface-dark` | `#2b2c28` | Cards, sidebar items, input backgrounds |
| `sidebar-dark` | `#0c0d0d` | Sidebar background |
| `text-dark` | `#fffafb` | Primary text |

### Neutral Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `gray-100` | `#f3f4f6` | - | Hover states |
| `gray-200` | `#e5e7eb` | - | User message bubbles |
| `gray-400` | `#9ca3af` | `#9ca3af` | Secondary text, icons |
| `gray-500` | `#6b7280` | `#6b7280` | Muted text |
| `gray-600` | `#4b5563` | `#4b5563` | Inactive nav items |
| `gray-700` | `#374151` | `#374151` | Borders dark mode |
| `gray-800` | - | `#1f2937` | Border subtle |

## Typography

### Font Family
```css
font-family: 'Inter', sans-serif;
```

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Text Sizes
| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Labels, badges, disclaimers |
| `text-sm` | 14px | 20px | Nav items, secondary text |
| `text-base` | 16px | 24px | Body text, messages |
| `text-lg` | 18px | 28px | Highlighted quotes |
| `text-xl` | 20px | 28px | Headings |
| `text-2xl` | 24px | 32px | Page titles |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 8px (0.5rem) | Default |
| `rounded-xl` | 12px (0.75rem) | Buttons, inputs |
| `rounded-2xl` | 16px (1rem) | Cards |
| `rounded-3xl` | 24px (1.5rem) | Message bubbles |
| `rounded-full` | 9999px | Avatars, badges |

## Shadows

```css
/* Card shadow */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Elevated shadow */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

## Component Specifications

### Sidebar
- Width: `w-72` (288px)
- Background: `#0c0d0d` (dark) / `white` (light)
- Border: `border-r border-gray-200 dark:border-gray-800/50`

### Navigation Items
```css
/* Default */
px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400

/* Hover */
hover:bg-gray-100 dark:hover:bg-surface-dark

/* Active */
bg-gray-200 dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm
```

### Search Input
```css
bg-gray-100 dark:bg-surface-dark/50
text-sm rounded-xl border-none
py-2.5 pl-10 pr-4
focus:ring-1 focus:ring-primary
```

### Message Bubbles

#### User Message (Right-aligned)
```css
max-w-2xl bg-gray-200 dark:bg-surface-dark
text-gray-900 dark:text-gray-100
px-6 py-4 rounded-3xl rounded-tr-md shadow-sm
```

#### AI Message (Left-aligned)
```css
/* Avatar */
w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary

/* Content wrapper */
flex-1 space-y-6
```

### Chat Input Area
```css
/* Container */
bg-white dark:bg-[#1e2020] rounded-2xl shadow-lg
border border-gray-200 dark:border-gray-700/50
focus-within:ring-1 focus-within:ring-primary/50

/* Textarea */
bg-transparent border-none
focus:ring-0 p-4 resize-none

/* Send button */
p-2 bg-primary hover:bg-opacity-90 text-white rounded-xl shadow-md
```

### Action Buttons
```css
/* Icon button */
p-2 text-gray-400
hover:text-primary hover:bg-gray-100 dark:hover:bg-surface-dark
rounded-lg transition-colors

/* Icon size */
text-[20px] (Material Icons)
```

### User Profile Badge
```css
/* Avatar */
w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary
flex items-center justify-center text-xs text-white font-bold

/* Online indicator */
w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full
```

## Icons
Using **Material Icons Outlined**

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
```

Common icons:
- `edit_square` - New chat
- `space_dashboard` - Dashboard
- `search` - Search
- `folder_open` - Projects
- `chat_bubble_outline` - Chats (active)
- `chat` - Chat history item
- `grid_view` - Templates
- `settings` - Settings
- `group` - Teams
- `smart_toy` - AI avatar
- `content_copy` - Copy
- `thumb_up` / `thumb_down` - Feedback
- `volume_up` - Text to speech
- `cached` - Regenerate
- `add_circle_outline` - Add attachment
- `image` - Image upload
- `mic` - Voice input
- `send` - Send message
- `diamond` - Credits/tokens
- `auto_awesome` - AI sparkle

## Animations & Transitions

```css
/* Default transition */
transition-colors

/* Full transition */
transition-all

/* Fade in up animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out;
}
```

## Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #2b2c28;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #339989;
}
```

## Gradient Overlays

```css
/* Top-right ambient glow */
bg-gradient-to-bl from-[#1c383d] via-transparent to-transparent opacity-60

/* Bottom fade for input area */
bg-gradient-to-t from-white via-white to-transparent
dark:from-background-dark dark:via-background-dark dark:to-transparent
```

## Selection Styling

```css
selection:bg-primary selection:text-white
```

## Tailwind Config

```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#339989",
        secondary: "#7de2d1",
        "background-light": "#f8f9fa",
        "background-dark": "#131515",
        "surface-light": "#ffffff",
        "surface-dark": "#2b2c28",
        "text-light": "#131515",
        "text-dark": "#fffafb",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
};
```

## shadcn/ui Theme Variables

For shadcn/ui integration, use these CSS variables in `globals.css`:

```css
@layer base {
  :root {
    --background: 248 249 250; /* #f8f9fa */
    --foreground: 19 21 21; /* #131515 */
    --card: 255 255 255; /* #ffffff */
    --card-foreground: 19 21 21;
    --popover: 255 255 255;
    --popover-foreground: 19 21 21;
    --primary: 153 51 137; /* #339989 as HSL approx */
    --primary-foreground: 255 255 255;
    --secondary: 125 226 209; /* #7de2d1 */
    --secondary-foreground: 19 21 21;
    --muted: 243 244 246;
    --muted-foreground: 107 114 128;
    --accent: 243 244 246;
    --accent-foreground: 19 21 21;
    --destructive: 239 68 68;
    --destructive-foreground: 255 255 255;
    --border: 229 231 235;
    --input: 229 231 235;
    --ring: 51 153 137; /* primary */
    --radius: 0.5rem;
  }

  .dark {
    --background: 19 21 21; /* #131515 */
    --foreground: 255 250 251; /* #fffafb */
    --card: 43 44 40; /* #2b2c28 */
    --card-foreground: 255 250 251;
    --popover: 43 44 40;
    --popover-foreground: 255 250 251;
    --primary: 51 153 137; /* #339989 */
    --primary-foreground: 255 255 255;
    --secondary: 125 226 209;
    --secondary-foreground: 19 21 21;
    --muted: 43 44 40;
    --muted-foreground: 156 163 175;
    --accent: 43 44 40;
    --accent-foreground: 255 250 251;
    --destructive: 239 68 68;
    --destructive-foreground: 255 255 255;
    --border: 55 65 81;
    --input: 43 44 40;
    --ring: 51 153 137;
  }
}
```

## Usage Notes

1. **Dark mode is default** - Apply `dark` class to `<html>` element
2. **Font loading** - Load Inter from Google Fonts
3. **Icon set** - Use Material Icons Outlined consistently
4. **Gradients** - Use primary-to-secondary gradients for avatars and accents
5. **Transitions** - Apply `transition-colors` or `transition-all` for smooth interactions
