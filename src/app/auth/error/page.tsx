"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error") || "AccessDenied";

  const friendlyMessage = (() => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return "This social account is already linked to another user. Try signing in with the original provider.";
      case "AccessDenied":
        return "Access was denied. You might need to allow the requested permissions or try again.";
      case "Configuration":
        return "There is a configuration issue with the authentication provider. Contact an administrator.";
      case "Verification":
        return "Failed to verify your credentials. Check your email and try again.";
      default:
        return "An error occurred during authentication. Please try again or contact support.";
    }
  })();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="max-w-xl w-full bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/6">
        <h1 className="text-2xl font-bold mb-2">Authentication error</h1>
        <p className="text-sm text-slate-300 mb-4">{friendlyMessage}</p>
        <div className="text-xs text-slate-400">(Error code: <code className="text-xs text-rose-300">{error}</code>)</div>
        <div className="mt-6 flex gap-3">
          <a href="/signin" className="px-4 py-2 rounded bg-indigo-600 text-white">Back to sign in</a>
          <a href="/" className="px-4 py-2 rounded border border-white/10 text-white">Home</a>
        </div>
      </div>
    </main>
  );
}
