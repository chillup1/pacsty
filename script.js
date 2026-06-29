const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
        item.classList.toggle("active");
    });
});

let lastPaw = 0;

document.addEventListener("mousemove", (e) => {
    const now = Date.now();

    // Don't create too many paw prints
    if (now - lastPaw < 200) return;

    lastPaw = now;

    const paw = document.createElement("div");
    paw.classList.add("paw-print");
    paw.textContent = "🐾";

    paw.style.left = `${e.clientX}px`;
    paw.style.top = `${e.clientY}px`;

    const rotation = Math.floor(Math.random() * 360);
    paw.style.setProperty("--rotation", `${rotation}deg`);

    document.body.appendChild(paw);

    setTimeout(() => {
        paw.remove();
    }, 1200);
});