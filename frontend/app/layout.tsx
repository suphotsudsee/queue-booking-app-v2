import "./globals.css";
import React from "react";

export const metadata = {
  title: "Queue Booking",
  description: "Simple appointment booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="container">
          <h1 className="text-2xl font-bold mb-4">ระบบจองคิวร้าน</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
