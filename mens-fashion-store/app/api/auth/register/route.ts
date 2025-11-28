import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    const { email, password, name, phone } = validation.data;

    // Register user
    const result = await registerUser({
      email,
      password,
      name,
      phone,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Registration failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Registration successful',
      user: result.user,
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
