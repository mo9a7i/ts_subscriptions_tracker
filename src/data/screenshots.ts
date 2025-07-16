export interface Screenshot {
    title: string;
    description: string;
    image: string;
    darkImage: string;
}

export const screenshots: Screenshot[] = [
    {
        title: "Smart Dashboard Overview",
        description: "See all your subscriptions at a glance with auto-detected icons and smart sorting. Quickly identify which subscriptions cost the most and when they're due next.",
        image: "/screenshots/light_image.png",
        darkImage: "/screenshots/dark_image.png",
    },
    {
        title: "Enhanced Sorting & Organization",
        description: "Sort by amount, next payment, or name with one-click ascending/descending options. Find expensive subscriptions instantly to make informed decisions about what to keep.",
        image: "/screenshots/light_add.png",
        darkImage: "/screenshots/dark_add.png",
    },
    {
        title: "Cost Awareness Tools",
        description: "Use labels and filters to categorize subscriptions by importance. Visual indicators help you spot which services are worth their cost and which ones to reconsider.",
        image: "/screenshots/light_filters.png",
        darkImage: "/screenshots/dark_filters.png",
    },
]; 