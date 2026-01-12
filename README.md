# Dota 2 Counter Picker (Agentic)

A fast, intelligent Dota 2 drafting assistant that helps you pick the best heroes based on statistical advantage, common-sense heuristics, and team synergy.

![Screenshot](public/vite.svg) *Add your screenshot here*

## Features

*   **Hybrid Counter Logic**: Combines Pro-level statistical win rates with manual "Common Sense" overrides (e.g., Earthshaker vs Phantom Lancer).
*   **Synergy Engine**: Suggests picks that fit your team's role composition (Need Support, Need Core, etc.) even if you haven't selected enemy heroes yet.
*   **Team Balance**: checks for missing roles (Pos 1-5) and attack types (Melee vs Ranged).
*   **Search**: Fast search by Hero Name or Common Abbreviations (e.g., "pl", "am", "cw").
*   **Instant Analysis**: Caches data locally for sub-20ms response times.
*   **Role Filters**: Filter suggestions by Carry, Mid, Offlane, or Support.

## Getting Started

### Prerequisites

*   Node.js (v18+)

### Installation

1.  Clone the repo:
    ```bash
    git clone https://github.com/yourusername/dota-counter-picker-ag.git
    cd dota-counter-picker-ag
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```

## Usage

1.  Select **Enemy Heroes** to see statistical counter picks.
2.  Select **My Team** to see synergy suggestions and avoid duplicate picks.
3.  Use the **Role Filters** (Carry/Mid/Offlane/Support) to tailor suggestions to your lane.
4.  Look for tags like `Counters Illusions` or `Needed Support` to understand the suggestion.

## Tech Stack

*   React + Vite
*   TypeScript
*   Tailwind CSS
*   OpenDota API
*   Lucide React

## License

MIT
