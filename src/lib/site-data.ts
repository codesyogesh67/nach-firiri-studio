import haku from "@/assets/products/haku-kurthi.jpg";
import black from "@/assets/products/black-kurthi.jpg";
import white from "@/assets/products/white-kurthi.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import portrait from "@/assets/artist-portrait.png";

export const SITE = {
  tiktok: "https://www.tiktok.com/@swasksah",
  tiktokHandle: "@swasksah",
  instagram: "https://instagram.com/swasksah",
  youtube: "https://youtube.com/@swasksah",
  email: "swastika_sah@yahoo.com",
  stripeWorkshop: "https://buy.stripe.com/bJe4gz2oL5vNaVJ8pG7N607",
  heroVideoId: "J_1ElsdFmIM",
};

export const IMAGES = { portrait, gallery1, gallery2, gallery3 };

export const PRODUCTS = [
  { id: "haku", name: "Haku Newari Kurthi", price: 50, image: haku, link: "https://nachfiriri.com/products/black-newari-kurthi-top" },
  { id: "black", name: "Black Newari Kurthi", price: 50, image: black, link: "https://nachfiriri.com/products/the-maya-sitara-kurthi-1" },
  { id: "white", name: "White Newari Kurthi", price: 50, image: white, link: "https://nachfiriri.com/products/the-maya-sitara-kurthi" },
];

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export const TUTORIALS = [
  { id: "t1", title: "Nacha Firiri — Signature Steps", song: "Nacha Firiri", difficulty: "Beginner" as Difficulty, duration: "8:42", videoId: "J_1ElsdFmIM", access: "FREE" as const },
  { id: "t2", title: "Teej Folk Foundations", song: "Teej Special", difficulty: "Beginner" as Difficulty, duration: "11:20", videoId: "J_1ElsdFmIM", access: "FREE" as const },
  { id: "t3", title: "Bollywood Heels Flow", song: "Kamariya", difficulty: "Intermediate" as Difficulty, duration: "14:05", videoId: "J_1ElsdFmIM", access: "FREE" as const },
  { id: "t4", title: "Sangeet Showstopper Combo", song: "Dholida", difficulty: "Intermediate" as Difficulty, duration: "16:30", videoId: "J_1ElsdFmIM", access: "MEMBERS" as const },
  { id: "t5", title: "Newari Fusion Advanced", song: "Silu", difficulty: "Advanced" as Difficulty, duration: "19:12", videoId: "J_1ElsdFmIM", access: "MEMBERS" as const },
  { id: "t6", title: "Footwork Drills — Speed", song: "Practice Set", difficulty: "Advanced" as Difficulty, duration: "22:48", videoId: "J_1ElsdFmIM", access: "MEMBERS" as const },
];

export const WORKSHOPS = [
  { id: "w1", style: "Nacha Firiri Heels", song: "Nacha Firiri", date: "June 18, 2026", time: "7:00–9:00 PM", venue: "Ripley-Grier Studios", city: "New York", duration: "2 Hours", price: 20, spotsLeft: 8, spotsTotal: 20, link: "https://buy.stripe.com/bJe4gz2oL5vNaVJ8pG7N607" },
  { id: "w2", style: "Bollywood Sangeet Combo", song: "Dholida", date: "July 5, 2026", time: "5:00–7:00 PM", venue: "Pearl Studios", city: "New York", duration: "2 Hours", price: 25, spotsLeft: 14, spotsTotal: 20, link: "https://buy.stripe.com/bJe4gz2oL5vNaVJ8pG7N607" },
  { id: "w3", style: "Teej Folk Intensive", song: "Teej Special", date: "July 20, 2026", time: "2:00–4:00 PM", venue: "Nepal Cultural Center", city: "Kathmandu", duration: "2 Hours", price: 18, spotsLeft: 0, spotsTotal: 25, link: "https://buy.stripe.com/bJe4gz2oL5vNaVJ8pG7N607" },
  { id: "w4", style: "Heels Choreography", song: "Kamariya", date: "Aug 2, 2026", time: "6:00–8:00 PM", venue: "The Dance Loft", city: "Mumbai", duration: "2 Hours", price: 22, spotsLeft: 5, spotsTotal: 18, link: "https://buy.stripe.com/bJe4gz2oL5vNaVJ8pG7N607" },
  { id: "w5", style: "Online Foundations", song: "Mixed Set", date: "Aug 10, 2026", time: "8:00–9:30 PM EST", venue: "Live on Zoom", city: "Virtual", duration: "1.5 Hours", price: 15, spotsLeft: 30, spotsTotal: 50, link: "https://buy.stripe.com/bJe4gz2oL5vNaVJ8pG7N607" },
];

export const CITIES = ["All Cities", "New York", "Kathmandu", "Mumbai", "Virtual"];

export const OCCASIONS = [
  { icon: "💒", title: "Wedding Sangeet Choreography", desc: "Custom routines for your big celebration." },
  { icon: "👯", title: "Private Group Class", desc: "Bring friends together for a dance session." },
  { icon: "🎂", title: "Birthday Party", desc: "Make the celebration unforgettable." },
  { icon: "🏢", title: "Corporate / Cultural Event", desc: "Performances & workshops for any audience." },
  { icon: "💻", title: "Virtual 1-on-1 Session", desc: "Learn from anywhere in the world." },
  { icon: "🎓", title: "School / College Performance", desc: "Choreography for student showcases." },
];

export const TESTIMONIALS = [
  { name: "Anjali R.", occasion: "Wedding Sangeet", quote: "Swastika choreographed our entire sangeet. Every guest was on the floor by the end — pure magic." },
  { name: "Dev & Priya", occasion: "Corporate Diwali", quote: "Professional, warm, and electric on stage. Our team is still talking about the workshop." },
  { name: "Maya T.", occasion: "Birthday Surprise", quote: "She made a room full of beginners feel like stars. Felt the beat in every step." },
];
