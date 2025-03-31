import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab | The Darkroom",
  description: "Create and manage your image generation projects",
};

export default function LabLayout({
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