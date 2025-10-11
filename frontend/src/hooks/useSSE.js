import { useState, useEffect } from 'react';

export const useSSE = (url, initialValue) => {
  const [data, setData] = useState(initialValue);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (error) {
        console.error('SSE JSON parsing error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // Don't close on error, EventSource will attempt to reconnect.
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return data;
};
