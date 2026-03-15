<script setup lang="ts">
import type {
  CharDiff,
  CharOperation,
  TokenDiff,
  WordDiff,
} from "~/features/study";

const props = defineProps<{
  tokens: TokenDiff[];
}>();

const tokens = computed(() => props.tokens);
const isCharacterMode = computed(() => tokens.value[0]?.type === "character");
const characterTokens = computed(
  () => tokens.value.filter(isCharDiffToken) as CharDiff[],
);
const wordTokens = computed(
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

function getWordDiffClass(token: WordDiff) {
  if (token.operation === "insert")
    return "text-success underline-offset-2 underline";
  if (token.operation === "delete" && !token.charDiff?.length)
    return "text-error line-through";
  return "";
}
</script>

<template>
  <div
    v-if="tokens.length"
    class="whitespace-pre-wrap rounded-md border-2 border-dashed border-success bg-success/5 px-3 py-2 text-lg sm:text-xl"
  >
    <span
      v-if="isCharacterMode"
      v-for="(charToken, charIndex) in characterTokens"
      :key="charIndex"
      :class="getCharDiffClass(charToken.operation)"
    >
      {{ charToken.value }}
    </span>

    <span v-else v-for="(wordToken, wordIndex) in wordTokens" :key="wordIndex">
      <span v-if="wordIndex > 0" v-text="' '" />

      <span
        class="inline-flex place-items-center"
        :class="getWordDiffClass(wordToken)"
      >
        <span v-if="wordToken.charDiff?.length">
          <span
            v-for="(charToken, charIndex) in wordToken.charDiff"
            :key="charIndex"
            :class="getCharDiffClass(charToken.operation)"
          >
            {{ charToken.value }}
          </span>
        </span>

        <span v-else>
          {{ wordToken.value }}
        </span>
      </span>
    </span>
  </div>
</template>
