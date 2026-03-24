<script setup lang="ts">
import { computed, ref } from "vue";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Deck {
	id: number;
	title: string;
	description: string;
	totalCards: number;
	masteredCards: number;
	lastStudied: string | null;
	tags: string[];
	color: string;
}

// ─── State: Profile ───────────────────────────────────────────────────────────
const avatarUrl = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const avatarInputRef = ref<HTMLInputElement | null>(null);

const profileForm = reactive({
	displayName: "Nguyễn Văn Hùng",
	email: "hung@example.com",
	bio: "Đang học tiếng Anh mỗi ngày 🚀",
});

// ─── State: Password ──────────────────────────────────────────────────────────
const passwordForm = reactive({
	current: "",
	next: "",
	confirm: "",
});
const showPasswords = reactive({ current: false, next: false, confirm: false });

const passwordStrength = computed(() => {
	const p = passwordForm.next;
	if (!p) return null;
	if (p.length < 6) return { label: "Yếu", color: "error" as const, value: 25 };
	if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
		return { label: "Trung bình", color: "warning" as const, value: 60 };
	return { label: "Mạnh", color: "success" as const, value: 100 };
});

const passwordMismatch = computed(
	() => passwordForm.confirm && passwordForm.next !== passwordForm.confirm,
);

// ─── State: Decks ─────────────────────────────────────────────────────────────
const deckSearch = ref("");
const deckSort = ref("recent");

const sortOptions = [
	{ label: "Gần nhất", value: "recent" },
	{ label: "Tiêu đề A–Z", value: "alpha" },
	{ label: "Nhiều thẻ nhất", value: "cards" },
];

const decks = ref<Deck[]>([
	{
		id: 1,
		title: "IELTS Vocabulary Band 7+",
		description: "Từ vựng học thuật cần thiết cho kỳ thi IELTS",
		totalCards: 420,
		masteredCards: 420,
		lastStudied: "2025-03-23",
		tags: ["IELTS", "Academic"],
		color: "bg-sky-500",
	},
	{
		id: 2,
		title: "Business English Essentials",
		description: "Thuật ngữ tiếng Anh trong môi trường công sở",
		totalCards: 180,
		masteredCards: 95,
		lastStudied: "2025-03-21",
		tags: ["Business", "Office"],
		color: "bg-violet-500",
	},
	{
		id: 3,
		title: "Phrasal Verbs Daily",
		description: "Các cụm động từ phổ biến nhất trong tiếng Anh hàng ngày",
		totalCards: 250,
		masteredCards: 78,
		lastStudied: "2025-03-20",
		tags: ["Grammar", "Daily"],
		color: "bg-emerald-500",
	},
	{
		id: 4,
		title: "TOEIC 900 Words",
		description: "Bộ từ vựng luyện thi TOEIC đạt điểm cao",
		totalCards: 900,
		masteredCards: 540,
		lastStudied: null,
		tags: ["TOEIC"],
		color: "bg-amber-500",
	},
	{
		id: 5,
		title: "Slang & Idioms",
		description: "Thành ngữ và tiếng lóng Anh Mỹ thường gặp",
		totalCards: 130,
		masteredCards: 130,
		lastStudied: "2025-03-18",
		tags: ["Slang", "Idioms"],
		color: "bg-rose-500",
	},
]);

const filteredDecks = computed(() => {
	let list = decks.value.filter(
		(d) =>
			d.title.toLowerCase().includes(deckSearch.value.toLowerCase()) ||
			d.description.toLowerCase().includes(deckSearch.value.toLowerCase()),
	);
	if (deckSort.value === "alpha")
		list = [...list].sort((a, b) => a.title.localeCompare(b.title));
	else if (deckSort.value === "cards")
		list = [...list].sort((a, b) => b.totalCards - a.totalCards);
	return list;
});

const deckStats = computed(() => ({
	total: decks.value.length,
	totalCards: decks.value.reduce((s, d) => s + d.totalCards, 0),
	mastered: decks.value.reduce((s, d) => s + d.masteredCards, 0),
}));

// ─── Handlers ─────────────────────────────────────────────────────────────────
const toast = useToast();

function triggerAvatarUpload() {
	avatarInputRef.value?.click();
}

