// User data hooks with basic fetch (no external dependencies)

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  auth0Id: string;
  name?: string;
  profilePhoto?: string;
  discoveredPosts: string[];
  createdAt: Date;
}

export function useUser() {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const result = await response.json();
          setData(result.user);
        } else if (response.status !== 401) {
          setError('Failed to fetch user');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { data, isLoading, error };
}

export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: { name?: string; profilePhoto?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading };
}

export function useUpdateUser() {
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userData: { name?: string; profilePhoto?: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateUser, isLoading };
}
