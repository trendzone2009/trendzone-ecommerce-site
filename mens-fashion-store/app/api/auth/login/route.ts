import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validation.error.errors.map(e => ({
            field: e.path[0],
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Login user
    const result = await loginUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Login failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Login successful',
      user: result.user,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
