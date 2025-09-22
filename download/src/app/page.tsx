
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from '@/components/Logo';

// A simple SVG icon for Google
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.4 69.4c-22.3-21.5-52.6-34.5-87.8-34.5-69.3 0-125.5 56.2-125.5 125.5s56.2 125.5 125.5 125.5c80.6 0 115.4-59.4 119.2-88.8H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
  </svg>
);

function LoginPageContent() {
  const router = useRouter();
  const [role, setRole] = useState('faculty');

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd handle authentication here
    router.push(`/dashboard?role=${role}`);
  };

  return (
     <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col space-y-4 text-center md:text-left">
          <Logo className="justify-center md:justify-start" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Welcome to TimeWise
          </h1>
          <p className="text-muted-foreground md:text-lg">
            The intelligent, AI-powered platform for seamless academic timetable generation. Streamline scheduling, resolve conflicts, and optimize resource allocation with ease.
          </p>
        </div>

        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Role selection is for simulation purposes.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit">Login</Button>
              <Button variant="outline" className="w-full" type="button">
                <GoogleIcon />
                Sign in with Google
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <LoginPageContent /> : null;
}
