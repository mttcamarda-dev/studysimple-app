import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatInterface } from "@/components/chat/chat-interface";

async function getChatSessions(userId: string) {
  return db.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });
}

export default async function ChatPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const chatSessions = await getChatSessions(userId);

  return (
    <div className="pb-20 lg:pb-0">
      <ChatInterface initialSessions={chatSessions} />
    </div>
  );
}
