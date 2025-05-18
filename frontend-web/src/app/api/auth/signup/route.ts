import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields: firstName, lastName, email, or password." },
        { status: 400 }
      );
    }

    // Ensure your Java backend is running and accessible at this URL
    // You might want to move this URL to an environment variable
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080/api/auth/signup";

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const backendResult = await backendResponse.json();

    if (!backendResponse.ok) {
      // Forward the error message from the backend
      return NextResponse.json(
        { message: backendResult.message || "Backend signup failed." },
        { status: backendResponse.status }
      );
    }

    // Forward the success response from the backend
    return NextResponse.json(backendResult, { status: backendResponse.status });

  } catch (error: any) {
    console.error("Error in /api/auth/signup:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
} 