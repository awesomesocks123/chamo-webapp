import React from 'react';

export default function ChatRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// This function tells Next.js which dynamic paths to pre-render
export async function generateStaticParams() {
  // For this app, we don't need to pre-render any specific chatroom routes
  // as they will be generated on-demand
  return [];
}
