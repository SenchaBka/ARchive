import Providers from "./providers";
import "@/styles/globals.css";

export const metadata = {
  title: "ARchive - Location-Based AR Experiences",
  description: "Discover stories anchored to real world places. Create and unlock location-based audio and AR experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body 
        className="min-h-screen antialiased"
        style={{ 
          backgroundColor: "#000000", 
          color: "#fafafa",
          margin: 0,
          padding: 0 
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
