require("esbuild")
    .build({
        entryPoints: ["packages/multichain-one-click-connect/src/index.ts"],
        bundle: true,
        outfile: "packages/multichain-one-click-connect/lib/bundle.js",
        platform: "browser",
        target: ["es2015"],
        loader: { ".ts": "ts" },
    })
    .catch(() => process.exit(1));
