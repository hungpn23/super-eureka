<script setup lang="ts">
import type { PageSectionProps } from "@nuxt/ui";

definePageMeta({
	auth: false,
});

useSeoMeta({
	title: "Vocabify — Master any subject, one success at a time",
	description:
		"A modern vocabulary-learning app built on spaced repetition. Create decks, study with flashcards, learn mode, and test mode, and share with the community.",
});

const { status } = useAuthState();

const primaryCtaTo = computed(() =>
	status.value === "authenticated" ? "/library" : "/sign-up",
);
const primaryCtaLabel = computed(() =>
	status.value === "authenticated"
		? "Go to library"
		: "Get started — it’s free",
);

const studyModes = [
	{
		title: "Flashcards",
		description:
			"Classic flip-card review with know / don’t-know tracking, a retry queue for missed cards, and auto-saved progress.",
		icon: "i-lucide-layers",
	},
	{
		title: "Learn mode",
		description:
			"Multiple-choice and written answers, bi-directional practice, hint system, and inline answer-diff highlighting.",
		icon: "i-lucide-brain-circuit",
	},
	{
		title: "Test mode",
		description:
			"Quiz-style assessments with configurable question count, mixed question types, and a clean results breakdown.",
		icon: "i-lucide-clipboard-check",
	},
] satisfies PageSectionProps["features"];

const communityFeatures = [
	{
		title: "Public & protected sharing",
		description:
			"Publish decks to the community, keep them private, or gate them behind a passcode.",
		icon: "i-lucide-share-2",
	},
	{
		title: "Real-time notifications",
		description:
			"Get pinged the moment someone clones your deck, powered by Socket.IO.",
		icon: "i-lucide-bell-ring",
	},
	{
		title: "Clone & remix",
		description:
			"Found a great deck? Clone it to your library in one click and make it your own.",
		icon: "i-lucide-copy",
	},
	{
		title: "Study stats",
		description:
			"Track current and longest streaks, total cards learned, and mastery rate over time.",
		icon: "i-lucide-bar-chart-3",
	},
] satisfies PageSectionProps["features"];

const signInOptions = [
	{
		title: "Email & password",
		description: "Classic sign-up with OTP email verification.",
		icon: "i-lucide-mail",
	},
	{
		title: "Google OAuth",
		description: "One-click sign-in via Google — no passwords needed.",
		icon: "i-simple-icons-google",
	},
	{
		title: "Magic link",
		description: "Passwordless login delivered straight to your inbox.",
		icon: "i-lucide-wand-sparkles",
	},
] satisfies PageSectionProps["features"];

const stats = [
	{ label: "Study modes", value: "3" },
	{ label: "Card statuses", value: "new → learning → known" },
	{ label: "Sign-in methods", value: "3" },
	{ label: "Cost to get started", value: "$0" },
];
</script>

