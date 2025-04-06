import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ success: false, message: "ID token is required" }, { status: 400 })
    }

    // Send the Firebase ID token to your backend
    const response = await fetch(`${API_URL}/api/v1/auth/firebase-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    })

    const data = await response.json()

    // If the backend returns a JWT token, set it as a cookie
    if (data.success) {
      // The backend should handle setting the HTTP-only cookie
      return NextResponse.json(data, { status: 200 })
    } else {
      return NextResponse.json(
        { success: false, message: data.message || "Firebase authentication failed" },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Firebase login error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during Firebase authentication" },
      { status: 500 },
    )
  }
}

