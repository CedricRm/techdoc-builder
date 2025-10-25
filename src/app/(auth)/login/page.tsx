"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInUser } from "@/features/auth/services/authService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signInUser(form);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    // ✅ Connexion réussie → on redirige
    router.push("/app/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Tech Doc Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Nouveau ici ?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>
          {error && (
            <p className="mt-2 text-center text-sm text-destructive">{error}</p>
          )}
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </Card>
    </div>
  );
}
