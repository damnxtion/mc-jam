import { useEffect, useState } from "react";
import { CandidateBoard } from "./components/CandidateBoard";
import { ListingWizard } from "./components/ListingWizard";
import { Logo } from "./components/Logo";
import { SAMPLE_LISTING } from "./domain/data";
import type { Listing } from "./domain/types";

type View = "wizard" | "applicants";
const readView = (): View => (window.location.hash === "#applicants" ? "applicants" : "wizard");

export default function App() {
  const [view, setView] = useState<View>(readView);
  const [listing, setListing] = useState<Listing>(SAMPLE_LISTING);
  const [justPublished, setJustPublished] = useState(false);

  useEffect(() => {
    const onHash = () => { setView(readView()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <>
      <header className="top">
        <div className="bar">
          <a className="brand" href="#wizard" aria-label="Tejado Pro home">
            <Logo />
            <b>tejado</b>
            <span className="pro">Pro</span>
          </a>
          <nav aria-label="Sections">
            <a href="#wizard" aria-current={view === "wizard" ? "page" : undefined}>List a home</a>
            <a href="#applicants" aria-current={view === "applicants" ? "page" : undefined}>Applicants</a>
          </nav>
          <span className="who" aria-hidden="true">MO</span>
        </div>
      </header>
      <main>
        {view === "wizard" ? (
          <ListingWizard
            onPublish={(l) => {
              setListing(l);
              setJustPublished(true);
              window.location.hash = "applicants";
            }}
          />
        ) : (
          <CandidateBoard key={listing.id} listing={listing} justPublished={justPublished} />
        )}
      </main>
      <footer className="foot">
        Prototype with sample data. Rules are simplified and are not legal advice. Built with React and TypeScript.
      </footer>
    </>
  );
}
