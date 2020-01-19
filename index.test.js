/**
 * @jest-environment node
 */

const waitOn = require("wait-on");
const axios = require("axios");

const { API_URL = "http://localhost:8080", DB_PORT = "8081" } = process.env;

beforeAll(() => waitOn({ resources: [API_URL, `tcp:${DB_PORT}`] }));

describe("update function", () => {
  test("access denied if auth is wrong", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/update`, {
        auth: process.env.AUTH_KEY.slice(0, -1)
      })
      .catch(error => {
        expect(error.response.status).toEqual(401);
        expect(error.response.data).toMatchInlineSnapshot(`"Access denied"`);
      });
  });
  test("bad request if webhook is missing", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/update`, {
        auth: process.env.AUTH_KEY
      })
      .catch(error => {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toMatchInlineSnapshot(
          `"Required argument \\"webhook\\" is missing or empty"`
        );
      });
  });
  test("bad request if active is invalid", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/update`, {
        auth: process.env.AUTH_KEY,
        webhook: "https://postman-echo.com/response-headers?dog=Rosa",
        active: "invalid"
      })
      .catch(error => {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toMatchInlineSnapshot(
          `"Required argument \\"active\\" is missing or invalid, it must \\"true\\" or \\"false\\""`
        );
      });
  });
});

describe("trigger function", () => {
  test("access denied if auth is wrong", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/trigger`, {
        auth: process.env.AUTH_KEY.slice(0, -1)
      })
      .catch(error => {
        expect(error.response.status).toEqual(401);
        expect(error.response.data).toMatchInlineSnapshot(`"Access denied"`);
      });
  });
  test("bad request if webhook is missing", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/trigger`, {
        auth: process.env.AUTH_KEY
      })
      .catch(error => {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toMatchInlineSnapshot(
          `"Required argument \\"webhook\\" is missing or empty"`
        );
      });
  });
});

describe("both functions together", () => {
  test("no-op triggering a webhook that thas never been updated", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/trigger`, {
        auth: process.env.AUTH_KEY,
        webhook: "https://postman-echo.com/response-headers?dog=Rosa"
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(
          `"Webhook was not triggered"`
        );
      });
  });
  test("can update a webhook to active", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/update`, {
        auth: process.env.AUTH_KEY,
        webhook: "https://postman-echo.com/response-headers?dog=Rosa",
        active: true
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(
          `"Webhook updated successfully"`
        );
      });
  });
  test("can trigger an active webhook", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/trigger`, {
        auth: process.env.AUTH_KEY,
        webhook: "https://postman-echo.com/response-headers?dog=Rosa"
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(`
          Object {
            "dog": "Rosa",
          }
        `);
      });
  });
  test("can update a webhook to inactive", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/update`, {
        auth: process.env.AUTH_KEY,
        webhook: "https://postman-echo.com/response-headers?dog=Rosa",
        active: false
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(
          `"Webhook updated successfully"`
        );
      });
  });
  test("no-op triggering an inactive webhook", () => {
    expect.assertions(2);
    return axios
      .post(`${API_URL}/trigger`, {
        auth: process.env.AUTH_KEY,
        webhook: "https://postman-echo.com/response-headers?dog=Rosa"
      })
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.data).toMatchInlineSnapshot(
          `"Webhook was not triggered"`
        );
      });
  });
});
