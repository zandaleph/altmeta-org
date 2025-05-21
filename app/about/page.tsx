export default function About() {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold mb-6">About</h1>
      <div className="prose dark:prose-invert">
        <p>
          Hi, I&apos;m Zack Spellman. I&apos;m a software engineer and
          occasional writer based in Seattle.
        </p>
        <p>
          This is my personal website where I write about technology, software
          development, and other topics that interest me.
        </p>
        <p>
          You can find me on{" "}
          <a
            href="https://github.com/zandaleph"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>{" "}
          and{" "}
          <a
            href="https://linkedin.com/in/zack-spellman"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            LinkedIn
          </a>
          .
        </p>
        <p>
          My resume is available{" "}
          <a
            href="/about/ZackSpellmanResume2025.pdf"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
