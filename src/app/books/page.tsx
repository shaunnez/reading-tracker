export const dynamic = "force-dynamic";
import { getBooks, getPhonicsSkills } from "@/lib/actions";
import { getActiveChildId } from "@/lib/child-cookie";
import BookForm from "./book-form";
import NoChildBanner from "@/components/no-child-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LEVEL_LABELS: Record<number, string> = {
  1: "CVC only",
  10: "Digraphs",
  15: "Blends",
  21: "Long vowels",
  30: "R-controlled",
  38: "Multisyllabic",
};

function getPhonicsLabel(level: number): string {
  const thresholds = [38, 30, 21, 15, 10, 1];
  for (const t of thresholds) {
    if (level >= t) return LEVEL_LABELS[t];
  }
  return "Beginner";
}

export default async function BooksPage() {
  const childId = await getActiveChildId();
  if (!childId) return <NoChildBanner />;
  const [allBooks, skills] = await Promise.all([getBooks(childId), getPhonicsSkills(childId)]);
  const currentSkill = skills.find((s) => s.status === "in_progress") ?? skills.find((s) => s.status === "not_started");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Books</h1>
        <p className="text-gray-500 text-sm">Track decodable books read</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Log a Book</h2>
          <BookForm currentSkillLevel={currentSkill?.sequenceOrder ?? 1} childId={childId} />
        </div>

        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Suggested Decodable Series</h2>
          <Card>
            <CardContent className="pt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Bob Books Set 1</span>
                <Badge variant="outline">CVC</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Bob Books Set 2</span>
                <Badge variant="outline">CVC + digraphs</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Bob Books Set 3</span>
                <Badge variant="outline">Blends</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Primary Phonics Set 1-5</span>
                <Badge variant="outline">All levels</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Dog on a Log</span>
                <Badge variant="outline">Free PDFs</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Book list */}
      {allBooks.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Books Read ({allBooks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{book.title}</p>
                    <p className="text-xs text-gray-400">
                      {book.series && `${book.series} · `}{book.dateRead}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {book.accuracyPct != null && (
                      <span className={`text-xs font-medium ${book.accuracyPct >= 95 ? "text-green-600" : book.accuracyPct >= 90 ? "text-amber-600" : "text-red-500"}`}>
                        {book.accuracyPct}%
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {getPhonicsLabel(book.phonicsLevel)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📗</p>
          <p>No books logged yet. Add your first one above.</p>
        </div>
      )}
    </div>
  );
}
