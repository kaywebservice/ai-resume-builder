import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Resume Builder",
  description: "Generate professional resumes and cover letters with AI.",
  verification: {
    google: "vzREjfhomsn9KoFEywBS7ebsa7Wo-ttVmnc8jPh7l70",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1120",
};

const THEME_SCRIPT = `(function(){try{
var t=localStorage.getItem("theme");
if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"system"}
var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;
document.documentElement.setAttribute("data-theme",r);
}catch(e){}}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{${THEME_SCRIPT}}catch(e){}`,
          }}
        />
        <meta name="theme-color" content="#0b1120" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col theme-bg theme-text">{children}</body>
    </html>
  );
}
