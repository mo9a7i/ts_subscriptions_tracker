import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import { SubscriptionModal } from "@/components/subscription-modal";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: "subscription" | "generic";
}

export function EmptyState({
  title = "No items found",
  description = "Get started by adding your first item.",
  actionText = "Add Item",
  onAction,
  icon,
  variant = "generic",
}: EmptyStateProps) {
  const defaultIcons = {
    subscription: <CreditCard className="w-12 h-12 text-muted-foreground" />,
    generic: <Plus className="w-12 h-12 text-muted-foreground" />,
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="mb-4">{displayIcon}</div>
        
        <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
        
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>
        
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="w-4 h-4" />
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Specific variant for subscriptions
export function SubscriptionEmptyState({ 
  onAddSubscription, 
  workspaceDB 
}: { 
  onAddSubscription?: () => void;
  workspaceDB?: any;
}) {
  // If workspaceDB is provided, render with subscription modal integration
  if (workspaceDB) {
    return (
      <SubscriptionEmptyStateWithModal 
        onAddSubscription={onAddSubscription}
        workspaceDB={workspaceDB}
      />
    );
  }

  // Fallback to simple empty state
  return (
    <EmptyState
      variant="subscription"
      title="No subscriptions yet"
      description="Start tracking your recurring payments by adding your first subscription. Keep tabs on your monthly expenses and never miss a payment again."
      actionText="Add First Subscription"
      onAction={onAddSubscription}
    />
  );
}

// Component with modal integration
function SubscriptionEmptyStateWithModal({ 
  onAddSubscription,
  workspaceDB 
}: { 
  onAddSubscription?: () => void;
  workspaceDB: any;
}) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="mb-4">
          <CreditCard className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold text-center mb-2">No subscriptions yet</h3>
        
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Start tracking your recurring payments by adding your first subscription. Keep tabs on your monthly expenses and never miss a payment again.
        </p>
        
        <SubscriptionModal 
          onSave={onAddSubscription || (() => {})} 
          workspaceDB={workspaceDB}
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Subscription
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
} 