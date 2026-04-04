export const metadata = {
  title: "Levi’s AI Gov Tutor",
  description: "An AI-powered AP U.S. Government study tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#000000",
          color: "#ffffff",
          fontFamily: "system-ui",
        }}
      >
        {children}
      </body>
    </html>
  );
}
