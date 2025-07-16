import type { Metadata } from "next";
import { createWorkspaceDB } from "@/lib/workspace-db";
import type { Subscription } from "@/types";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const workspaceDB = await createWorkspaceDB(uuid);
    const workspaceName = await workspaceDB.getWorkspaceName();
    const subscriptions = await workspaceDB.getAllSubscriptions();
    
    const subscriptionCount = subscriptions.length;
    const totalMonthlyCost = subscriptions.reduce((sum: number, sub: Subscription) => {
      const monthlyCost = sub.frequency === 'yearly' ? sub.amount / 12 : 
                         sub.frequency === 'quarterly' ? sub.amount * 4 / 12 :
                         sub.frequency === 'weekly' ? sub.amount * 4 : sub.amount;
      return sum + monthlyCost;
    }, 0);
    
    const title = `${workspaceName} - SubTracker`;
    const description = `${subscriptionCount} subscriptions for $${totalMonthlyCost.toFixed(2)}/month in ${workspaceName} @ SubTracker. Track and manage your recurring payments with privacy-first tools.`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ["/screenshots/dark_image.png"],
        type: "website",
        url: `https://subtracker.mo9a7i.com/dashboard/${uuid}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/screenshots/dark_image.png"],
      },
      robots: {
        index: false, // Don't index individual workspace pages for privacy
        follow: false,
      },
    };
  } catch (error) {
    // Fallback metadata if workspace data can't be loaded
    return {
      title: "Workspace - SubTracker",
      description: "Manage your subscriptions with privacy-first tracking tools @ SubTracker",
      openGraph: {
        title: "Workspace - SubTracker",
        description: "Manage your subscriptions with privacy-first tracking tools @ SubTracker",
        images: ["/screenshots/dark_image.png"],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Workspace - SubTracker",
        description: "Manage your subscriptions with privacy-first tracking tools @ SubTracker",
        images: ["/screenshots/dark_image.png"],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 