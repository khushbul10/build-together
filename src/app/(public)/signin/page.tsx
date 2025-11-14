"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // This is the core NextAuth.js sign-in function
    const result = await signIn("credentials", {
      redirect: false, // We will handle redirect manually
      email,
      password,
    });

    if (result?.error) {
      // If NextAuth.js returns an error, it will be in result.error
      // This is *before* it redirects to the error page.
      // We can show a simple error here, or let it redirect.
      
      // For this example, we'll let NextAuth's redirect handle it
      // by navigating to the error page it specifies
      
      // A-ha! A better way: check result.error
      // and update local state
      if (result.error === "CredentialsSignin") {
         setError("Invalid email or password.");
      } else {
         setError("Something went wrong. Please try again.");
      }

      // If you want to force redirect to your custom error page:
      // router.push(`/auth/error?error=${result.error}`);

    } else if (result?.ok) {
      // Sign-in was successful
      router.push("/"); // Redirect to homepage or dashboard
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Sign In</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <hr />
      
      <h3>Or Sign in with:</h3>
      <button onClick={() => signIn("google", { callbackUrl: "/" })}>
        Sign in with Google
      </button>

      <p>
        Don't have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}