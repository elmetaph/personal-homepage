// Personal Homepage V1
// The six entrance cards are intentionally static in V1.
// Navigation and separate pages can be added in later versions.

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav a").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});
