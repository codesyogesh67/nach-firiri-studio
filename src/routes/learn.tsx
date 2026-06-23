import { createFileRoute } from "@tanstack/react-router";
import { useUser, useAuth, SignInButton } from "@clerk/clerk-react";
import { BunnyPlayer } from "@/components/BunnyPlayer";
import { CoursePaymentModal } from "@/components/CoursePaymentModal";
import { useState, useEffect } from "react";

const FREE_VIDEO_ID = "cdba194d-8241-4cc1-8f92-80df9df5a806";
const PAID_VIDEO_ID = "ead8ac34-300f-4099-b5ff-b1e50d8f8db4";
const COURSE_ID = "course-001";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

function LearnPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const [activeVideo, setActiveVideo] = useState<"free" | "paid" | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    async function checkEnrollment() {
      if (!isLoaded) return;
      if (!isSignedIn || !user) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const clerkToken = await getToken();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-enrollment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${clerkToken}`,
            },
            body: JSON.stringify({
              userId: user.id,
              courseId: COURSE_ID,
            }),
          }
        );
        const data = await res.json();
        setEnrolled(data.enrolled);
      } catch (err) {
        console.error("Enrollment check failed:", err);
      } finally {
        setCheckingEnrollment(false);
      }
    }

    checkEnrollment();
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      {/* Hero Header */}
      <div className="relative pt-32 pb-16 px-6 text-center border-b border-[var(--gold)]/10">
        <p className="font-deva text-[var(--gold)] text-sm tracking-widest mb-3">
          सिक्नुहोस् • शिक्षा
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-[var(--ivory)] mb-4">
          Learn with Swastika
        </h1>
        <p className="text-[var(--ivory)]/50 text-lg max-w-xl mx-auto font-body">
          Structured tutorials rooted in Nepali & South Asian movement. Learn at
          your own pace, wherever you are.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Free Video Section */}
        <div className="mb-6">
          <span className="font-body text-xs tracking-[0.2em] uppercase text-[var(--gold)]/60">
            Free to watch
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
          {/* Free Video Card */}
          <div
            className="group relative rounded-2xl overflow-hidden border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-500 cursor-pointer"
            onClick={() => activeVideo !== "free" && setActiveVideo("free")}
          >
            {activeVideo === "free" ? (
              <BunnyPlayer
                videoId={FREE_VIDEO_ID}
                courseId="free"
                title="Introduction — Foundations of South Asian Movement"
              />
            ) : (
              <div className="aspect-video bg-[var(--ink)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-[var(--gold)]/5 flex items-center justify-center">
                  <div className="relative z-20 text-center">
                    <div className="w-20 h-20 rounded-full border border-[var(--gold)]/40 flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--gold)] group-hover:bg-[var(--gold)]/10 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-[var(--gold)] ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-[var(--ivory)]/40 text-sm font-body tracking-wide">
                      Click to watch free
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 bg-[var(--ink)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-body tracking-[0.15em] uppercase text-emerald-400/80 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                  Free Preview
                </span>
                <span className="text-xs text-[var(--ivory)]/30 font-body">
                  12 min
                </span>
              </div>
              <h3 className="font-display text-xl text-[var(--ivory)] mb-2">
                Foundations of South Asian Movement
              </h3>
              <p className="font-body text-sm text-[var(--ivory)]/40 leading-relaxed">
                An introduction to the core principles behind Nepali & South
                Asian dance — posture, breath, and the language of the hands.
              </p>
            </div>
          </div>

          {/* What you'll learn card */}
          <div className="rounded-2xl border border-[var(--gold)]/10 p-8 flex flex-col justify-center bg-[var(--gold)]/[0.02]">
            <p className="font-deva text-[var(--gold)]/60 text-xs mb-4">
              के सिक्नुहुनेछ
            </p>
            <h3 className="font-display text-2xl text-[var(--ivory)] mb-6">
              What you'll learn
            </h3>
            <ul className="space-y-4">
              {[
                "Core isolations rooted in classical Nepali technique",
                "How to layer expression over movement",
                "Breaking down choreography beat by beat",
                "Adapting South Asian styles to your body",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 font-body text-sm text-[var(--ivory)]/60"
                >
                  <span className="text-[var(--gold)] mt-0.5 shrink-0">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Paid Course Section */}
        <div className="mb-6">
          <span className="font-body text-xs tracking-[0.2em] uppercase text-[var(--gold)]/60">
            Full course
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--gold)]/20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Video side */}
            {/* Video side */}
            <div className="relative">
              {activeVideo === "paid" && enrolled ? (
                <BunnyPlayer
                  videoId={PAID_VIDEO_ID}
                  courseId={COURSE_ID}
                  title="Full Course — Nach Firiri Signature Series"
                />
              ) : enrolled ? (
                // Enrolled but not clicked yet — show play prompt
                <div
                  className="aspect-video bg-[var(--ink)] flex items-center justify-center relative overflow-hidden cursor-pointer group"
                  onClick={() => setActiveVideo("paid")}
                >
                  <div className="absolute inset-0 bg-[var(--gold)]/5" />
                  <div className="relative z-10 text-center px-6">
                    <div className="w-20 h-20 rounded-full border border-[var(--gold)]/40 flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--gold)] group-hover:bg-[var(--gold)]/10 transition-all duration-300">
                      <svg
                        className="w-8 h-8 text-[var(--gold)] ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="font-body text-sm text-[var(--ivory)]/40">
                      Click to play
                    </p>
                  </div>
                </div>
              ) : (
                // Not enrolled — show lock
                <div className="aspect-video bg-[var(--ink)] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--gold)]/5" />
                  <div className="relative z-10 text-center px-6">
                    <div className="w-16 h-16 rounded-full border border-[var(--gold)]/30 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-7 h-7 text-[var(--gold)]/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <p className="font-body text-sm text-[var(--ivory)]/30">
                      Enroll to unlock
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info side */}
            <div className="p-8 lg:p-10 flex flex-col justify-between bg-[var(--gold)]/[0.03]">
              <div>
                <span className="text-xs font-body tracking-[0.15em] uppercase text-[var(--gold)]/70 border border-[var(--gold)]/20 px-2.5 py-1 rounded-full">
                  Signature Series
                </span>
                <h2 className="font-display text-3xl text-[var(--ivory)] mt-4 mb-3">
                  Nach Firiri Full Course
                </h2>
                <p className="font-body text-sm text-[var(--ivory)]/50 leading-relaxed mb-8">
                  A complete guided journey through Swastika's signature
                  movement vocabulary. From foundational technique to full
                  choreography breakdowns — filmed in the studio, made for your
                  living room.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "6 structured video lessons",
                    "Full choreography breakdown",
                    "Lifetime access — watch anytime",
                    "Mobile & desktop friendly",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm font-body text-[var(--ivory)]/50"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--gold)]/60 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              {/* Price + CTA */}
              <div>
                {!enrolled && (
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display text-4xl text-[var(--gold)]">
                      $49
                    </span>
                    <span className="font-body text-sm text-[var(--ivory)]/30">
                      one-time · lifetime access
                    </span>
                  </div>
                )}

                {checkingEnrollment ? (
                  <div className="w-full py-3.5 flex items-center justify-center">
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      style={{ color: "oklch(0.74 0.11 85)" }}
                    />
                  </div>
                ) : !isSignedIn ? (
                  <SignInButton mode="modal">
                    <button className="w-full bg-[var(--gold)] text-[var(--ink)] font-body font-semibold py-3.5 rounded-xl hover:bg-[var(--gold)]/90 transition-colors tracking-wide">
                      Sign in to enroll
                    </button>
                  </SignInButton>
                ) : enrolled ? (
                  <div className="flex items-center gap-2 text-sm font-body text-[var(--ivory)]/40">
                    <svg
                      className="w-4 h-4 text-[var(--gold)]/60 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    You're enrolled · Lifetime access
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-[var(--gold)] text-[var(--ink)] font-body font-semibold py-3.5 rounded-xl hover:bg-[var(--gold)]/90 transition-colors tracking-wide"
                  >
                    Enroll now — $49
                  </button>
                )}

                {isSignedIn && (
                  <p className="text-center text-xs text-[var(--ivory)]/20 font-body mt-3">
                    Signed in as {user?.primaryEmailAddress?.emailAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="mt-20 text-center">
          <p className="font-deva text-[var(--gold)]/40 text-lg mb-2">
            नाचौं, सिकौं, बढौं
          </p>
          <p className="font-body text-xs text-[var(--ivory)]/20 tracking-widest uppercase">
            Dance. Learn. Grow.
          </p>
        </div>
      </div>

      {/* Course Payment Modal */}
      {showPayment && user && (
        <CoursePaymentModal
          courseId={COURSE_ID}
          courseName="Nach Firiri Full Course"
          amount={49}
          userId={user.id}
          userEmail={user.primaryEmailAddress?.emailAddress ?? ""}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            setEnrolled(true);
            setActiveVideo("paid");
          }}
        />
      )}
    </div>
  );
}
