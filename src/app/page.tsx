import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import LogTicker from "@/components/sections/LogTicker";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LogTicker />
        <About />
        <Capabilities />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
