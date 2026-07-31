import Header from "@/components/Header";
import TabContent from "@/components/TabContent";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-6 md:px-10 py-8 md:py-14 max-w-[1400px] w-full mx-auto pb-24 md:pb-14">
        <TabContent />
      </main>
      <footer
        className="flex-none px-6 pb-24 md:pb-10 pt-8 text-center"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        <p className="text-[11.5px] font-medium mb-2.5" style={{ color: "#9B9B9B" }}>
          Uber Q2&apos;26 Financial Model &middot; Built by Jack Murphy (MS in Finance @ USC)
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/sources/uber-q226f-model.xlsx"
            download
            className="text-[11px] font-medium transition-colors duration-150 hover:underline"
            style={{ color: "#B5B5B5" }}
          >
            Download Raw Model (.xlsx)
          </a>
          <span style={{ color: "#D5D5D5", fontSize: 12 }}>·</span>
          <a
            href="https://www.linkedin.com/in/jack-murphy-963375261/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium transition-colors duration-150 hover:underline"
            style={{ color: "#B5B5B5" }}
          >
            LinkedIn
          </a>
          <span style={{ color: "#D5D5D5", fontSize: 12 }}>·</span>
          <a
            href="/methodology"
            className="text-[11px] font-medium transition-colors duration-150 hover:underline"
            style={{ color: "#B5B5B5" }}
          >
            Notes
          </a>
        </div>
      </footer>
    </div>
  );
}
