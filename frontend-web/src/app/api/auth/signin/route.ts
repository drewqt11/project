import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields: email or password." },
        { status: 400 }
      );
    }

    // Ensure your Java backend is running and accessible at this URL
    // You might want to move this URL to an environment variable
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080/api/auth/signin";

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const backendResult = await backendResponse.json();

    if (!backendResponse.ok) {
      // Forward the error message from the backend
      return NextResponse.json(
        { message: backendResult.message || "Backend signin failed." },
        { status: backendResponse.status }
      );
    }

    // Transform the backend response to match frontend expectations
    const transformedResult = {
      token: backendResult.token,
      refreshToken: backendResult.refreshToken,
      id: backendResult.userId, // Map userId to id
      email: backendResult.email,
      firstName: backendResult.firstName,
      lastName: backendResult.lastName,
      // Include other fields from backendResult if needed by the frontend in the future
      // For example, if 'type' is needed: type: backendResult.type
    };

    // Forward the transformed success response to the frontend
    return NextResponse.json(transformedResult, { status: backendResponse.status });

  } catch (error: any) {
    console.error("Error in /api/auth/signin:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred during sign-in." },
      { status: 500 }
    );
  }
} 