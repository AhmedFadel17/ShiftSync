export const NavbarRoutes = [
    { path: "/", label: "Home" },
    {
        label: "Games",
        path: "#",
        isDropdown: true,
        children: [
            { path: "/dashboard", label: "All Game Modes" },
            { path: "/games/top-list", label: "Top List", badge: "Hot" },
            { path: "/games/guess-the-player", label: "Guess The Player" },
            { path: "/games/football-grid", label: "Football Grid" },
            { path: "/games/bingo-football", label: "Football Bingo" },
        ],
    },
    { path: "/daily-challenge", label: "Daily Quiz", badge: "New" },
    { path: "/leaderboard", label: "Global Ranks" },
    { path: "/how-to-play", label: "How to Play" },
];