"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, X } from "lucide-react";
import { getKnownService } from "@/lib/known-services";
import { fetchFaviconAsDataUrl } from "@/lib/favicon";
import { extractColorsFromImage } from "@/lib/color-utils";
import type { Subscription, SubscriptionModalProps, SubscriptionFormData, SubscriptionFrequency } from "@/types";
import type { WorkspaceDatabase } from "@/lib/workspace-db";

export function SubscriptionModal({ subscription, onSave, trigger, workspaceDB, onDeleteStart, onDeleteEnd }: SubscriptionModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<SubscriptionFormData>({
        name: "",
        amount: "",
        currency: "SAR",
        frequency: "monthly",
        nextPayment: "",
        startDate: "",
        url: "",
        icon: "",
        comment: "",
        labels: [],
        autoRenewal: true,
        colors: undefined,
    });
    const [newLabel, setNewLabel] = useState("");
    const [availableLabels, setAvailableLabels] = useState<string[]>([]);
    const [isLoadingFavicon, setIsLoadingFavicon] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [isFormValid, setIsFormValid] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    // Extract colors for existing subscriptions that don't have colors
    const extractColorsForExisting = async (subscription: Subscription) => {
        if (!subscription.colors && subscription.icon) {
            try {
                const colors = await extractColorsFromImage(subscription.icon, subscription.name);
                if (Object.keys(colors).length > 0) {
                    await workspaceDB!.updateSubscription(subscription.id, { colors });
                    setFormData((prev) => ({ ...prev, colors }));
                }
            } catch (error) {
                console.error("Failed to extract colors for existing subscription:", error);
            }
        }
    };

    useEffect(() => {
        if (subscription) {
            setFormData({
                name: subscription.name,
                amount: subscription.amount.toString(),
                currency: subscription.currency,
                frequency: subscription.frequency,
                nextPayment: subscription.nextPayment,
                startDate: subscription.startDate || "",
                url: subscription.url || "",
                icon: subscription.icon || "",
                comment: subscription.comment || "",
                labels: subscription.labels,
                autoRenewal: subscription.autoRenewal ?? true,
                colors: subscription.colors,
            });

            // Extract colors for existing subscription if needed
            extractColorsForExisting(subscription);
        } else {
            setFormData({
                name: "",
                amount: "",
                currency: "SAR",
                frequency: "monthly",
                nextPayment: "",
                startDate: "",
                url: "",
                icon: "",
                comment: "",
                labels: [],
                autoRenewal: true,
                colors: undefined,
            });
        }
        setValidationErrors({});
        loadLabels();
    }, [subscription]);

    // Reset form when modal closes - but only for new subscriptions
    useEffect(() => {
        if (!open && !subscription) {
            resetForm();
        }
    }, [open, subscription]);

    const loadLabels = async () => {
        const uniqueLabels = await workspaceDB!.getAllUniqueLabels();
        setAvailableLabels(uniqueLabels);
    };

    const handleNameChange = async (name: string) => {
        setFormData((prev) => ({ ...prev, name }));

        // Check for known service
        const knownService = getKnownService(name);
        if (knownService && !formData.icon) {
            setFormData((prev) => ({ ...prev, icon: knownService.icon }));
        }
    };

    const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                const imageDataUrl = e.target?.result as string;
                setFormData((prev) => ({ ...prev, icon: imageDataUrl }));

                // Extract colors from the uploaded image
                try {
                    const colors = await extractColorsFromImage(imageDataUrl, formData.name);
                    setFormData((prev) => ({ ...prev, colors }));
                } catch (error) {
                    console.error("Failed to extract colors from image:", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const addLabel = () => {
        if (newLabel && !formData.labels.includes(newLabel)) {
            setFormData((prev) => ({ ...prev, labels: [...prev.labels, newLabel] }));
            if (!availableLabels.includes(newLabel)) {
                setAvailableLabels((prev) => [...prev, newLabel]);
            }
            setNewLabel("");
        }
    };

    const removeLabel = (label: string) => {
        setFormData((prev) => ({ ...prev, labels: prev.labels.filter((l) => l !== label) }));
    };

    const validateAmount = () => {
        const amount = formData.amount.trim();
        const errors = { ...validationErrors };

        if (!amount) {
            errors.amount = "Amount is required";
        } else if (!/^\d*\.?\d+$/.test(amount)) {
            errors.amount = "Only numbers and decimal points are allowed";
        } else if (Number.parseFloat(amount) <= 0) {
            errors.amount = "Amount must be greater than 0";
        } else if (Number.parseFloat(amount) > 999999) {
            errors.amount = "Amount is too large";
        } else {
            delete errors.amount;
        }

        setValidationErrors(errors);
        setIsFormValid(Object.keys(errors).length === 0);
    };

    const handleUrlBlur = async (url: string) => {
        if (url) {
            setIsLoadingFavicon(true);
            try {
                const favicon = await fetchFaviconAsDataUrl(url);
                if (favicon) {
                    // Store the favicon service URL directly (e.g., https://newfav.mohannad-otaibi.workers.dev/?url=...)
                    setFormData((prev) => ({ ...prev, icon: favicon }));
                    
                    // Extract colors from the favicon service URL (no CORS issues)
                    try {
                        const colors = await extractColorsFromImage(favicon, formData.name);
                        setFormData((prev) => ({ ...prev, colors }));
                    } catch (error) {
                        console.error("Failed to extract colors from favicon:", error);
                    }
                }
            } catch (error) {
                console.log("Could not fetch favicon:", error);
            } finally {
                setIsLoadingFavicon(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            amount: "",
            currency: "SAR",
            frequency: "monthly",
            nextPayment: "",
            startDate: "",
            url: "",
            icon: "",
            comment: "",
            labels: [],
            autoRenewal: true,
            colors: undefined,
        });
        setValidationErrors({});
        setIsFormValid(true);
    };

    const handleSubmit = async (e: React.FormEvent, saveAndAddMore = false) => {
        e.preventDefault();

        // Validate amount one more time before submit
        validateAmount();
        if (!isFormValid || validationErrors.amount) {
            return;
        }

        const subscriptionData = {
            name: formData.name,
            amount: Number.parseFloat(formData.amount),
            currency: formData.currency,
            frequency: formData.frequency,
            nextPayment: formData.nextPayment,
            startDate: formData.startDate || undefined,
            url: formData.url || undefined,
            icon: formData.icon || undefined,
            comment: formData.comment || undefined,
            labels: formData.labels,
            autoRenewal: formData.autoRenewal,
            colors: formData.colors,
        };

        try {
            if (subscription) {
                await workspaceDB!.updateSubscription(subscription.id, subscriptionData);
            } else {
                await workspaceDB!.addSubscription(subscriptionData);
            }

            onSave();

            if (saveAndAddMore && !subscription) {
                // Reset form but keep modal open
                resetForm();
            } else {
                // Close modal and reset form if needed
                setOpen(false);
                if (!subscription) {
                    resetForm();
                }
            }
        } catch (error) {
            console.error("Error saving subscription:", error);
        }
    };

    const handleDelete = async () => {
        if (!subscription) return;

        if (!confirm(`Are you sure you want to delete "${subscription.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setIsDeleting(true);
            onDeleteStart?.();
            await workspaceDB!.deleteSubscription(subscription.id);
            onSave(); // Refresh the list
            setOpen(false); // Close modal
        } catch (error) {
            console.error("Error deleting subscription:", error);
        } finally {
            setIsDeleting(false);
            onDeleteEnd?.();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subscription
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{subscription ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="name">Service Name *</Label>
                            <Input id="name" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} required />
                        </div>
                        <div className="col-span-2">
                            <div className="">
                                <div className="">
                                    <Label htmlFor="url">Website URL</Label>
                                    <div className="flex gap-2">
                                    <Input id="url" type="url" value={formData.url} onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))} onBlur={(e) => handleUrlBlur(e.target.value)} placeholder="https://example.com" />
                                    <div>
                                    <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" id="icon-upload" />
                                    <Label htmlFor="icon-upload" className="cursor-pointer">
                                        {isLoadingFavicon ? (
                                            <div className="aspect-square h-auto rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                            </div>
                                        ) : formData.icon ? (
                                            <div className="aspect-square h-auto rounded-lg flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">{formData.icon.startsWith("data:") || formData.icon.startsWith("http") ? <img src={formData.icon || "/placeholder.svg"} alt="Icon" className="rounded" /> : <span className="text-2xl">{formData.icon}</span>}</div>
                                        ) : null}
                                        </Label>
                                    {isLoadingFavicon && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Fetching website icon...</p>}
                                    </div>
                                    </div>
                                </div>
                                        
                            </div>
                        </div>

                        <div className="col-span-2 grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                            <Label htmlFor="amount">Amount *</Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input id="amount" type="text" inputMode="decimal" value={formData.amount} onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))} onBlur={validateAmount} placeholder="0.00" className={validationErrors.amount ? "border-red-500" : ""} required />
                                    {validationErrors.amount && <p className="text-sm text-red-500 mt-1">{validationErrors.amount}</p>}
                                </div>
                                <Select value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                        <SelectItem value="CAD">CAD</SelectItem>
                                        <SelectItem value="SAR">SAR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            </div>
                            <div>
                            <Label htmlFor="frequency">Frequency *</Label>
                            <Select value={formData.frequency} onValueChange={(value: SubscriptionFrequency) => setFormData((prev) => ({ ...prev, frequency: value }))}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </div>
                        
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="auto-renewal">Automatic Renewal</Label>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Automatically track renewal dates and notifications</p>
                        </div>
                        <Switch id="auto-renewal" checked={formData.autoRenewal} onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, autoRenewal: checked }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        

                        <div>
                            <Label htmlFor="nextPayment">Next Payment *</Label>
                            <Input id="nextPayment" type="date" value={formData.nextPayment} onChange={(e) => setFormData((prev) => ({ ...prev, nextPayment: e.target.value }))} required />
                        </div>

                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))} />
                        </div>


                    </div>

                    <div>
                        <Label>Labels</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.labels.map((label) => (
                                <Badge key={label} variant="secondary" className="flex items-center gap-1">
                                    {label}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeLabel(label)} />
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add label" onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())} />
                            <Button type="button" onClick={addLabel} size="sm">
                                Add
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea id="comment" value={formData.comment} onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))} placeholder="Add any notes about this subscription..." />
                    </div>

                    <DialogFooter>
                        {subscription && (
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            {!subscription && (
                                <Button type="button" variant="secondary" disabled={!isFormValid} onClick={(e) => handleSubmit(e, true)}>
                                    Save & Add More
                                </Button>
                            )}
                            <Button type="submit" disabled={!isFormValid}>
                                {subscription ? "Update" : "Save"} Subscription
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
                
            </DialogContent>

        </Dialog>
    );
}
