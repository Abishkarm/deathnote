import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Death Note | A Life in Words',description:'A quiet space for memories, messages, and personal notes. Share by choice, or keep your words private.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
