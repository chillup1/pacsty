let galleries = {};
let currentCategory = "welcome";
let currentIndex = 0;

const categoryLabels = {
    welcome: "Welcome · 16h–18h",
    activities: "Activities · 19h30–21h",
    "dj-sets": "DJ Sets · 21h–08h",
    afters: "Afters · 08h →",
    people: "People"
};

const galleryImage = document.getElementById("gallery-image");

const galleryCurrent =
    document.getElementById("gallery-current");

const galleryTotal =
    document.getElementById("gallery-total");

const previousButton =
    document.querySelector(".gallery-prev");

const nextButton =
    document.querySelector(".gallery-next");


// LIGHTBOX

const lightbox =
    document.getElementById("photo-lightbox");

const lightboxImage =
    document.getElementById("lightbox-image");

const lightboxClose =
    document.getElementById("lightbox-close");

const lightboxPrevious =
    document.getElementById("lightbox-prev");

const lightboxNext =
    document.getElementById("lightbox-next");

const lightboxCategory =
    document.getElementById("lightbox-category");

const lightboxCounter =
    document.getElementById("lightbox-counter");


// --------------------
// LOAD PHOTOS
// --------------------

fetch("images/photos.json")
    .then((response) => response.json())

    .then((files) => {

        galleries = {

            welcome: files.filter(
                (path) => path.includes("/welcome/")
            ),

            activities: files.filter(
                (path) => path.includes("/activities/")
            ),

            people: files.filter(
                (path) => path.includes("/people/")
            ),

            "dj-sets": files.filter(
                (path) => path.includes("/dj-sets/")
            ),

            afters: files.filter(
                (path) => path.includes("/afters/")
            )

        };

        updateGallery(false);
    })

    .catch((error) => {
        console.error(
            "Could not load photo gallery:",
            error
        );
    });


// --------------------
// GALLERY
// --------------------

function getCurrentImages() {
    return galleries[currentCategory] || [];
}


function updateGallery(animate = true) {

    const images = getCurrentImages();

    if (images.length === 0) {

        galleryImage.style.display = "none";

        galleryCurrent.textContent = "0";
        galleryTotal.textContent = "0";

        return;
    }

    const imagePath = images[currentIndex];


    if (!animate) {

        galleryImage.src = encodeURI(imagePath);

    } else {

        galleryImage.classList.add(
            "gallery-fading"
        );

        setTimeout(() => {

            galleryImage.src =
                encodeURI(imagePath);

        }, 160);

    }


    galleryImage.onload = () => {

        galleryImage.style.display = "block";

        galleryImage.classList.remove(
            "gallery-fading"
        );

        preloadAdjacentImages();

    };


    galleryImage.onerror = () => {

        console.error(
            "Could not load image:",
            imagePath
        );

    };


    galleryCurrent.textContent =
        currentIndex + 1;

    galleryTotal.textContent =
        images.length;


    updateLightbox();
}


// --------------------
// NEXT / PREVIOUS
// --------------------

function nextPhoto() {

    const images = getCurrentImages();

    if (images.length === 0) return;

    currentIndex =
        (currentIndex + 1) %
        images.length;

    updateGallery();

}


function previousPhoto() {

    const images = getCurrentImages();

    if (images.length === 0) return;

    currentIndex =
        (currentIndex - 1 + images.length) %
        images.length;

    updateGallery();

}


nextButton.addEventListener(
    "click",
    nextPhoto
);


previousButton.addEventListener(
    "click",
    previousPhoto
);


// --------------------
// CATEGORY FILTERS
// --------------------

document
    .querySelectorAll(".photo-filter")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".photo-filter"
                    )
                    .forEach((btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                currentCategory =
                    button.dataset.category;

                currentIndex = 0;

                updateGallery();

            }
        );

    });


// --------------------
// PRELOAD PHOTOS
// --------------------

function preloadAdjacentImages() {

    const images = getCurrentImages();

    if (images.length < 2) return;


    const nextIndex =
        (currentIndex + 1) %
        images.length;

    const previousIndex =
        (currentIndex - 1 + images.length) %
        images.length;


    [
        images[nextIndex],
        images[previousIndex]

    ].forEach((src) => {

        const preload =
            new Image();

        preload.src =
            encodeURI(src);

    });

}


// --------------------
// LIGHTBOX
// --------------------

function openLightbox() {
    lightbox.classList.add("active");

    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";

    updateLightbox();
}


function closeLightbox() {

    lightbox.classList.remove(
        "active"
    );

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


function updateLightbox() {

    if (
        !lightbox ||
        !lightbox.classList.contains("active")
    ) {
        return;
    }


    const images =
        getCurrentImages();

    if (images.length === 0) return;


    lightboxImage.src =
        encodeURI(
            images[currentIndex]
        );


    lightboxCategory.textContent =
        categoryLabels[currentCategory]
        || currentCategory;


    lightboxCounter.textContent =
        `${currentIndex + 1} of ${images.length}`;

}


galleryImage.addEventListener(
    "click",
    openLightbox
);


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightboxNext.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        nextPhoto();

    }
);


lightboxPrevious.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        previousPhoto();

    }
);


// Click dark background to close

lightbox.addEventListener(
    "click",
    (event) => {

        if (event.target === lightbox) {
            closeLightbox();
        }

    }
);


// --------------------
// KEYBOARD
// --------------------

document.addEventListener(
    "keydown",
    (event) => {

        if (
            lightbox.classList.contains(
                "active"
            )
        ) {

            if (event.key === "Escape") {
                closeLightbox();
            }

            if (event.key === "ArrowRight") {
                nextPhoto();
            }

            if (event.key === "ArrowLeft") {
                previousPhoto();
            }

            return;
        }


        // Keyboard navigation also works
        // in the regular gallery.

        if (event.key === "ArrowRight") {
            nextPhoto();
        }

        if (event.key === "ArrowLeft") {
            previousPhoto();
        }

    }
);


// --------------------
// MOBILE SWIPE
// --------------------

let touchStartX = 0;
let touchEndX = 0;


function handleSwipe() {

    const distance =
        touchEndX - touchStartX;


    // Ignore tiny finger movements.

    if (Math.abs(distance) < 50) {
        return;
    }


    if (distance < 0) {
        nextPhoto();
    }

    if (distance > 0) {
        previousPhoto();
    }

}


function addSwipeSupport(element) {

    element.addEventListener(
        "touchstart",
        (event) => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        { passive: true }
    );


    element.addEventListener(
        "touchend",
        (event) => {

            touchEndX =
                event.changedTouches[0].screenX;

            handleSwipe();

        },
        { passive: true }
    );

}


addSwipeSupport(
    document.querySelector(".gallery-frame")
);

addSwipeSupport(
    lightboxImage
);