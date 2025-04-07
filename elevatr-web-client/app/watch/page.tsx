'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function WatchContent() {
    const videoPrefix = 'https://storage.googleapis.com/elevatr-processed-videos/';
    const videoSrc = useSearchParams().get('v');

    if (!videoSrc) {
        return <div>Error: No video specified in the URL.</div>;
    }

    return (
        <div>
            <h1>Watch Page</h1>
            <video controls src={videoPrefix + videoSrc} />
        </div>
    );
}

export default function Watch() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WatchContent />
        </Suspense>
    );
}