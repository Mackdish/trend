import { useEffect } from 'react';

export function usePageSEO({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    const suffix = ' | TradeMall Kenya';
    document.title = title.length > 50 ? title : title + suffix;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
