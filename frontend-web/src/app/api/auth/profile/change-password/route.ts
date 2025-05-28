import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080/api/auth/profile/change-password";

    const backendResponse = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const backendResult = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: backendResult.message || "Failed to change password." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(backendResult, { status: backendResponse.status });

  } catch (error: any) {
    console.error("Error in /api/auth/profile/change-password:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred while changing password." },
      { status: 500 }
    );
  }
} 