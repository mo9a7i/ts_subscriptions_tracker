import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { SectionHeader } from "@/components/common";
import { testimonials } from "@/data/testimonials";

export function TestimonialsSection() {
    return (
        <section className="min-h-screen py-20 flex justify-center items-center px-4 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="container mx-auto">
                <SectionHeader title="Loved by users worldwide" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.id} className="border-0 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {Array.from({ length: testimonial.rating }, (_, index) => (
                                        <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                        <span className="text-sm font-semibold">{testimonial.author.avatar}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold">{testimonial.author.name}</div>
                                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {testimonial.author.title}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
} 