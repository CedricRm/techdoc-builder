export const metadata = { title: "Tech Doc Builder" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
