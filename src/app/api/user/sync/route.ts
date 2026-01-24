// User API endpoint - Basic implementation

import { NextRequest, NextResponse } from 'next/server';
import { findOrCreateUser, getUserByAuth0Id, updateUser } from '@/lib/services/user-service';

export async function GET(request: NextRequest) {
  try {
    // For now, let's create a test user since Auth0 session is not working
    const testUser = await getUserByAuth0Id('test-user-123');
    
    if (!testUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: testUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth0Id, name, profilePhoto } = body;

    // Create or update user
    const user = await findOrCreateUser({
      auth0Id: auth0Id || 'test-user-123', // Default for testing
      name,
      profilePhoto,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth0Id, ...updateData } = body;

    const user = await updateUser(auth0Id || 'test-user-123', updateData);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}