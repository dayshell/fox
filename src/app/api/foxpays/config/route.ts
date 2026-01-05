import { NextRequest, NextResponse } from 'next/server';

// This route is used to get FoxPays config from client-side localStorage
// and pass it to server-side API routes via headers

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiUrl, accessToken } = body;

    if (!apiUrl || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing API URL or Access Token' },
        { status: 400 }
      );
    }

    // Test connection
    const response = await fetch(`${apiUrl}/api/currencies`, {
      headers: {
        'Accept': 'application/json',
        'Access-Token': accessToken,
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: data.success === true,
      data: data.data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Connection failed' },
      { status: 500 }
    );
  }
}
