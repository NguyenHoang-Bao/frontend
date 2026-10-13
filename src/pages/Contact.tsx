import ContactHero from '../components/Contact/ContactHero';
import ContactInfo from '../components/Contact/ContactInfo';
import ContactForm from '../components/Contact/ContactForm';
import ContactMap from '../components/Contact/ContactMap';

export default function Contact() {
  return (
    <main className="bg-gray-50 text-gray-900">
      <ContactHero />

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>

      <ContactMap />
    </main>
  );
}