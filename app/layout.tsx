import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI — Design Systems at the Speed of Thought",
  description: "Ghost AI maps your architecture to a shared canvas your whole team can refine in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          localization={{
            signIn: {
              start: {
                title: "Sign in to Ghost AI",
                subtitle: "Welcome back! Please sign in to continue",
              },
            },
            signUp: {
              start: {
                title: "Create your Ghost AI account",
                subtitle: "Welcome! Get started by creating your account",
              },
            },
            formButtonPrimary: "Continue ▸",
          }}
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "var(--primary)",
              colorBackground: "var(--background)",
              colorForeground: "var(--foreground)",
              colorMutedForeground: "var(--muted-foreground)",
              colorBorder: "var(--border)",
              colorInput: "var(--background)",
              colorInputForeground: "var(--foreground)",
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
