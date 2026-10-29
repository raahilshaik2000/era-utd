import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Manifesto from "@/components/sections/Manifesto";
import Pillars from "@/components/sections/Pillars";
import Steps from "@/components/sections/Steps";
import Companies from "@/components/sections/Companies";
import Events from "@/components/sections/Events";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Pillars />
        <Steps />
        <Companies />
        <Events />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
