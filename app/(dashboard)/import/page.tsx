import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ImportInterface } from "@/components/import/import-interface";

async function getDecks(userId: string) {
  return db.deck.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export default async function ImportPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const decks = await getDecks(userId);

  return (
    <div className="pb-20 lg:pb-0">
      <ImportInterface decks={decks} />
    </div>
  );
}
