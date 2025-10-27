import React, { useEffect, useRef } from 'react';

// This component loads and displays the timer HTML content directly
export default function CaseTimer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch the timer.html and inject it into the container
    fetch('/timer.html')
      .then(response => response.text())
      .then(html => {
        if (containerRef.current) {
          // Create a temporary container to parse the HTML
          const temp = document.createElement('div');
          temp.innerHTML = html;
          
          // Extract the content (everything inside body or the whole thing)
          const body = temp.querySelector('body');
          const content = body ? body.innerHTML : html;
          
          // Extract and inject styles
          const styles = temp.querySelectorAll('style');
          styles.forEach(style => {
            document.head.appendChild(style.cloneNode(true));
          });
          
          // Extract and inject scripts
          const scripts = temp.querySelectorAll('script');
          
          // Set the HTML content
          containerRef.current.innerHTML = content;
          
          // Execute scripts
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
          });
        }
      })
      .catch(error => {
        console.error('Failed to load timer:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1a1a; color: white; font-family: sans-serif;">
              <div style="text-align: center;">
                <h2>Failed to load Case Timer</h2>
                <p>Please try refreshing the page</p>
              </div>
            </div>
          `;
        }
      });

    // Cleanup function
    return () => {
      // Remove injected styles when component unmounts
      const styles = document.querySelectorAll('style[data-timer-style]');
      styles.forEach(style => style.remove());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'auto' }}
    />
  );
}
