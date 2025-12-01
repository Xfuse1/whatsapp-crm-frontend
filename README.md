# Awfar CRM Frontend

A modern, clean frontend for the Awfar WhatsApp CRM system built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@supabase/supabase-js** - Browser client for authentication
- **socket.io-client** - Real-time communication with backend
- **qrcode.react** - QR code rendering for WhatsApp connection

## Project Structure

```
awfar-crm-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login page with Arabic RTL design
│   │   │   └── register/page.tsx       # Registration page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Dashboard layout with sidebar & topbar
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── whatsapp/page.tsx       # WhatsApp connection page
│   │   │   ├── chat/page.tsx           # Chat interface
│   │   │   └── ai-agent/page.tsx       # AI agent configuration
│   │   ├── layout.tsx                  # Root layout (RTL, Arabic)
│   │   ├── globals.css                 # Global styles with Tailwind
│   │   └── page.tsx                    # Root redirect
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Topbar.tsx              # Top navigation bar
│   │   │   └── Sidebar.tsx             # Side navigation menu
│   │   ├── auth/
│   │   │   └── AuthCard.tsx            # Reusable auth card component
│   │   └── whatsapp/
│   │       └── WhatsAppConnectionCard.tsx # WhatsApp connection UI
│   ├── lib/
│   │   ├── env.ts                      # Environment variables helper
│   │   ├── supabaseClient.ts           # Supabase browser client
│   │   ├── apiClient.ts                # API client wrapper
│   │   └── socket.ts                   # Socket.io client
│   └── types/
│       └── whatsapp.ts                 # WhatsApp-related types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from the example:
   ```bash
   cp .env.local.example .env.local
   ```

3. Configure your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build
```bash
npm run build
npm start
```

## Features

### Authentication (Arabic RTL)
- ✅ Login page with email/password
- ✅ Registration page with validation
- ✅ Supabase authentication integration
- ✅ Arabic-first design with RTL support
- ✅ Landing page design with feature cards

### Dashboard
- ✅ Top navigation bar with user info
- ✅ Right-side sidebar (RTL) with menu items
- ✅ Responsive layout
- ✅ Arabic labels throughout

### WhatsApp Connection
- ✅ Connection status checking
- ✅ QR code display for pairing
- ✅ Real-time status updates via Socket.io
- ✅ Automatic polling for QR code
- ✅ Success state with navigation to chats

### Chat Interface (Placeholder)
- ✅ Chat list with dummy data
- ✅ Message area layout
- ✅ Real-time message subscription
- 🔜 Integration with actual WhatsApp messages

### AI Agent (Placeholder)
- ✅ Basic UI structure
- 🔜 Configuration interface
- 🔜 Auto-reply rules

## API Integration

The frontend communicates with the backend at `NEXT_PUBLIC_API_BASE_URL`:

- `GET /api/whatsapp/status` - Check connection status
- `GET /api/whatsapp/qr` - Get QR code for pairing
- `POST /api/whatsapp/send` - Send a message

## Real-time Events

Socket.io events listened to:
- `whatsapp:ready` - WhatsApp session connected
- `whatsapp:qr` - QR code received
- `message:incoming` - New message received
- `whatsapp:disconnected` - Session disconnected

## TODO / Future Enhancements

- [ ] Add authentication guards for protected routes
- [ ] Implement full chat message integration
- [ ] Add AI agent configuration UI
- [ ] Contact management
- [ ] Message templates
- [ ] Analytics dashboard
- [ ] Multi-language support (beyond Arabic)
- [ ] Dark mode support
- [ ] Mobile responsive improvements

## Design System

**Colors:**
- Primary: Green (`#22c55e` and variants)
- Background: Light mint green (`#f0fdf4`)
- Text: Gray scale

**Typography:**
- Arabic-friendly fonts (Segoe UI, Tahoma, Arial)
- RTL text direction
- Consistent sizing and spacing

## License

MIT
