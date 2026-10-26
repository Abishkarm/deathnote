import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Death Note | Character Journal',description:'A private notebook for characters and their stories.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}

