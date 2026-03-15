<script setup lang="ts">
import type {
  CharDiff,
  CharOperation,
  TokenDiff,
  WordDiff,
  WordOperation,
} from "~/features/study";

const props = defineProps<{
  tokens: TokenDiff[];
}>();

const tokens = computed(() => props.tokens);
const isCharacterMode = computed(() => tokens.value[0]?.type === "character");
const charDiffs = computed(
  () => tokens.value.filter(isCharDiffToken) as CharDiff[],
);
const wordDiffs = computed(
  () => tokens.value.filter(isWordDiffToken) as WordDiff[],
);

function isWordDiffToken(token: TokenDiff): token is WordDiff {
  return token.type === "word";
}

function isCharDiffToken(token: TokenDiff): token is CharDiff {
  return token.type === "character";
}

function getCharDiffClass(op: CharOperation) {
  if (op === "insert") return "text-success underline-offset-2 underline";
  if (op === "delete") return "text-error line-through";
  return "";
}

function getWordDiffClass(op: WordOperation) {
  if (op === "insert") return "text-success underline-offset-2 underline";
  if (op === "delete") return "text-error line-through";
  if (op === "replace") return "";
  return "";
}
</script>

<template>
  <div
    v-if="tokens.length"
    class="rounded-md border-2 border-dashed border-success bg-success/5 px-3 py-2 text-lg sm:text-xl"
  >
    <span
      v-if="isCharacterMode"
      v-for="(charDiff, i) in charDiffs"
      :key="i"
      :class="getCharDiffClass(charDiff.operation)"
    >
      {{ charDiff.value }}
    </span>

    <span v-else v-for="(wordDiff, j) in wordDiffs" :key="j">
      <span v-if="j > 0" v-text="' '" />

      <span
        class="inline-flex place-items-center"
        :class="getWordDiffClass(wordDiff.operation)"
      >
        <span
          v-if="wordDiff.operation === 'replace'"
          v-for="(charDiff, k) in wordDiff.charDiff"
          :key="k"
          :class="getCharDiffClass(charDiff.operation)"
        >
          {{ charDiff.value }}
        </span>

        <span v-else>
          {{ wordDiff.value }}
        </span>
      </span>
    </span>
  </div>
</template>
