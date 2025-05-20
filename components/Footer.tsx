export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t">
      <div className="w-full max-w-4xl mx-auto px-6 py-4 text-center text-sm text-gray-600">
        © 2013-{currentYear} Altmeta.org
      </div>
    </footer>
  );
}
