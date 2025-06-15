import React, { useEffect, useRef, useState, FC } from 'react';

interface Props {
  html: string;
}

const InstagramEmbed: FC<Props> = ({ html }) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    // Reset states when html changes
    setIsLoaded(false);
    setHasError(false);

    const processEmbeds = () => {
      try {
        if (
          window.instgrm &&
          typeof window.instgrm.Embeds?.process === 'function' &&
          embedRef.current
        ) {
          // Clear any existing Instagram content first
          const existingEmbeds = embedRef.current.querySelectorAll('iframe[src*="instagram.com"]');
          existingEmbeds.forEach(embed => {
            const parent = embed.parentElement;
            if (parent && parent !== embedRef.current) {
              parent.style.display = 'none';
            }
          });

          // Process new embed
          window.instgrm.Embeds.process();
          setIsLoaded(true);
          return true;
        }
      } catch (error) {
        // Silently handle Instagram SDK errors
        console.warn('Instagram embed processing error:', error);
        setHasError(true);
      }
      return false;
    };

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      // Try to process immediately if SDK is already loaded
      if (!processEmbeds()) {
        // If not loaded, wait for it with a timeout
        intervalId = setInterval(() => {
          if (processEmbeds()) {
            clearInterval(intervalId);
          }
        }, 500);

        // Stop trying after 8 seconds
        timeoutId = setTimeout(() => {
          if (intervalId) {
            clearInterval(intervalId);
          }
          if (!isLoaded) {
            setHasError(true);
          }
        }, 8000);
      }
    }, 100);

    return () => {
      if (initTimer) clearTimeout(initTimer);
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [html, isLoaded]);

  // Extract Instagram URL from the HTML for fallback
  const getInstagramUrl = (htmlString: string) => {
    const match = htmlString.match(/data-instgrm-permalink="([^"]+)"/);
    return match ? match[1] : null;
  };

  const instagramUrl = getInstagramUrl(html);

  if (hasError && instagramUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <p className="text-gray-600 text-center mb-4">Instagram content couldn't load</p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return <div ref={embedRef} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default InstagramEmbed;
