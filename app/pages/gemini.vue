<template>
  <div>hello</div>
</template>

<script setup>
function getDailyQuote() {
  // const today = new Date();
  // // Use the day of the year to select a quote
  // const start = new Date(today.getFullYear(), 0, 0);
  // const diff =
  //   today.getTime() -
  //   start.getTime() +
  //   (start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000;
  // const oneDay = 1000 * 60 * 60 * 24;
  // const dayOfYear = Math.floor(diff / oneDay);

  // const index = dayOfYear % learningQuotes.length;
  // return learningQuotes[index];

  const result = getDate(new Date(2012, 1, 29));
  console.log('🚀 ~ getDailyQuote ~ result:', result);
}

getDailyQuote();
</script>

<style scoped>
/* Không cần custom CSS nữa, đã dùng Tailwind */
</style>
