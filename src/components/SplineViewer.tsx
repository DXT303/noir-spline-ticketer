import { useEffect, useRef } from 'react';

interface SplineViewerProps {
  url?: string;
  className?: string;
}

const SplineViewer = ({ url, className = '' }: SplineViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create script tag for Spline viewer
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.80/build/spline-viewer.js';
    
    // Only append if not already loaded
    if (!document.querySelector('script[src*="spline-viewer"]')) {
      document.head.appendChild(script);
    }

    // Create the spline-viewer element
    if (containerRef.current && url) {
      const viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', url);
      viewer.style.width = '120%';
      viewer.style.height = '120%';
      viewer.style.position = 'absolute';
      viewer.style.top = '50%';
      viewer.style.left = '50%';
      viewer.style.transform = 'translate(-50%, -50%)';
      
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(viewer);
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [url]);

  return <div ref={containerRef} className={`${className} relative overflow-hidden`} />;
};

export default SplineViewer;