import type {Metadata} from 'next';
import './globals.css';
import {siteConfig} from '../lib/enso/config';
export const metadata:Metadata={title:{default:siteConfig.name,template:'%s · '+siteConfig.name},description:'Understand the official Pacific climate status, the next seasonal outlook and what to watch in India or around the world.',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body>{children}</body></html>}
