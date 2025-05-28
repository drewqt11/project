import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required." },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080/api/auth/profile";

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    });

    const backendResult = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: backendResult.message || "Failed to fetch profile." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(backendResult, { status: backendResponse.status });

  } catch (error: any) {
    console.error("Error in /api/auth/profile GET:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred while fetching profile." },
      { status: 500 }
    );
  }
}

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
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080/api/auth/profile";

    const backendResponse = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const backendResult = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: backendResult.message || "Failed to update profile." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(backendResult, { status: backendResponse.status });

  } catch (error: any) {
    console.error("Error in /api/auth/profile PUT:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred while updating profile." },
      { status: 500 }
    );
  }
} 