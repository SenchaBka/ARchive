import Providers from "./providers";
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
