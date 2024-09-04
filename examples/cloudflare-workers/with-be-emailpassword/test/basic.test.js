/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/*
 * Imports
 */

// Run the tests in a DOM environment.
require("jsdom-global")();

const APP_URL = process.env.APP_URL || "http://localhost:8787";

describe("Auth API Tests", () => {
    const signupBody = {
        formFields: [
            {
                id: "email",
                value: "test@test.com",
            },
            {
                id: "password",
                value: "testpw1234",
            },
        ],
    };

    it("should sign up successfully and return status 200 with OK status", async () => {
        const response = await fetch(`${APP_URL}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(signupBody),
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("FIELD_ERROR");
        expect(data.formFields.length).toBe(1);
    });

    it("should sign in successfully and return status 200 with OK status", async () => {
        const response = await fetch(`${APP_URL}/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(signupBody),
        });

        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("OK");
    });
});
