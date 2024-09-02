import { superTokensNextWrapper } from "supertokens-node/nextjs";
import { middleware } from "supertokens-node/framework/express";
import { NextApiRequest, NextApiResponse } from "next";
import supertokens from "supertokens-node";
import { backendConfig } from "../../../config/backendConfig";

supertokens.init(backendConfig());

class CustomResponseWrapper {
    private res: NextApiResponse;
    private headers: Headers;
    private statusCode: number;
    private body: string;

    constructor(res: NextApiResponse) {
        this.res = res;
        this.headers = new Headers();
        this.statusCode = 200;
        this.body = "";
    }

    setHeader(name: string, value: string): void {
        if (typeof this.res.setHeader === "function") {
            this.res.setHeader(name, value);
        } else {
            this.headers.set(name, value);
        }
    }

    status(code: number): this {
        if (typeof this.res.status === "function") {
            this.res.status(code);
        } else {
            this.statusCode = code;
        }
        return this;
    }

    send(body: string): Response | void {
        if (typeof this.res.send === "function") {
            return this.res.send(body);
        } else {
            this.body = body;
            return new Response(this.body, {
                status: this.statusCode,
                headers: this.headers,
            });
        }
    }

    get writableEnded(): boolean {
        return typeof this.res.writableEnded !== "undefined" ? this.res.writableEnded : false;
    }
}

export default async function superTokens(req: NextApiRequest, rawRes: NextApiResponse): Promise<void | Response> {
    const res = new CustomResponseWrapper(rawRes);

    await superTokensNextWrapper(
        async (next) => {
            res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
            await middleware()(req as any, res as any, next);
        },
        req,
        res as any
    );

    if (!res.writableEnded) {
        return res.status(404).send("Not found");
    }
}
