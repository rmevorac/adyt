import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Darkroom | Adyt Studios",
  description: "Manage your content generation projects",
};

export default function DarkroomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
} 