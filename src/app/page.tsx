import { redirect } from "next/navigation";

export default function Home() {
  // Middleware has already decided whether a session exists; anyone who reaches
  // this route is authenticated.
  redirect("/today");
}
