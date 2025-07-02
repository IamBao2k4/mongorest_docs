export const GATEWAY_TYPE = {
  HTTP: {
    MONGOREST: {
        NAME: "MONGOREST",
        METHOD: {
            GET: "GET",
            POST: "POST",
            PUT: "PUT",
            DELETE: "DELETE",
            PATCH: "PATCH",
            OPTIONS: "OPTIONS",
        },
        URL: "URL",
        API_KEY: "API_KEY",
    },
    MEDIA: {
        NAME: "MEDIA",
        METHOD: {
            GET: "GET",
        },
        URL: "URL",
        API_KEY: "API_KEY",
    },
  },
  RGPC : {}
} as const;