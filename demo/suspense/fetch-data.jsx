import React, { Suspense } from 'react';

async function fetchArticles() {
  // Some fetch API fetching articles
}

let isRequestCalled = false;

function Content() {
  let result = [];
  if (!cache) {
    const promise = fetchArticles();
    isRequestCalled = true;
    throw promise; // Let Suspense Know
  }
  return <div>Article</div>;
}

export default function Articles() {
  return (
    <div>
      {/* You promise is thrown */}
      <Suspense fallback={<div>Loading...</div>}>
        <Content />
      </Suspense>
    </div>
  );
}
