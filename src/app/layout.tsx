import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "@/styles/globals.css";

export const metadata = {
  title: "Arrive",
  description: "Location-based content discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen">
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}
