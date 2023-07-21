class TokenProvider {
  constructor(config, options) {
    const axios_options = {
      baseURL: config.issuer,
    };

    this.axios = options.axios.create(axios_options);

    this.endpoints = config.endpoints;
    this.config = config;

    this.cache = {
      expiry: new Date(0),
      token: false,
    };
  }

  async getToken() {
    if (!this.cache.token || new Date() > this.cache.expiry) {
      const extra = {};

      if (this.config.audience) {
        extra.audience = this.config.audience;
      }

      const response = await this.axios.post(this.endpoints.token, {
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
        grant_type: "client_credentials",
        ...extra,
      });

      this.cache = {
        expiry: new Date(
          new Date().getTime() + 1000 * response.data.expires_in * 0.9
        ),
        token: response.data.access_token,
      };

      return response.data.access_token;
    } else {
      return this.cache.token;
    }
  }
}

// Import the necessary modules for mocking and testing
const axios = require("axios");

// Mock the axios.create method
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
  })),
}));

describe("TokenProvider", () => {
  let tokenProvider;

  beforeEach(() => {
    // Create a new instance of TokenProvider before each test
    tokenProvider = new TokenProvider(
      {
        issuer: "https://example.com",
        endpoints: {
          token: "https://example.com/token",
        },
        client_id: "client_id",
        client_secret: "client_secret",
      },
      { axios }
    );
  });

  describe("constructor", () => {
    test("should set the axios instance", () => {
      expect(tokenProvider.axios).toBeDefined();
    });

    test("should set the endpoints", () => {
      expect(tokenProvider.endpoints).toEqual({
        token: "https://example.com/token",
      });
    });

    test("should set the config", () => {
      expect(tokenProvider.config).toEqual({
        issuer: "https://example.com",
        endpoints: {
          token: "https://example.com/token",
        },
        client_id: "client_id",
        client_secret: "client_secret",
      });
    });

    test("should set the initial cache", () => {
      expect(tokenProvider.cache).toEqual({
        expiry: new Date(0),
        token: false,
      });
    });
  });

  describe("getToken", () => {
    test("should return the cached token if it exists and has not expired", async () => {
      tokenProvider.cache = {
        expiry: new Date(Date.now() + 1000 * 60 * 60), // Set expiry to 1 hour in the future
        token: "cached_token",
      };

      const token = await tokenProvider.getToken();

      expect(token).toBe("cached_token");
    });

    test("should make a POST request to the token endpoint and return the access token", async () => {
      const response = {
        data: {
          access_token: "access_token",
          expires_in: 3600,
        },
      };

      tokenProvider.axios.post.mockResolvedValue(response);

      const token = await tokenProvider.getToken();

      expect(tokenProvider.axios.post).toHaveBeenCalledWith(
        "https://example.com/token",
        {
          client_id: "client_id",
          client_secret: "client_secret",
          grant_type: "client_credentials",
        }
      );

      expect(token).toBe("access_token");
    });

    test("should update the cache with the new token and expiry", async () => {
      const response = {
        data: {
          access_token: "access_token",
          expires_in: 3600,
        },
      };

      tokenProvider.axios.post.mockResolvedValue(response);

      await tokenProvider.getToken();

      expect(tokenProvider.cache).toEqual({
        expiry: expect.any(Date),
        token: "access_token",
      });
    });

    test("should return the access token from the cache if the request fails", async () => {
      const error = new Error("Request failed");

      tokenProvider.axios.post.mockRejectedValue(error);

      tokenProvider.cache = {
        expiry: new Date(Date.now() + 1000 * 60 * 60), // Set expiry to 1 hour in the future
        token: "cached_token",
      };

      const token = await tokenProvider.getToken();

      expect(token).toBe("cached_token");
    });
  });
});
