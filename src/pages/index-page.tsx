import React from "react";

const indexBodyHtml = `
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
<script type="module" src="/index.tsx"></script>
`;

export default function IndexPage() {
  return <div dangerouslySetInnerHTML={{ __html: indexBodyHtml }} />;
}
