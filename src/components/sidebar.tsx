"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Filter, X } from "lucide-react";
import { db } from "@/lib/db";
import { DashboardStats } from "@/components/sidebar/dashboard-stats";
import { PaymentCalendar } from "@/components/sidebar/payment-calendar";
import type { SidebarProps, Subscription } from "@/types";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

export function Sidebar({ selectedLabels, onLabelsChange, subscriptions, filteredSubscriptions }: SidebarProps) {
    const [labels, setLabels] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadLabels();
    }, []);

    const loadLabels = async () => {
        const uniqueLabels = await db.getAllUniqueLabels();
        setLabels(uniqueLabels);
    };

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
            <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="md:hidden mb-4">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {selectedLabels.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                        {selectedLabels.length}
                    </Badge>
                )}
            </Button>

            <div className={`${isOpen ? "block" : "hidden"} md:block w-full space-y-4`}>
                {/* Payment Calendar */}
                <PaymentCalendar subscriptions={subscriptions} filteredSubscriptions={filteredSubscriptions} />

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
                
                {/* Dashboard Stats Cards */}
                <div className="space-y-3">
                    <DashboardStats subscriptions={subscriptions} filteredSubscriptions={filteredSubscriptions} />
                </div>
            </div>
        </div>
    );
}
