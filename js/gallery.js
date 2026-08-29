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

const galleryFrame = document.getElementById("gallery-frame");

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

const lightboxMedia = document.getElementById("lightbox-media");

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

    function getFileExtension(path) {
    return path.split(".").pop().toLowerCase();
}

function isVideo(path) {
    return ["mp4", "mov", "webm"].includes(getFileExtension(path));
}

function createMediaElement(path, lightbox = false) {
    const encodedPath = encodeURI(path);

    console.log("Loading media:", path);
    console.log("Encoded path:", encodedPath);

    if (isVideo(path)) {
        const video = document.createElement("video");

        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        // Useful for iPhone/Safari
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");

        const source = document.createElement("source");
        source.src = encodedPath;

        // All our converted web videos should be MP4
        if (getFileExtension(path) === "mp4") {
            source.type = "video/mp4";
        } else if (getFileExtension(path) === "webm") {
            source.type = "video/webm";
        }

        video.appendChild(source);

        if (lightbox) {
            // Don't autoplay for now while debugging.
            // Autoplay with audio can be blocked by browsers.
            video.autoplay = false;
        }

        video.addEventListener("loadedmetadata", () => {
            console.log(
                "VIDEO OK:",
                path,
                "duration:",
                video.duration
            );
        });

        video.addEventListener("canplay", () => {
            console.log("VIDEO CAN PLAY:", path);
        });

        video.addEventListener("error", () => {
            console.error(
                "VIDEO ERROR:",
                path,
                video.error
            );
        });

        source.addEventListener("error", () => {
            console.error(
                "VIDEO SOURCE ERROR:",
                source.src
            );
        });

        return video;
    }

    const img = document.createElement("img");

    img.src = encodedPath;
    img.alt = "PACSTY celebration photo";

    img.addEventListener("error", () => {
        console.error("IMAGE ERROR:", path);
    });

    return img;
}


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


function updateGallery() {
    const images = getCurrentImages();

    if (!images || images.length === 0) {
        galleryFrame.innerHTML = "";

        galleryCurrent.textContent = "0";
        galleryTotal.textContent = "0";

        return;
    }

    const mediaPath = images[currentIndex];

    // Remove the previous photo/video
    galleryFrame.innerHTML = "";

    // Create either an <img> or <video>
    const media = createMediaElement(mediaPath);

    media.classList.add("gallery-media");

    galleryFrame.appendChild(media);

    galleryCurrent.textContent = currentIndex + 1;
    galleryTotal.textContent = images.length;

    preloadAdjacentMedia();

    // If the lightbox happens to be open,
    // keep it synchronized with the current media.
    if (lightbox.classList.contains("active")) {
        updateLightbox();
    }
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


function preloadAdjacentMedia() {
    const images = getCurrentImages();

    if (images.length < 2) return;

    const nextIndex =
        (currentIndex + 1) % images.length;

    const previousIndex =
        (currentIndex - 1 + images.length) % images.length;

    [
        images[nextIndex],
        images[previousIndex]
    ].forEach((src) => {

        if (isVideo(src)) {
            const video = document.createElement("video");
            video.src = encodeURI(src);
            video.preload = "metadata";
        } else {
            const img = new Image();
            img.src = encodeURI(src);
        }

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
    const images = getCurrentImages();

    if (!images || images.length === 0) {
        lightboxMedia.innerHTML = "";
        return;
    }

    const mediaPath = images[currentIndex];

    // Remove previous fullscreen photo/video
    lightboxMedia.innerHTML = "";

    // Create the correct media type
    const media = createMediaElement(mediaPath, true);

    media.classList.add("lightbox-media");

    lightboxMedia.appendChild(media);

    lightboxCategory.textContent =
        categoryLabels[currentCategory] || currentCategory;

    lightboxCounter.textContent =
        `${currentIndex + 1} of ${images.length}`;
}


galleryFrame.addEventListener("click", (event) => {
    if (event.target.tagName === "VIDEO") {
        return;
    }

    openLightbox();
});


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


addSwipeSupport(galleryFrame);
addSwipeSupport(lightboxMedia);