import { superTokensNextWrapper } from "supertokens-node/nextjs";
// import { middleware } from "supertokens-node/framework/express";
import { NextApiRequest, NextApiResponse } from "next";
import supertokens from "supertokens-node";
import { backendConfig } from "../../../config/backendConfig";
import { getAppDirRequestHandler } from "supertokens-node/nextjs";
import { NextResponse } from "next/server";

supertokens.init(backendConfig());

const handleCall = getAppDirRequestHandler(NextResponse);

export default async function superTokens(req: NextApiRequest, res: NextApiResponse) {
    await superTokensNextWrapper(
        async () => {
            const response = await handleCall(req as any);

            // This is needed for production deployments with Vercel
            if (!response.headers.has("Cache-Control")) {
                response.headers.set("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            }

            // Set the headers and status code on the Next.js response
            response.headers.forEach((value, key) => {
                res.setHeader(key, value);
            });
            res.status(response.status).send(response.body);
        },
        req,
        res
    );

    if (!res.writableEnded) {
        res.status(404).send("Not found");
    }
}
