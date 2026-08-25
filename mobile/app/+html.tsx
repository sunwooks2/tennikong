import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>테니콩</title>
        <meta name="description" content="경기를 기록하고 나만의 테니스 성장을 확인해보세요." />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="테니콩" />
        <meta property="og:title" content="테니콩" />
        <meta property="og:description" content="경기를 기록하고 나만의 테니스 성장을 확인해보세요." />
        <meta property="og:image" content="https://tennikong.vercel.app/og-image.png" />
        <meta property="og:url" content="https://tennikong.vercel.app" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="테니콩" />
        <meta name="twitter:description" content="경기를 기록하고 나만의 테니스 성장을 확인해보세요." />
        <meta name="twitter:image" content="https://tennikong.vercel.app/og-image.png" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
html, body, #root {
  height: 100%;
}
body {
  background-color: #fff;
  overflow: hidden;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
