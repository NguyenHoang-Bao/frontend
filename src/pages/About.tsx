import { useEffect } from 'react';
import AboutHero from '../components/About/AboutHero';
import AboutStory from '../components/About/AboutStory';
import AboutCoreValues from '../components/About/AboutCoreValues';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-appBg text-gray-900 min-h-screen">
      <AboutHero />
      <AboutStory />
      <AboutCoreValues />
    </main>
  );
}