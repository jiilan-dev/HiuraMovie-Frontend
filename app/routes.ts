import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // Auth routes (no layout - full page)
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

    // Dashboard routes (admin panel)
    layout("routes/dashboard/_layout.tsx", [
        route("dashboard", "routes/dashboard/index.tsx"),
        route("dashboard/movies", "routes/dashboard/movies.tsx"),
        route("dashboard/series", "routes/dashboard/series.tsx"),
        route("dashboard/series/:id", "routes/dashboard/series.$id.tsx"),
        route("dashboard/genres", "routes/dashboard/genres.tsx"),
        route("dashboard/users", "routes/dashboard/users.tsx"),
    ]),

    // Main app routes (with layout)
    layout("routes/_layout.tsx", [
        index("routes/home.tsx"),
        route("series", "routes/series.tsx"),
        route("series/:id", "routes/series.$id.tsx"),
        route("series/:seriesId/episode/:episodeId", "routes/series.$seriesId.episode.$episodeId.tsx"),
        route("movie/:id", "routes/movie.$id.tsx"),
        route("watch/:id", "routes/watch.$id.tsx"),
    ])
] satisfies RouteConfig;
