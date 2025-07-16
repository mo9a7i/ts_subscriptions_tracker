export interface Testimonial {
    id: number;
    rating: number;
    content: string;
    author: {
        name: string;
        title: string;
        avatar: string;
    };
}

export const testimonials: Testimonial[] = [
    {
        id: 1,
        rating: 5,
        content: "SubTracker has completely changed how I manage my subscriptions. I've saved hundreds of dollars by catching unused services!",
        author: {
            name: "Sarah Johnson",
            title: "Verified User",
            avatar: "U1"
        }
    },
    {
        id: 2,
        rating: 5,
        content: "The payment calendar feature is brilliant! I never miss a renewal date and can plan my budget better than ever.",
        author: {
            name: "Mike Chen",
            title: "Verified User",
            avatar: "U2"
        }
    },
    {
        id: 3,
        rating: 5,
        content: "Love the privacy-first approach. My data stays local while still getting all the features I need. Perfect!",
        author: {
            name: "Emma Rodriguez",
            title: "Verified User",
            avatar: "U3"
        }
    }
]; 