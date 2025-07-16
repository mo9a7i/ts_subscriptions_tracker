"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bug, BugIcon, Filter, Github, SquareRoundCorner, X } from "lucide-react";
import { DashboardStats } from "@/components/sidebar/dashboard-stats";
import { PaymentCalendar } from "@/components/sidebar/payment-calendar";
import type { SidebarProps, Subscription } from "@/types";
import type { WorkspaceDatabase } from "@/lib/workspace-db";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";

export function Sidebar({ selectedLabels, onLabelsChange, subscriptions, filteredSubscriptions, workspaceDB }: SidebarProps) {
    const [labels, setLabels] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Derive labels from subscriptions prop instead of database call
    useEffect(() => {
        const allLabels = subscriptions.flatMap(sub => sub.labels || []);
        const uniqueLabels = [...new Set(allLabels)].sort();
        setLabels(uniqueLabels);
    }, [subscriptions]);

    const toggleLabel = (labelName: string) => {
        if (selectedLabels.includes(labelName)) {
            onLabelsChange(selectedLabels.filter((l) => l !== labelName));
        } else {
            onLabelsChange([...selectedLabels, labelName]);
        }
    };

    const clearFilters = () => {
        onLabelsChange([]);
    };

    return (
        <div className="pt-12">
            {/* Only show mobile filter button if there are subscriptions */}
            {subscriptions.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="md:hidden mb-4">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {selectedLabels.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {selectedLabels.length}
                        </Badge>
                    )}
                </Button>
            )}

            <div className={`${isOpen ? "block" : "hidden"} md:block w-full space-y-4`}>
                {/* Always show payment calendar */}
                <PaymentCalendar subscriptions={subscriptions} filteredSubscriptions={filteredSubscriptions} />

                {/* Only show filters card if there are subscriptions */}
                {subscriptions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Filter by Labels
                        </CardTitle>
                        <CardAction>
                          {selectedLabels.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                              <X  />
                            </Button>
                          )}
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full flex flex-wrap gap-1">
                          {labels.map((label) => (
                            <Button key={label} variant={selectedLabels.includes(label) ? "default" : "outline"} size="sm" onClick={() => toggleLabel(label)}>
                              {label}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter >
                      {selectedLabels.length > 0 && (
                        <>
                            <div>
                                <h4 className="text-sm font-medium mb-2">Active Filters</h4>
                                <div className="flex flex-wrap gap-1">
                                    {selectedLabels.map((label) => (
                                        <Badge key={label} variant="secondary" className="flex items-center gap-1">
                                            {label}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => toggleLabel(label)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                      </CardFooter>
                    </Card>
                )}
                
                {/* Always show dashboard stats (component handles conditional rendering internally) */}
                <div className="space-y-3">
                    <DashboardStats subscriptions={subscriptions} filteredSubscriptions={filteredSubscriptions} />
                </div>

                {/* Links section at the bottom */}
                <div className="pt-4 mt-6">
                    <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                        <Link 
                            className="hover:text-foreground transition-colors flex items-center gap-2" 
                            href="https://github.com/mo9a7i/ts_subscriptions_tracker"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github className="w-4 h-4" />
                            Contribute
                        </Link>
                        <Link 
                            className="hover:text-foreground transition-colors flex items-center gap-2" 
                            href="https://subscriptionlister.userjot.com/board/features"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <SquareRoundCorner className="w-4 h-4" />
                            Feature Request
                        </Link>
                        <Link 
                            className="hover:text-foreground transition-colors flex items-center gap-2" 
                            href="https://subscriptionlister.userjot.com/board/bugs"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <BugIcon className="w-4 h-4" />
                            Report Bug
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
