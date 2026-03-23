import Link from "next/link";

export default function NoChildBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="text-amber-800 font-medium mb-2">No child selected</p>
      <p className="text-amber-700 text-sm mb-4">
        Create a child profile or join one with a share code to get started.
      </p>
      <Link
        href="/children"
        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Go to Children →
      </Link>
    </div>
  );
}
