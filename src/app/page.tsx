import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreditCard, Bell, Tag, Shield, Smartphone, BarChart3, ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import MyHeader from "@/components/layout/header";
import { useEffect, useState } from "react";

export default function Home() {
    const features = [
        {
            icon: CreditCard,
            title: "Track All Subscriptions",
            description: "Keep track of all your recurring payments in one centralized dashboard.",
        },
        {
            icon: Bell,
            title: "Payment Reminders",
            description: "Never miss a payment with smart notifications and due date tracking.",
        },
        {
            icon: Tag,
            title: "Smart Labeling",
            description: "Organize subscriptions with custom labels and filter by categories.",
        },
        {
            icon: Shield,
            title: "Privacy First",
            description: "Your data stays in your browser. Optional cloud sync when you need it.",
        },
        {
            icon: Smartphone,
            title: "Mobile Friendly",
            description: "Access your subscriptions anywhere with our responsive design.",
        },
        {
            icon: BarChart3,
            title: "Spending Analytics",
            description: "Understand your spending patterns with detailed cost breakdowns.",
        },
    ];

    const screenshots = [
        {
            title: "Dashboard Overview",
            description: "Get a complete overview of your subscription spending",
            image: "/placeholder.svg?height=400&width=600",
        },
        {
            title: "Add Subscriptions",
            description: "Easily add new subscriptions with auto-detection",
            image: "/placeholder.svg?height=400&width=600",
        },
        {
            title: "Filter & Organize",
            description: "Use labels to organize and filter your subscriptions",
            image: "/placeholder.svg?height=400&width=600",
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-50  dark:bg-neutral-900">
            {/* Hero Section */}
            <section className="h-screen">
                <MyHeader />
                <div className="flex flex-col justify-center items-center h-full">
                    <div className="container mx-auto text-center">
                        <Badge variant="secondary" className="mb-4">
                            🎉 Now with offline support
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                            Take Control of Your
                            <br />
                            Subscription Spending
                        </h1>
                        <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">Track, manage, and optimize all your recurring payments in one beautiful dashboard. Never lose track of your subscriptions again.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/dashboard">
                                <Button size="lg" className="text-lg px-8 ">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">100%</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">Privacy Focused</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">0</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">Setup Required</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">∞</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">Subscriptions</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="h-screen  flex justify-center items-center px-4 bg-neutral-900 text-white dark:text-neutral-500">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage subscriptions</h2>
                        <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">Powerful features designed to help you stay on top of your recurring payments</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-neutral-950 to-neutral-900 text-white dark:bg-neutral-900/50">
                                <CardHeader>
                                    <feature.icon className="w-10 h-10 text-primary mb-4" />
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-neutral-400 dark:text-neutral-400">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Screenshots Section */}
            <section className="min-h-screen py-20 bg-gradient-to-t from-neutral-50 to-neutral-200  dark:bg-neutral-900/50 flex justify-center items-center px-4 ">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">See SubTracker in action</h2>
                        <p className="text-xl text-neutral-500 dark:text-neutral-400">Beautiful, intuitive interface designed for ease of use</p>
                    </div>

                    <div className="space-y-20">
                        {screenshots.map((screenshot, index) => (
                            <div key={index} className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-4">{screenshot.title}</h3>
                                    <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-6">{screenshot.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Easy to use interface</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 justify-center items-center flex bg-neutral-100 dark:bg-neutral-900/30 p-4">
                                        <Image src={screenshot.image || "/placeholder.svg"} alt={screenshot.title} width={600} height={400} className="rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="min-h-screen py-20 flex justify-center items-center px-4 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by users worldwide</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-0 shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="flex mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">"SubTracker has completely changed how I manage my subscriptions. I've saved hundreds of dollars by catching unused services!"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                            <span className="text-sm font-semibold">U{i}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold">User {i}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">Verified User</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="min-h-screen/2 py-20 flex justify-center items-center px-4 bg-neutral-950 text-white">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to take control?</h2>
                    <p className="text-xl text-neutral-300 dark:text-neutral-500 mb-8 max-w-2xl mx-auto">Start tracking your subscriptions today. No signup required, your data stays private and secure.</p>
                    <Link href="/dashboard">
                        <Button size="lg" className="text-lg px-8 bg-white text-neutral-950">
                            Start Tracking Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 py-12 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <span className="font-semibold">SubTracker</span>
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">© 2024 SubTracker. Built with privacy in mind.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
