const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
        item.classList.toggle("active");
    });
});

let lastPaw = 0;

function createPaw(x, y) {
    const paw = document.createElement("div");
    paw.classList.add("paw-print");
    paw.textContent = "🐾";

    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;

    const rotation = Math.floor(Math.random() * 360);
    paw.style.setProperty("--rotation", `${rotation}deg`);

    document.body.appendChild(paw);

    setTimeout(() => {
        paw.remove();
    }, 1200);
}

document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastPaw < 220) return;

    lastPaw = now;
    createPaw(e.clientX, e.clientY);
});

document.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    createPaw(touch.clientX, touch.clientY);
});

document.addEventListener("touchmove", (e) => {
    const now = Date.now();
    if (now - lastPaw < 120) return;

    lastPaw = now;

    const touch = e.touches[0];
    createPaw(touch.clientX, touch.clientY);
});
