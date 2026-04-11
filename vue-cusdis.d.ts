declare module "vue-cusdis" {
	import type { DefineComponent } from "vue";

	const VueCusdis: DefineComponent<{
		attrs: {
			host?: string;
			appId: string;
			pageId: string;
			pageTitle?: string;
			pageUrl?: string;
			theme?: string;
		};
		lang?: string;
	}>;

	export default VueCusdis;
}
