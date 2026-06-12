import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/booking-success")({
  head: () => ({
    meta: [
      { title: "Booking Confirmed — Nach Firiri" },
    ],
  }),
  component: BookingSuccessPage,
});

function BookingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gold)]/15 mb-6">
        <CheckCircle2 className="h-10 w-10 text-[var(--gold)]" />
      </div>

      <h1 className="font-display text-4xl font-semibold text-[var(--ivory)] sm:text-5xl">
        You're In! 🎉
      </h1>

      <p className="mt-4 font-body text-lg text-[var(--ivory)]/70 max-w-md">
        Your spot is confirmed. Check your email for booking details.
        See you on the floor! 💃
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button variant="gold" size="lg" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
        <Button variant="goldOutline" size="lg" asChild>
          <Link to="/workshops">View All Workshops</Link>
        </Button>
      </div>
    </div>
  );
}
