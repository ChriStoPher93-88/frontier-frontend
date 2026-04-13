import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the main assembly route
  redirect("/assembly")
}
