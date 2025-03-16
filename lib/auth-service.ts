import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import User from "@/models/user"
import connectToDatabase from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function register(
  name: string,
  email: string,
  password: string,
  role: string,
  specialization?: string,
  licenseNumber?: string,
) {
  await connectToDatabase()

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Create new user
  const userData: any = {
    name,
    email,
    password,
    role,
  }

  // Add doctor-specific fields if applicable
  if (role === "doctor") {
    userData.specialization = specialization
    userData.licenseNumber = licenseNumber
    userData.approved = false // Doctors need approval
  }

  const user = await User.create(userData)

  // Generate JWT token
  const token = await generateToken(user._id.toString())

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
    },
    token,
  }
}

export async function login(email: string, password: string) {
  await connectToDatabase()

  // Find user by email
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error("Invalid email or password")
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error("Invalid email or password")
  }

  // Check if doctor is approved
  if (user.role === "doctor" && !user.approved) {
    throw new Error("Your account is pending approval")
  }

  // Generate JWT token
  const token = await generateToken(user._id.toString())

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  }
}

export async function logout() {
  // In a client-side context, we'd clear localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }

  // In a server-side context, we'd clear the cookie
  cookies().delete("auth_token")

  return { success: true }
}

export async function checkSession(request?: NextRequest) {
  // For client-side
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    const userJson = localStorage.getItem("user")

    if (!token || !userJson) {
      return null
    }

    try {
      return JSON.parse(userJson)
    } catch (error) {
      return null
    }
  }

  // For server-side
  try {
    const token = request ? request.cookies.get("auth_token")?.value : cookies().get("auth_token")?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

    if (!payload.sub) {
      return null
    }

    await connectToDatabase()
    const user = await User.findById(payload.sub).select("-password")

    if (!user) {
      return null
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    return null
  }
}

export async function generateToken(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return payload
  } catch (error) {
    return null
  }
}

export async function getUserById(userId: string) {
  await connectToDatabase()
  const user = await User.findById(userId).select("-password")

  if (!user) {
    throw new Error("User not found")
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    approved: user.approved,
    specialization: user.specialization,
    licenseNumber: user.licenseNumber,
  }
}

