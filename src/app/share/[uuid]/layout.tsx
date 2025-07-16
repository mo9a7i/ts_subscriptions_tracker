import type { Metadata } from "next";
import { getSharedSubscriptions, getSharedWorkspaceName } from "@/lib/workspace-db";
import type { Subscription } from "@/types";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const workspaceName = await getSharedWorkspaceName(uuid);
    const subscriptions = await getSharedSubscriptions(uuid);
    
    if (!workspaceName || !subscriptions) {
      return {
        title: "Shared Workspace - SubTracker",
        description: "View shared subscription workspace @ SubTracker",
        robots: { index: false, follow: false },
      };
    }
    
    const subscriptionCount = subscriptions.length;
    const totalMonthlyCost = subscriptions.reduce((sum: number, sub: Subscription) => {
      const monthlyCost = sub.frequency === 'yearly' ? sub.amount / 12 : 
                         sub.frequency === 'quarterly' ? sub.amount * 4 / 12 :
                         sub.frequency === 'weekly' ? sub.amount * 4 : sub.amount;
      return sum + monthlyCost;
    }, 0);
    
    const title = `${workspaceName} - Shared Workspace - SubTracker`;
    const description = `View ${subscriptionCount} subscriptions totaling $${totalMonthlyCost.toFixed(2)}/month in ${workspaceName} @ SubTracker. Privacy-first subscription tracking.`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: ["https://subtracker.mo9a7i.com/screenshots/dark_image.png"],
        type: "website",
        url: `https://subtracker.mo9a7i.com/share/${uuid}`,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["https://subtracker.mo9a7i.com/screenshots/dark_image.png"],
      },
      robots: {
        index: false, // Don't index shared workspaces for privacy
        follow: false,
      },
    };
  } catch (error) {
    // Fallback metadata if shared workspace data can't be loaded
    return {
      title: "Shared Workspace - SubTracker",
      description: "View shared subscription workspace @ SubTracker",
      openGraph: {
        title: "Shared Workspace - SubTracker",
        description: "View shared subscription workspace @ SubTracker",
        images: ["https://subtracker.mo9a7i.com/screenshots/dark_image.png"],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Shared Workspace - SubTracker",
        description: "View shared subscription workspace @ SubTracker",
        images: ["https://subtracker.mo9a7i.com/screenshots/dark_image.png"],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function SharedWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 