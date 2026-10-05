import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { BottomNav, SideNav } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { GuestBootstrap } from "@/components/guest-bootstrap";
import { getGuestOrNull } from "@/lib/guest";
import { DEMO_GUEST_ID } from "@/lib/guest-token";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WodTrace",
    template: "%s · WodTrace",
  },
  description:
    "Registra WODs, PRs y progreso. Entrenamiento CrossFit sin cuentas.",
  applicationName: "WodTrace",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WodTrace",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0C10" },
    { media: "(prefers-color-scheme: light)", color: "#F4F5F7" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme = "dark";
  let needsBootstrap = true;
  try {
    const guest = await getGuestOrNull();
    if (guest?.id === DEMO_GUEST_ID) {
      needsBootstrap = false;
      const t = guest.preference?.theme;
      if (t === "LIGHT") theme = "light";
      else if (t === "SYSTEM") theme = "system";
    }
  } catch {
    needsBootstrap = true;
  }

  return (
    <html
      lang="es"
      className={`${inter.variable} ${barlow.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-text-secondary">
        <ThemeProvider defaultTheme={theme}>
          <GuestBootstrap needsBootstrap={needsBootstrap} />
          <div className="flex min-h-full">
            <SideNav />
            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col md:max-w-xl">
              <main className="flex-1 px-4 pt-6 pb-nav">{children}</main>
            </div>
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
