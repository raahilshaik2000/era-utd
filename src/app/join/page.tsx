import type { Metadata } from "next";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
  title: "Join ERA at UT Dallas",
  description: "Sign up for ERA as a UT Dallas student, or partner with us as a company hiring interns.",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <JoinForm initialType={type === "company" ? "company" : "student"} />;
}
