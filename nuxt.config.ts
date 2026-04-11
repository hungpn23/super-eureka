// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			apiUrl: "",
			cusdisAppId: "",
			cusdisHost: "https://cusdis.com",
			googleClientId: "",
			googleRedirectUri: "",
		},
	},

	modules: [
		"@nuxt/ui",
		"@vueuse/nuxt",
		"@sidebase/nuxt-auth",
		"@pinia/nuxt",
		"pinia-plugin-persistedstate/nuxt",
		"@nuxt/image",
	],

	devtools: {
		enabled: false,
	},

	css: ["~/assets/css/main.css"],

	compatibilityDate: "2024-07-11",

	// https://auth.sidebase.io/guide/local/quick-start
	auth: {
		globalAppMiddleware: true,
		provider: {
			type: "local",
			endpoints: { signUp: { path: "/register" } },
			token: {
				signInResponseTokenPointer: "/accessToken",
				maxAgeInSeconds: 1800, // 30 minutes
			},
			refresh: {
				isEnabled: true,
				refreshOnlyToken: false,
				token: { maxAgeInSeconds: 1_209_600 }, // 14 days
			},
			pages: { login: "/login" },
			session: {
				dataType: {
					id: "string",
					username: "string",
					email: "string",
					emailVerified: "boolean",
					avatar: `{
                url: string,
                fileId: string,
                folder: string,
              } | null`,
					role: "number",
					createdAt: "string",
					updatedAt: "string | null",
				},
			},
		},
	},
});
