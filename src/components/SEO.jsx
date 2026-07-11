import { useEffect } from 'react';

/**
 * SEO Component to handle dynamic metadata updates including Open Graph and Twitter tags.
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} canonical - Canonical path (e.g., '/privacy-policy')
 * @param {string} ogImage - Custom OG image URL (optional)
 * @param {string} ogType - OG type (default: 'website')
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage = 'https://www.managemypg.com/og-image.jpg',
  ogType = 'website'
}) {
  useEffect(() => {
    // 1. Title Logic (ManageMyPG casing)
    const fullTitle = title && title !== 'Home'
      ? `${title} | ManageMyPG`
      : 'ManageMyPG | Smart PG Management Software for Owners';

    const baseUrl = 'https://www.managemypg.com';
    const fullUrl = canonical ? `${baseUrl}${canonical === '/' ? '' : canonical}` : baseUrl;

    document.title = fullTitle;

    const updateMeta = (name, content, attr = 'name') => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta
    updateMeta('description', description);

    // 3. Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', fullUrl);

    // 4. Open Graph (OG)
    updateMeta('og:site_name', 'ManageMyPG', 'property');
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:url', fullUrl, 'property');
    updateMeta('og:image', ogImage, 'property');
    updateMeta('og:image:width', '1200', 'property');
    updateMeta('og:image:height', '630', 'property');
    updateMeta('og:image:type', 'image/jpeg', 'property');
    updateMeta('og:type', ogType, 'property');

    // 5. Twitter
    updateMeta('twitter:card', 'summary_large_image', 'name');
    updateMeta('twitter:title', fullTitle, 'name');
    updateMeta('twitter:description', description, 'name');
    updateMeta('twitter:image', ogImage, 'name');

  }, [title, description, canonical, ogImage, ogType]);

  return null;
}
