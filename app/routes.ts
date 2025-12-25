import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    // Auth routes (no layout - full page)
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

    // Main app routes (with layout)
    layout("routes/_layout.tsx", [
        index("routes/home.tsx"),
    ])
] satisfies RouteConfig;
