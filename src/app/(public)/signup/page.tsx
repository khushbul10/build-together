"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // We'll use this for the "bonus" step

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // 1. Send data to our register API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle errors (e.g., user already exists)
        setError(data.message || "Something went wrong.");
        return;
      }

      // 2. Set success message
      setSuccess(data.message);
      
      // 3. (Bonus) Automatically sign the user in
      // After successful registration, we can sign them in immediately
      const signInResponse = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false, // Don't redirect, we'll do it manually
      });

      if (signInResponse?.error) {
        setError(`Registration successful, but sign-in failed: ${signInResponse.error}`);
        // Redirect to sign-in page just in case
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        // Sign-in successful, redirect to dashboard
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => router.push("/"), 2000); // Redirect to homepage or dashboard
      }

    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}