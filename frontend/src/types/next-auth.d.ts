import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
    }
  }
}

// Declare ElevenLabs Convai custom element
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'agent-id': string
    }, HTMLElement>
  }
} 