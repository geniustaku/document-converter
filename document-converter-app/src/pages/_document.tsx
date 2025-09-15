import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Analytics 4 (GA4) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-C7WBD545ZS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Configure GA4 with your stream details
            gtag('config', 'G-C7WBD545ZS', {
              custom_map: {
                'stream_name': 'Document Converter Pro',
                'stream_url': 'https://docs-app.net',
                'stream_id': '11361607786'
              }
            });
            
            // Configure Google Ads
            gtag('config', 'AW-17042498697');
          `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3259241984391146"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </Html>
  )
}