function onAvatarChange(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0];
	if (!file) return;
	if (file.size > 2 * 1024 * 1024) {
		toast.add({
			title: "Ảnh quá lớn",
			description: "Vui lòng chọn ảnh dưới 2MB",
			color: "error",
		});
		return;
	}
	avatarFile.value = file;
	avatarUrl.value = URL.createObjectURL(file);
	toast.add({ title: "Đã cập nhật avatar", color: "success" });
}

function removeAvatar() {
	avatarUrl.value = null;
	avatarFile.value = null;
	if (avatarInputRef.value) avatarInputRef.value.value = "";
}

function saveProfile() {
	toast.add({
		title: "Đã lưu thông tin",
		description: "Hồ sơ của bạn đã được cập nhật.",
		color: "success",
	});
}

function changePassword() {
	if (passwordMismatch.value) return;
	if (!passwordForm.current || !passwordForm.next) return;
	toast.add({
		title: "Đổi mật khẩu thành công",
		description: "Hãy dùng mật khẩu mới cho lần đăng nhập tiếp theo.",
		color: "success",
	});
	passwordForm.current = "";
	passwordForm.next = "";
	passwordForm.confirm = "";
}

function deckProgress(deck: Deck) {
	return Math.round((deck.masteredCards / deck.totalCards) * 100);
}

function formatDate(dateStr: string | null) {
	if (!dateStr) return "Chưa học";
	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(dateStr));
}

