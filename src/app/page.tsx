import { ChatbotInterface } from "@/components/Chatbot";
import { Faqs } from "@/components/Faqs";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SecondaryFeatures } from "@/components/SecondaryFeatures";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ChatbotInterface />
        <SecondaryFeatures />
        <Faqs />
      </main>
      <Footer />
    </>
  );
}
