import type { Metadata } from "next";
import { Anton, Caveat_Brush, Figtree } from "next/font/google";
import "./globals.css";

const titres = Anton({
  variable: "--police-titres",
  subsets: ["latin"],
  weight: "400",
});

const manuscrit = Caveat_Brush({
  variable: "--police-manuscrit",
  subsets: ["latin"],
  weight: "400",
});

const texte = Figtree({
  variable: "--police-texte",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "L'entraide du campus",
  description: "Propose ce que tu sais faire, trouve ce dont tu as besoin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${titres.variable} ${manuscrit.variable} ${texte.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
