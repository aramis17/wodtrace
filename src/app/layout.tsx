import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { BottomNav, SideNav } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import { GuestBootstrap } from "@/components/guest-bootstrap";
import { Toaster } from "@/components/toaster";
import { getGuestOrNull } from "@/lib/guest";
import { ownsAnyTeam } from "@/lib/teams";
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
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
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
  let showCoach = false;
  try {
    const guest = await getGuestOrNull();
    // Anonymous visitors are moved onto the shared demo; accounts keep their own profile.
    if (guest && (guest.id === DEMO_GUEST_ID || guest.userId)) {
      needsBootstrap = false;
      showCoach = Boolean(guest.userId) && (await ownsAnyTeam(guest.id));
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
            <SideNav showCoach={showCoach} />
            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col md:max-w-xl">
              <main className="flex-1 px-4 pt-6 pb-nav">{children}</main>
            </div>
          </div>
          <BottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
