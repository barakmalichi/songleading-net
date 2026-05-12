export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <iframe
        title="Lineup app"
        src="/lineup/index.html"
        className="h-full w-full border-0"
      />
    </main>
  );
}
