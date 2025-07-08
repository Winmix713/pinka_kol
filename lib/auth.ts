import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"

// Mock user database - in production, use a real database
interface User {
  id: string
  email: string
  name: string
  password?: string
  provider: "credentials" | "google" | "github"
  figmaToken?: string
  preferences: {
    theme: "light" | "dark"
    language: "en" | "hu"
    defaultExportFormat: "tsx" | "jsx"
    autoSave: boolean
  }
  subscription: {
    plan: "free" | "pro" | "enterprise"
    exportsUsed: number
    exportsLimit: number
    resetDate: string
  }
  createdAt: string
  lastLoginAt?: string
}

const users: User[] = [
  {
    id: "demo-user-1",
    email: "demo@figmaexport.com",
    name: "Demo User",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // "demo123"
    provider: "credentials",
    preferences: {
      theme: "light",
      language: "en",
      defaultExportFormat: "tsx",
      autoSave: true,
    },
    subscription: {
      plan: "pro",
      exportsUsed: 15,
      exportsLimit: 100,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = users.find((u) => u.email === credentials.email && u.provider === "credentials")

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        // Update last login
        user.lastLoginAt = new Date().toISOString()

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // First time login
        let dbUser = users.find((u) => u.email === user.email)

        if (!dbUser && account.provider !== "credentials") {
          // Create new user for OAuth providers
          dbUser = {
            id: `${account.provider}-${Date.now()}`,
            email: user.email!,
            name: user.name || "Unknown User",
            provider: account.provider as "google" | "github",
            preferences: {
              theme: "light",
              language: "en",
              defaultExportFormat: "tsx",
              autoSave: true,
            },
            subscription: {
              plan: "free",
              exportsUsed: 0,
              exportsLimit: 10,
              resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          }
          users.push(dbUser)
        }

        if (dbUser) {
          token.userId = dbUser.id
          token.subscription = dbUser.subscription
          token.preferences = dbUser.preferences
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        const user = users.find((u) => u.id === token.userId)
        if (user) {
          session.user.id = user.id
          session.user.subscription = user.subscription
          session.user.preferences = user.preferences
          session.user.figmaToken = user.figmaToken
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",


    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
}

// Helper functions for user management
export async function createUser(email: string, password: string, name: string): Promise<User> {
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    name,
    password: hashedPassword,
    provider: "credentials",
    preferences: {
      theme: "light",
      language: "en",
      defaultExportFormat: "tsx",
      autoSave: true,
    },
    subscription: {
      plan: "free",
      exportsUsed: 0,
      exportsLimit: 10,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  return newUser
}

export async function getUserById(id: string): Promise<User | null> {
  return users.find((u) => u.id === id) || null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) return null

  users[userIndex] = { ...users[userIndex], ...updates }
  return users[userIndex]
}

export async function updateUserFigmaToken(id: string, token: string): Promise<boolean> {
  const user = await getUserById(id)
  if (!user) return false

  await updateUser(id, { figmaToken: token })
  return true
}

export async function checkExportLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const user = await getUserById(userId)
  if (!user) return { allowed: false, remaining: 0 }

  const { exportsUsed, exportsLimit, resetDate } = user.subscription

  // Check if reset date has passed
  if (new Date() > new Date(resetDate)) {
    await updateUser(userId, {
      subscription: {
        ...user.subscription,
        exportsUsed: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    })
    return { allowed: true, remaining: exportsLimit }
  }

  const remaining = exportsLimit - exportsUsed
  return { allowed: remaining > 0, remaining }
}

export async function incrementExportUsage(userId: string): Promise<boolean> {
  const user = await getUserById(userId)
  if (!user) return false

  const { allowed } = await checkExportLimit(userId)
  if (!allowed) return false

  await updateUser(userId, {
    subscription: {
      ...user.subscription,
      exportsUsed: user.subscription.exportsUsed + 1,
    },
  })

  return true
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      subscription: User["subscription"]
      preferences: User["preferences"]
      figmaToken?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    subscription: User["subscription"]
    preferences: User["preferences"]
  }
}
