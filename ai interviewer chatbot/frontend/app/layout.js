import './globals.css';

export const metadata = {
  title: 'AI Interviewer Pro',
  description: 'AI-powered interview preparation platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