function deleteDeck(id: number) {
	const idx = decks.value.findIndex((d) => d.id === id);
	if (idx !== -1) {
		const name = decks.value?.[idx]?.title;
		decks.value.splice(idx, 1);
		toast.add({ title: `Đã xoá "${name}"`, color: "neutral" });
	}
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const tabs = [
	{ label: "Bộ thẻ", icon: "i-heroicons-squares-2x2", slot: "decks" },
	{ label: "Cài đặt", icon: "i-heroicons-cog-6-tooth", slot: "settings" },
];
</script>

<template>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
		<!-- ── Header Banner ───────────────────────────────────────────────────── -->
		<div
			class="relative h-40 overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-purple-700"
		>
			<div
				class="absolute inset-0 opacity-20"
				style="
          background-image: radial-gradient(
              circle at 20% 50%,
              white 1px,
              transparent 1px
            ),
            radial-gradient(circle at 80% 20%, white 1px, transparent 1px);
          background-size: 40px 40px;
        "
			/>
			<div
				class="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-gray-50 dark:from-gray-950 to-transparent"
			/>
		</div>

		<div class="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 pb-16">
			<!-- ── Profile Header Card ───────────────────────────────────────────── -->
			<UCard class="mb-6 shadow-lg">
				<div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
					<!-- Avatar -->
					<div class="relative shrink-0">
						<UAvatar
							:src="avatarUrl ?? undefined"
							:alt="profileForm.displayName"
							:text="profileForm.displayName.charAt(0)"
							size="3xl"
							class="ring-4 ring-white dark:ring-gray-900 shadow-md"
						/>
						<UBadge
							color="success"
							variant="solid"
							class="absolute bottom-1 right-1 w-4 h-4 rounded-full p-0 flex items-center justify-center"
						>
							<span class="sr-only">Online</span>
						</UBadge>
					</div>

					<!-- Info -->
					<div class="flex-1 min-w-0 pb-1">
						<h1
							class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
						>
							{{ profileForm.displayName }}
						</h1>
						<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
							{{ profileForm.email }}
						</p>
						<p
							v-if="profileForm.bio"
							class="text-sm text-gray-600 dark:text-gray-300 mt-1"
						>
							{{ profileForm.bio }}
						</p>
					</div>

					<!-- Stats -->
					<div class="flex gap-6 sm:gap-8 shrink-0 text-center sm:pb-1">
						<div>
							<p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
								{{ deckStats.total }}
							</p>
							<p class="text-xs text-gray-500 uppercase tracking-wide">
								Bộ thẻ
							</p>
						</div>
						<div>
							<p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
								{{ deckStats.totalCards }}
							</p>
							<p class="text-xs text-gray-500 uppercase tracking-wide">Thẻ</p>
						</div>
						<div>
							<p
								class="text-xl font-bold text-emerald-600 dark:text-emerald-400"
							>
								{{ deckStats.mastered }}
							</p>
							<p class="text-xs text-gray-500 uppercase tracking-wide">Thuộc</p>
						</div>
					</div>
				</div>
			</UCard>

			<!-- ── Main Tabs ─────────────────────────────────────────────────────── -->
			<UTabs :items="tabs" class="w-full">
				<!-- ════════════════ DECKS TAB ════════════════ -->
				<template #decks>
					<div class="mt-4 space-y-4">
						<!-- Toolbar -->
						<div class="flex flex-col sm:flex-row gap-3">
							<UInput
								v-model="deckSearch"
								icon="i-heroicons-magnifying-glass"
								placeholder="Tìm bộ thẻ..."
								class="flex-1"
							/>
							<USelect
								v-model="deckSort"
								:items="sortOptions"
								value-key="value"
								label-key="label"
								class="w-full sm:w-44"
							/>
							<UButton icon="i-heroicons-plus" color="primary" class="shrink-0">
								Tạo bộ thẻ
							</UButton>
						</div>

						<!-- Empty state -->
						<div v-if="filteredDecks.length === 0" class="py-16 text-center">
							<UIcon
								name="i-heroicons-inbox"
								class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
							/>
							<p class="text-gray-500">Không tìm thấy bộ thẻ nào.</p>
						</div>

						<!-- Deck Grid -->
						<div v-else class="grid gap-4 sm:grid-cols-2">
							<UCard
								v-for="deck in filteredDecks"
								:key="deck.id"
								class="group hover:shadow-md transition-shadow duration-200"
							>
								<div class="flex items-start gap-3">
									<!-- Color dot -->
									<div
										:class="[
                      'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                      deck.color,
                    ]"
									/>

									<div class="flex-1 min-w-0">
										<!-- Title row -->
										<div class="flex items-start justify-between gap-2">
											<h3
												class="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-1"
											>
												{{ deck.title }}
											</h3>
											<UDropdownMenu
												:items="[
                          [
                            { label: 'Học ngay', icon: 'i-heroicons-play', onSelect: () => toast.add({ title: `Bắt đầu học: ${deck.title}` }) },
                            { label: 'Chỉnh sửa', icon: 'i-heroicons-pencil', onSelect: () => toast.add({ title: 'Đang chỉnh sửa...' }) },
                          ],
                          [
                            { label: 'Xoá', icon: 'i-heroicons-trash', color: 'error' as const, onSelect: () => deleteDeck(deck.id) },
                          ]
                        ]"
											>
												<UButton
													icon="i-heroicons-ellipsis-horizontal"
													color="neutral"
													variant="ghost"
													size="xs"
													class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
												/>
											</UDropdownMenu>
										</div>

										<p
											class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2"
										>
											{{ deck.description }}
										</p>

										<!-- Tags -->
										<div class="flex flex-wrap gap-1 mt-2">
											<UBadge
												v-for="tag in deck.tags"
												:key="tag"
												variant="soft"
												color="primary"
												size="xs"
											>
												{{ tag }}
											</UBadge>
										</div>

										<!-- Progress bar -->
										<div class="mt-3">
											<div
												class="flex justify-between text-xs text-gray-500 mb-1"
											>
												<span
													>{{ deck.masteredCards }}/{{ deck.totalCards }}
													thẻ</span
												>
												<span
													class="font-medium"
													:class="
                            deckProgress(deck) === 100
                              ? 'text-emerald-600'
                              : 'text-gray-500'
                          "
												>
													{{ deckProgress(deck) }}%
												</span>
											</div>
											<UProgress
												:value="deckProgress(deck)"
												:color="
                          deckProgress(deck) === 100 ? 'success' : 'primary'
                        "
												size="xs"
											/>
										</div>

										<!-- Footer -->
										<div
											class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800"
										>
											<span class="text-xs text-gray-400">
												<UIcon
													name="i-heroicons-clock"
													class="w-3 h-3 inline mr-0.5"
												/>
												{{ formatDate(deck.lastStudied) }}
											</span>
											<UButton
												size="xs"
												color="primary"
												variant="soft"
												icon="i-heroicons-play"
												@click="
                          toast.add({ title: `Bắt đầu học: ${deck.title}` })
                        "
											>
												Học
											</UButton>
										</div>
									</div>
								</div>
							</UCard>
						</div>
					</div>
				</template>

				<!-- ════════════════ SETTINGS TAB ════════════════ -->
				<template #settings>
					<div class="mt-4 space-y-6">
						<!-- ── Section: Avatar ───────────────────────────────────────── -->
						<UCard>
							<template #header>
								<div class="flex items-center gap-2">
									<UIcon
										name="i-heroicons-camera"
										class="w-4 h-4 text-indigo-500"
									/>
									<h2 class="font-semibold text-gray-900 dark:text-white">
										Ảnh đại diện
									</h2>
								</div>
							</template>

							<div
								class="flex flex-col sm:flex-row items-center sm:items-start gap-6"
							>
								<div class="relative shrink-0">
									<UAvatar
										:src="avatarUrl ?? undefined"
										:alt="profileForm.displayName"
										:text="profileForm.displayName.charAt(0)"
										size="3xl"
										class="ring-4 ring-gray-100 dark:ring-gray-800"
									/>
								</div>

								<div class="flex-1 space-y-3 text-center sm:text-left">
									<p class="text-sm text-gray-500 dark:text-gray-400">
										Ảnh JPG, PNG hoặc GIF. Tối đa <strong>2MB</strong>. Ảnh sẽ
										được hiển thị ở hồ sơ và bình luận của bạn.
									</p>
									<div
										class="flex flex-wrap gap-2 justify-center sm:justify-start"
									>
										<UButton
											icon="i-heroicons-arrow-up-tray"
											color="primary"
											variant="soft"
											@click="triggerAvatarUpload"
										>
											Tải ảnh lên
										</UButton>
										<UButton
											v-if="avatarUrl"
											icon="i-heroicons-trash"
											color="error"
											variant="ghost"
											@click="removeAvatar"
										>
											Xoá
										</UButton>
									</div>
									<input
										ref="avatarInputRef"
										type="file"
										accept="image/*"
										class="hidden"
										@change="onAvatarChange"
									>
								</div>
							</div>
						</UCard>

						<!-- ── Section: Profile Info ──────────────────────────────────── -->
						<UCard>
							<template #header>
								<div class="flex items-center gap-2">
									<UIcon
										name="i-heroicons-user"
										class="w-4 h-4 text-indigo-500"
									/>
									<h2 class="font-semibold text-gray-900 dark:text-white">
										Thông tin cá nhân
									</h2>
								</div>
							</template>

							<div class="space-y-4">
								<UFormField label="Tên hiển thị" name="displayName">
									<UInput
										v-model="profileForm.displayName"
										placeholder="Tên của bạn"
										icon="i-heroicons-user"
										class="w-full"
									/>
								</UFormField>

								<UFormField label="Email" name="email">
									<UInput
										v-model="profileForm.email"
										type="email"
										placeholder="email@example.com"
										icon="i-heroicons-envelope"
										class="w-full"
									/>
								</UFormField>

								<UFormField label="Giới thiệu bản thân" name="bio">
									<UTextarea
										v-model="profileForm.bio"
										placeholder="Viết vài dòng về bạn..."
										:rows="3"
										class="w-full"
									/>
								</UFormField>
							</div>

							<template #footer>
								<div class="flex justify-end">
									<UButton
										icon="i-heroicons-check"
										color="primary"
										@click="saveProfile"
									>
										Lưu thay đổi
									</UButton>
								</div>
							</template>
						</UCard>

						<!-- ── Section: Change Password ───────────────────────────────── -->
						<UCard>
							<template #header>
								<div class="flex items-center gap-2">
									<UIcon
										name="i-heroicons-lock-closed"
										class="w-4 h-4 text-indigo-500"
									/>
									<h2 class="font-semibold text-gray-900 dark:text-white">
										Đổi mật khẩu
									</h2>
								</div>
							</template>

							<div class="space-y-4">
								<UFormField label="Mật khẩu hiện tại" name="currentPassword">
									<UInput
										v-model="passwordForm.current"
										:type="showPasswords.current ? 'text' : 'password'"
										placeholder="Nhập mật khẩu hiện tại"
										icon="i-heroicons-lock-closed"
										class="w-full"
									>
										<template #trailing>
											<UButton
												:icon="
                          showPasswords.current
                            ? 'i-heroicons-eye-slash'
                            : 'i-heroicons-eye'
                        "
												variant="ghost"
												color="neutral"
												size="xs"
												@click="showPasswords.current = !showPasswords.current"
											/>
										</template>
									</UInput>
								</UFormField>

								<UFormField label="Mật khẩu mới" name="newPassword">
									<UInput
										v-model="passwordForm.next"
										:type="showPasswords.next ? 'text' : 'password'"
										placeholder="Ít nhất 8 ký tự"
										icon="i-heroicons-key"
										class="w-full"
									>
										<template #trailing>
											<UButton
												:icon="
                          showPasswords.next
                            ? 'i-heroicons-eye-slash'
                            : 'i-heroicons-eye'
                        "
												variant="ghost"
												color="neutral"
												size="xs"
												@click="showPasswords.next = !showPasswords.next"
											/>
										</template>
									</UInput>

									<!-- Strength indicator -->
									<div
										v-if="passwordStrength"
										class="mt-2 flex items-center gap-2"
									>
										<UProgress
											:value="passwordStrength.value"
											:color="passwordStrength.color"
											size="xs"
											class="flex-1"
										/>
										<UBadge
											:color="passwordStrength.color"
											variant="soft"
											size="xs"
										>
											{{ passwordStrength.label }}
										</UBadge>
									</div>
								</UFormField>

								<UFormField
									label="Xác nhận mật khẩu mới"
									name="confirmPassword"
									:error="passwordMismatch ? 'Mật khẩu không khớp' : undefined"
								>
									<UInput
										v-model="passwordForm.confirm"
										:type="showPasswords.confirm ? 'text' : 'password'"
										placeholder="Nhập lại mật khẩu mới"
										icon="i-heroicons-shield-check"
										:color="passwordMismatch ? 'error' : undefined"
										class="w-full"
									>
										<template #trailing>
											<UButton
												:icon="
                          showPasswords.confirm
                            ? 'i-heroicons-eye-slash'
                            : 'i-heroicons-eye'
                        "
												variant="ghost"
												color="neutral"
												size="xs"
												@click="showPasswords.confirm = !showPasswords.confirm"
											/>
										</template>
									</UInput>
								</UFormField>

								<!-- Password tips -->
								<UAlert
									icon="i-heroicons-information-circle"
									color="info"
									variant="soft"
									title="Gợi ý tạo mật khẩu mạnh"
									description="Dùng ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt."
								/>
							</div>

							<template #footer>
								<div class="flex justify-end">
									<UButton
										icon="i-heroicons-lock-closed"
										color="primary"
										:disabled="
                      !passwordForm.current ||
                      !passwordForm.next ||
                      !!passwordMismatch
                    "
										@click="changePassword"
									>
										Cập nhật mật khẩu
									</UButton>
								</div>
							</template>
						</UCard>

						<!-- ── Section: Danger Zone ───────────────────────────────────── -->
						<UCard class="border border-red-200 dark:border-red-900">
							<template #header>
								<div class="flex items-center gap-2">
									<UIcon
										name="i-heroicons-exclamation-triangle"
										class="w-4 h-4 text-red-500"
									/>
									<h2 class="font-semibold text-red-600 dark:text-red-400">
										Vùng nguy hiểm
									</h2>
								</div>
							</template>

							<div
								class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
							>
								<div>
									<p class="font-medium text-gray-900 dark:text-white text-sm">
										Xoá tài khoản
									</p>
									<p class="text-sm text-gray-500 mt-0.5">
										Toàn bộ dữ liệu, bộ thẻ và tiến trình học sẽ bị xoá vĩnh
										viễn.
									</p>
								</div>
								<UButton
									color="error"
									variant="soft"
									icon="i-heroicons-trash"
									class="shrink-0"
									@click="
                    toast.add({
                      title: 'Tính năng chưa khả dụng',
                      description: 'Vui lòng liên hệ hỗ trợ.',
                      color: 'error',
                    })
                  "
								>
									Xoá tài khoản
								</UButton>
							</div>
						</UCard>
					</div>
				</template>
			</UTabs>
		</div>

		<!-- Toast notifications -->
		<UNotifications />
	</div>
</template>
