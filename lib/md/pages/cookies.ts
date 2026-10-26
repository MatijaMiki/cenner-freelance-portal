/** /cookies as markdown. Keep in step with pages/Cookies.tsx (legal text: copy it word for word). */
import { blocks, h2, h3, link, type PageModule } from '../format';

export const render: PageModule['render'] = () => ({
  title: 'Cookie Policy',
  summary: 'Learn how Cenner uses cookies and similar technologies to improve your experience on our platform.',
  path: '/cookies',
  body: blocks(
    'Detailed information about how we use cookies.',
    h2('What are cookies?'),
    'Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.',
    h3('Essential Cookies'),
    'These are required for the website to function. They allow you to log in, navigate pages, and use the marketplace escrow features securely.',
    h3('Analytical Cookies'),
    'These help us understand how visitors interact with our portal by collecting and reporting information anonymously.',
    h2('How to manage cookies'),
    `Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit ${link('www.aboutcookies.org', 'https://www.aboutcookies.org')}.`,
    'Please note that if you disable essential cookies, some parts of the Cenner ecosystem (like the chat and checkout) may not work correctly.',
    '*Last updated: October 2023.*',
  ),
  related: [
    { text: 'Privacy Policy', href: '/privacy' },
    { text: 'Terms of Service', href: '/terms' },
  ],
});
