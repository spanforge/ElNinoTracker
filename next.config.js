const nextConfig={distDir:process.env.NEXT_DIST_DIR||'.next',poweredByHeader:false,async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}]}};
export default nextConfig;