<template>
	<div>
		<!-- Hero -->
		<UPageHero
			orientation="horizontal"
			:ui="{
				container: 'relative isolate overflow-hidden',
				title: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight',
				description: 'text-lg',
			}"
		>
			<template #headline>
				<UBadge
					color="primary"
					variant="subtle"
					size="lg"
					icon="i-lucide-sparkles"
					label="Powered by spaced repetition"
					class="rounded-full"
				/>
			</template>

			<template #title>
				<span>Master any subject,</span>
				<br>
				<span
					class="bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
				>
					one success at a time.
				</span>
			</template>

			<template #description>
				Vocabify is a modern vocabulary-learning app that helps you memorize
				what matters. Build decks, drill them with three proven study modes, and
				track every streak along the way.
			</template>

			<template #links>
				<UButton
					:to="primaryCtaTo"
					:label="primaryCtaLabel"
					size="xl"
					icon="i-lucide-rocket"
					trailing-icon="i-lucide-arrow-right"
				/>
				<UButton
					to="/shared"
					label="Browse community decks"
					color="neutral"
					variant="subtle"
					size="xl"
					icon="i-lucide-compass"
				/>
			</template>

			<!-- Decorative flashcard stack -->
			<div class="relative mx-auto w-full max-w-md">
				<div
					aria-hidden="true"
					class="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-tr from-primary-500/20 via-secondary-500/10 to-transparent blur-2xl"
				/>

				<UCard
					:ui="{
						root: 'absolute -top-6 -left-4 w-72 rotate-[-6deg] shadow-xl ring ring-default/60',
						body: 'p-5',
					}"
				>
					<div class="flex items-center gap-2 text-xs text-muted">
						<UIcon name="i-lucide-layers" class="size-4" />
						<span>Flashcard · new</span>
					</div>
					<p class="mt-3 text-xl font-semibold text-highlighted">Ephemeral</p>
					<p class="mt-1 text-sm text-muted italic">/ɪˈfem.ər.əl/ · adj.</p>
					<p class="mt-3 text-sm text-toned">Lasting for a very short time.</p>
				</UCard>

				<UCard
					:ui="{
						root: 'w-full rotate-[2deg] shadow-2xl ring ring-primary/40',
						body: 'p-6',
					}"
				>
					<div class="flex items-center justify-between">
						<UBadge color="primary" variant="soft" label="Learn mode" />
						<span class="text-xs text-muted">Streak · 4</span>
					</div>
					<p class="mt-4 text-sm text-muted">Which word means…</p>
					<p class="mt-1 text-2xl font-bold text-highlighted">
						“A new version of something”?
					</p>
					<div class="mt-5 grid grid-cols-2 gap-2">
						<UButton
							label="Iteration"
							variant="outline"
							color="neutral"
							block
						/>
						<UButton
							label="Retention"
							variant="outline"
							color="neutral"
							block
						/>
						<UButton label="Ephemera" variant="outline" color="neutral" block />
						<UButton label="Revision" variant="soft" color="primary" block />
					</div>
				</UCard>

				<UCard
					:ui="{
						root: 'absolute -bottom-8 -right-4 w-64 rotate-[5deg] shadow-xl ring ring-default/60',
						body: 'p-5',
					}"
				>
					<div class="flex items-center gap-2 text-xs text-muted">
						<UIcon name="i-lucide-clipboard-check" class="size-4" />
						<span>Test · 12 / 15 correct</span>
					</div>
					<div class="mt-3 h-2 w-full rounded-full bg-muted">
						<div class="h-2 w-4/5 rounded-full bg-primary" />
					</div>
					<p class="mt-3 text-sm text-toned">Mastery rate · 80%</p>
				</UCard>
			</div>
		</UPageHero>

		<!-- Stats strip -->
		<UContainer>
			<UPageCard
				variant="subtle"
				:ui="{
					root: 'rounded-2xl ring ring-primary/20 bg-gradient-to-br from-primary-500/5 via-default to-secondary-500/5 shadow-lg',
					body: 'p-0',
				}"
			>
				<dl
					class="grid grid-cols-2 divide-y divide-default md:grid-cols-4 md:divide-y-0 md:divide-x"
				>
					<div
						v-for="stat in stats"
						:key="stat.label"
						class="flex flex-col items-center justify-center gap-2 p-6 text-center md:p-8"
					>
						<dt class="text-xs font-medium tracking-wide text-muted uppercase">
							{{ stat.label }}
						</dt>
						<dd class="text-2xl font-bold text-highlighted md:text-3xl">
							{{ stat.value }}
						</dd>
					</div>
				</dl>
			</UPageCard>
		</UContainer>

		<!-- Three study modes -->
		<UPageSection
			id="study-modes"
			headline="Three ways to study"
			title="Pick the mode that fits your brain today."
			description="Every deck automatically supports all three modes. Mix them up to keep things fresh."
			:features="studyModes"
		/>

		<!-- Spaced repetition explainer -->
		<UPageSection
			orientation="horizontal"
			headline="Spaced repetition, done right"
			title="Review what you’re about to forget — not what you already know."
			description="Every card has a streak, a review date, and a learning status. Due cards surface first, new cards come next, mastered cards wait patiently in the background."
			:links="[
				{
					label: 'See it in action',
					to: '/shared',
					color: 'primary',
					icon: 'i-lucide-play',
				},
			]"
		>
			<UPageCard
				variant="subtle"
				:ui="{ root: 'rounded-2xl', body: 'p-8 space-y-5' }"
			>
				<div class="flex items-center gap-4">
					<div
						class="flex size-12 items-center justify-center rounded-xl bg-elevated ring ring-default"
					>
						<UIcon name="i-lucide-sparkles" class="size-6 text-muted" />
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<p class="font-semibold text-highlighted">New</p>
							<UBadge
								color="neutral"
								variant="subtle"
								size="sm"
								label="no review date yet"
							/>
						</div>
						<p class="text-sm text-muted">
							Fresh card, never studied. Surfaces right after due cards.
						</p>
					</div>
				</div>

				<USeparator />

				<div class="flex items-center gap-4">
					<div
						class="flex size-12 items-center justify-center rounded-xl bg-warning/10 ring ring-warning/30"
					>
						<UIcon name="i-lucide-alarm-clock" class="size-6 text-warning" />
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<p class="font-semibold text-highlighted">Learning</p>
							<UBadge
								color="warning"
								variant="subtle"
								size="sm"
								label="due today"
							/>
						</div>
						<p class="text-sm text-muted">
							Review date has arrived — time to revisit this card.
						</p>
					</div>
				</div>

				<USeparator />

				<div class="flex items-center gap-4">
					<div
						class="flex size-12 items-center justify-center rounded-xl bg-success/10 ring ring-success/30"
					>
						<UIcon name="i-lucide-check-circle-2" class="size-6 text-success" />
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<p class="font-semibold text-highlighted">Known</p>
							<UBadge
								color="success"
								variant="subtle"
								size="sm"
								label="reviewed · streak +1"
							/>
						</div>
						<p class="text-sm text-muted">
							Mastered for now. We’ll bring it back when it matters.
						</p>
					</div>
				</div>
			</UPageCard>
		</UPageSection>

		<!-- Community + tracking -->
		<UPageSection
			headline="Built for the community"
			title="Learn together, not alone."
			description="Share your best decks, clone what others made, and get notified when your work helps someone else."
			:features="communityFeatures"
			:ui="{ features: 'lg:grid-cols-4' }"
		/>

		<!-- Sign-in methods -->
		<UPageSection
			orientation="horizontal"
			reverse
			headline="Authentication"
			title="Sign in the way you like."
			description="Three flows, zero friction. Sessions are backed by rotating JWTs — access for 30 minutes, refresh for up to 14 days."
			:features="signInOptions"
			:links="[
				{
					label: 'Create an account',
					to: '/sign-up',
					color: 'primary',
					icon: 'i-lucide-user-plus',
				},
				{
					label: 'I already have one',
					to: '/login',
					color: 'neutral',
					variant: 'subtle',
					trailingIcon: 'i-lucide-arrow-right',
				},
			]"
		>
			<div class="relative mx-auto w-full max-w-md">
				<div
					aria-hidden="true"
					class="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-linear-to-br from-primary-500/20 via-secondary-500/10 to-transparent blur-2xl"
				/>

				<UCard
					:ui="{
						root: 'shadow-2xl ring ring-primary/30',
						body: 'p-6 space-y-5',
					}"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring ring-primary/30"
						>
							<UIcon name="i-lucide-lock-keyhole" class="size-5 text-primary" />
						</div>
						<div>
							<p class="font-semibold text-highlighted">Welcome back</p>
							<p class="text-xs text-muted">Sign in to continue learning</p>
						</div>
					</div>

					<div class="space-y-3">
						<UButton
							block
							size="lg"
							color="neutral"
							variant="outline"
							icon="i-simple-icons-google"
							label="Continue with Google"
						/>
						<UButton
							block
							size="lg"
							color="neutral"
							variant="outline"
							icon="i-lucide-wand-sparkles"
							label="Send me a magic link"
						/>
					</div>

					<div class="flex items-center gap-3 text-xs text-muted">
						<USeparator class="flex-1" />
						<span>or</span>
						<USeparator class="flex-1" />
					</div>

					<div class="space-y-3">
						<div>
							<p class="mb-1.5 text-xs font-medium text-muted">Email</p>
							<div
								class="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2 ring ring-default"
							>
								<UIcon name="i-lucide-mail" class="size-4 text-muted" />
								<span class="text-sm text-toned">you@vocabify.app</span>
							</div>
						</div>
						<div>
							<p class="mb-1.5 text-xs font-medium text-muted">Password</p>
							<div
								class="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2 ring ring-default"
							>
								<UIcon name="i-lucide-key-round" class="size-4 text-muted" />
								<span class="text-sm tracking-widest text-toned">••••••••</span>
							</div>
						</div>
					</div>

					<UButton
						block
						size="lg"
						color="primary"
						label="Sign in"
						trailing-icon="i-lucide-arrow-right"
					/>

					<div
						class="flex items-center justify-center gap-1.5 text-xs text-muted"
					>
						<UIcon name="i-lucide-shield-check" class="size-3.5 text-success" />
						<span>Protected by rotating JWTs · 30 min access</span>
					</div>
				</UCard>
			</div>
		</UPageSection>

		<!-- Final CTA -->
		<UPageCTA
			variant="subtle"
			title="Ready to remember more, for longer?"
			description="Create your first deck in under a minute — no credit card, no setup, no fluff."
			:links="[
				{
					label: primaryCtaLabel,
					to: primaryCtaTo,
					icon: 'i-lucide-rocket',
					size: 'xl',
				},
				{
					label: 'Explore community decks',
					to: '/shared',
					color: 'neutral',
					variant: 'subtle',
					trailingIcon: 'i-lucide-arrow-right',
					size: 'xl',
				},
			]"
			:ui="{
        root: 'rounded-none',
				container: 'relative isolate overflow-hidden',
			}"
		/>
	</div>
</template>
