import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);

export function EmailCapture({ placeholder = "Your email", cta = "Join Waitlist" }: { placeholder?: string; cta?: string }) {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    toast.success("You're on the list! 💛 We'll be in touch.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        maxLength={255}
        className="flex-1 rounded-md border border-[var(--border)] bg-[var(--input)] px-4 py-3 font-body text-sm text-[var(--ivory)] outline-none transition-colors placeholder:text-[var(--ivory)]/40 focus:border-[var(--gold)]"
      />
      <Button type="submit" variant="gold" size="lg">{cta}</Button>
    </form>
  );
}
