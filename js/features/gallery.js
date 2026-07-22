window.App = window.App || {};
App.gallery = App.gallery || {};

let selectedGalleryFiles = [];
let currentGalleryImages = [];

let currentImageIndex = 0;
let currentPostId = null;

let currentPostImages = [];
let currentPostImageIndex = 0;

function formatCommentDate(date) {

    const today =
        new Date();

    const yesterday =
        new Date();

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    const isToday =
        date.toDateString() ===
        today.toDateString();

    const isYesterday =
        date.toDateString() ===
        yesterday.toDateString();

    const time =
        date.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    if (isToday) {

        return `Today at ${time}`;

    }

    if (isYesterday) {

        return `Yesterday at ${time}`;

    }

    return date.toLocaleDateString();
}


function showConfirmModal() {

    return new Promise(resolve => {

        const modal =
            document.getElementById(
                "confirm-modal"
            );

        const yesBtn =
            document.getElementById(
                "confirm-yes"
            );

        const noBtn =
            document.getElementById(
                "confirm-no"
            );

        modal.classList.remove(
            "hidden"
        );

        yesBtn.onclick = () => {

            modal.classList.add(
                "hidden"
            );

            resolve(true);
        };

        noBtn.onclick = () => {

            modal.classList.add(
                "hidden"
            );

            resolve(false);
        };

    });

}

function openGalleryViewer(
    images,
    startIndex
) {

    currentGalleryImages =
        images;

    currentImageIndex =
        startIndex;

    const modal =
        document.getElementById(
            "gallery-modal"
        );

    const modalImg =
        document.getElementById(
            "gallery-modal-image"
        );

    modalImg.src =
        images[startIndex];

    modal.classList.remove(
        "hidden"
    );

}

function updateGalleryViewer() {

    const modalImg =
        document.getElementById(
            "gallery-modal-image"
        );

    modalImg.src =
        currentGalleryImages[
            currentImageIndex
        ];

}

function updatePostModalImage() {

    const modalImage =
        document.getElementById(
            "post-modal-image"
        );

    modalImage.src =
        currentPostImages[
            currentPostImageIndex
        ];

    const counter =
        document.getElementById(
            "post-image-counter"
        );

    if (counter) {

        counter.textContent =
            `${currentPostImageIndex + 1} / ${currentPostImages.length}`;

    }

renderPostThumbnails();

}

function renderPostThumbnails() {

    const container =
        document.getElementById(
            "post-image-thumbnails"
        );

    if (!container)
        return;

if (currentPostImages.length <= 1) {

    container.style.display = "none";

    return;

}

container.style.display = "flex";

    container.innerHTML = "";

    currentPostImages.forEach(
        (url, index) => {

            const img =
                document.createElement(
                    "img"
                );

            img.src = url;

            img.className =
                "post-thumb";

            if (
                index === currentPostImageIndex
            ) {

                img.classList.add(
                    "active"
                );

            }

            img.addEventListener(
                "click",
                () => {

                    currentPostImageIndex =
                        index;

                    updatePostModalImage();

                }
            );

            container.appendChild(
                img
            );

        }
    );

}

/* ✅ disable image dragging */

document.addEventListener(
    "dragstart",
    e => {

        if (
            e.target.classList.contains(
                "post-thumb"
            )
        ) {

            e.preventDefault();

        }

    }
);

App.gallery.init = function () {


   App.gallery.loadGallery();

const modal =
    document.getElementById("gallery-modal");

const closeBtn =
    document.getElementById("gallery-close");

const prevBtn =
    document.getElementById(
        "gallery-prev"
    );

const nextBtn =
    document.getElementById(
        "gallery-next"
    );

prevBtn?.addEventListener(
    "click",
    () => {

        if (
            currentGalleryImages.length === 0
        )
            return;

        currentImageIndex--;

        if (
            currentImageIndex < 0
        ) {

            currentImageIndex =
                currentGalleryImages.length - 1;

        }

        updateGalleryViewer();

    }
);


nextBtn?.addEventListener(
    "click",
    () => {

        if (
            currentGalleryImages.length === 0
        )
            return;

        currentImageIndex++;

        if (
            currentImageIndex >=
            currentGalleryImages.length
        ) {

            currentImageIndex = 0;

        }

        updateGalleryViewer();

    }
);


closeBtn?.addEventListener("click", () => {

    modal.classList.add("hidden");

});

const postModal =
    document.getElementById(
        "gallery-post-modal"
    );

postModal?.addEventListener(
    "click",
    e => {

        if (
            e.target === postModal
        ) {

            postModal.classList.add(
                "hidden"
            );

        }

    }
);

const postModalClose =
    document.getElementById(
        "gallery-post-close"
    );

postModalClose?.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "gallery-post-modal"
            )
            .classList.add(
                "hidden"
            );

    }
);

const postPrevBtn =
    document.getElementById(
        "post-prev-image"
    );

const postNextBtn =
    document.getElementById(
        "post-next-image"
    );

const thumbnailStrip =
    document.getElementById(
        "post-image-thumbnails"
    );

let isDragging = false;
let startX;
let scrollLeft;

thumbnailStrip?.addEventListener(
    "mousedown",
    e => {

        isDragging = true;

        startX =
            e.pageX -
            thumbnailStrip.offsetLeft;

        scrollLeft =
            thumbnailStrip.scrollLeft;

        thumbnailStrip.style.cursor =
            "grabbing";

    }
);

document.addEventListener(
    "mouseup",
    () => {

        isDragging = false;

        if (thumbnailStrip) {

            thumbnailStrip.style.cursor =
                "grab";

        }

    }
);

thumbnailStrip?.addEventListener(
    "mousemove",
    e => {

        if (!isDragging)
            return;

        e.preventDefault();

        const x =
            e.pageX -
            thumbnailStrip.offsetLeft;

        const walk =
            (x - startX) * 2;

        thumbnailStrip.scrollLeft =
            scrollLeft - walk;

    }
);

postPrevBtn?.addEventListener(
    "click",
    () => {

        if (
            currentPostImages.length === 0
        )
            return;

        currentPostImageIndex--;

        if (
            currentPostImageIndex < 0
        ) {

            currentPostImageIndex =
                currentPostImages.length - 1;

        }

        updatePostModalImage();

    }
);

postNextBtn?.addEventListener(
    "click",
    () => {

        if (
            currentPostImages.length === 0
        )
            return;

        currentPostImageIndex++;

        if (
            currentPostImageIndex >=
            currentPostImages.length
        ) {

            currentPostImageIndex = 0;

        }

        updatePostModalImage();

    }
);

const modalPostBtn =
    document.getElementById(
        "post-modal-send"
    );

const modalCommentInput =
    document.getElementById(
        "post-modal-input"
    );

modalCommentInput?.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            e.preventDefault();

            document
                .getElementById(
                    "post-modal-send"
                )
                ?.click();

        }

    }
);

modalPostBtn?.addEventListener(
    "click",
    async () => {

        const input =
            document.getElementById(
                "post-modal-input"
            );

        const text =
            input.value.trim();

        if (
            !text ||
            !currentPostId
        )
            return;

        await FirebaseService.db
            .collection(
                "happySnaps"
            )
            .doc(currentPostId)
            .update({

                comments:
                    firebase.firestore.FieldValue.arrayUnion({

                        name:
                            App.currentUser.name,

                        text,

                        createdAt:
                            new Date()

                    })

            });



        input.value = "";

const commentsBox =
    document.getElementById(
        "post-modal-comments"
    );

const newRow =
    document.createElement("div");

newRow.innerHTML = `
    <strong>
        ${App.currentUser.name}
    </strong>
    : ${text}
`;

commentsBox.appendChild(
    newRow
);

console.log(
    "Posting comment",
    currentPostId
);

    }
);


    const galleryUpload =
        document.getElementById("gallery-upload");

    const galleryGrid =
        document.getElementById("gallery-grid");

    if (!galleryUpload || !galleryGrid) return;

    galleryUpload.addEventListener("change", (e) => {

selectedGalleryFiles =
    [...e.target.files];

    if (selectedGalleryFiles.length === 0)
    return;

    const modal =
        document.getElementById(
            "gallery-upload-modal"
        );

    const preview =
        document.getElementById(
            "gallery-preview-image"
        );

preview.src =
    URL.createObjectURL(
        selectedGalleryFiles[0]
    );

console.log(
    selectedGalleryFiles.length,
    "photos selected"
);


const uploadModal =
    document.getElementById(
        "gallery-upload-modal"
    );

uploadModal.classList.remove(
    "hidden"
);


});

const cancelBtn =
    document.getElementById(
        "gallery-cancel-btn"
    );

cancelBtn?.addEventListener(
    "click",
    () => {

        selectedGalleryFiles = [];

        document
            .getElementById(
                "gallery-upload-modal"
            )
            .classList.add(
                "hidden"
            );

    }
);

const postBtn =
    document.getElementById(
        "gallery-post-btn"
    );

postBtn?.addEventListener(
    "click",
    async () => {

        if (selectedGalleryFiles.length === 0)
    return;

        const caption =
            document
                .getElementById(
                    "gallery-popup-caption"
                )
                .value
                .trim();


const uploadResults =
    await Promise.all(

        selectedGalleryFiles.map(
            file =>
                uploadHappySnap(file)
        )

    );

await FirebaseService.db
    .collection("happySnaps")
    .add({

imageUrls:
    uploadResults.map(
        item => item.url
    ),

publicIds:
    uploadResults.map(
        item => item.publicId
    ),

        uploadedBy:
            App.currentUserEmail,

        uploadedName:
            App.currentUser.name,

        likes: 0,

        likedBy: [],

        comments: [],

        caption: caption,

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });


console.log(
    "Saved to Firestore"
);

selectedGalleryFiles = [];

document
    .getElementById(
        "gallery-popup-caption"
    )
    .value = "";

document
    .getElementById(
        "gallery-upload-modal"
    )
    .classList.add(
        "hidden"
    );


    }
);

};

async function uploadHappySnap(file) {

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    "profile_upload"
  );

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dbivddinj/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  return {
      url: data.secure_url,
      publicId: data.public_id
  };
}

App.gallery.loadGallery = async function () {

    const galleryGrid =
        document.getElementById("gallery-grid");

    if (!galleryGrid) return;

    galleryGrid.innerHTML = "";

FirebaseService.db
    .collection("happySnaps")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

        galleryGrid.innerHTML = "";

        snapshot.forEach(doc => {

    const data = doc.data();

    const docId = doc.id;

const card =
    document.createElement("div");

card.className = "gallery-card";

const uploadDate =
    data.createdAt?.toDate
        ? data.createdAt.toDate()
        : null;

const images =
    data.imageUrls ||
    [data.imageUrl];

const imageContainer =
    document.createElement("div");

imageContainer.className =
    "gallery-image-grid";

if (images.length === 1) {

    imageContainer.classList.add(
        "gallery-image-single"
    );

}


images
    .slice(0, 4)
    .forEach((url, index) => {

        const img =
            document.createElement("img");

        img.src = url;

        img.className =
            "gallery-image";

       img.addEventListener(
    "click",
    () => {

        openGalleryViewer(
            images,
            index
        );

    }
);

        imageContainer.appendChild(
            img
        );

if (
    index === 3 &&
    images.length > 4
) {

    const overlay =
        document.createElement("div");

    overlay.className =
        "gallery-more-overlay";

    overlay.textContent =
        `+${
            images.length - 4
        }`;

    imageContainer.appendChild(
        overlay
    );
}

    });

card.appendChild(
    imageContainer
);





const info =
    document.createElement("div");

info.className = "gallery-info";

info.innerHTML = `
    <strong>
        ${data.uploadedName || data.uploadedBy}
    </strong>

    <p>
        ${
            uploadDate
                ? uploadDate.toLocaleDateString()
                : ""
        }
    </p>
`;

card.appendChild(info);

if (data.caption) {

    const caption =
        document.createElement("p");

    caption.className =
        "gallery-caption";

    caption.textContent =
        data.caption;

    card.appendChild(
        caption
    );

}

const stats =
    document.createElement("div");

stats.className =
    "gallery-stats";

const hasLiked =
    (data.likedBy || [])
        .includes(App.currentUserEmail);

stats.innerHTML = `
    <span class="gallery-heart-count ${
        hasLiked ? "liked" : ""
    }">
        ${
            hasLiked
                ? "💖"
                : "❤️"
        }
        ${data.likes || 0}
    </span>

    •

    <span class="gallery-comment-count">
        💬 ${(data.comments || []).length}
    </span>
`;

card.appendChild(stats);

stats
    .querySelector(".gallery-comment-count")
    ?.addEventListener("click", () => {

        commentsPreview.click();

    });

const commentsPreview =
    document.createElement("div");

commentsPreview.className =
    "gallery-comments-preview";

commentsPreview.textContent =
    `View all ${
        (data.comments || []).length
    } comments`;

commentsPreview.addEventListener(
    "click",
    () => {

        const modal =
            document.getElementById(
                "gallery-post-modal"
            );

        const commentsBox =
            document.getElementById(
                "post-modal-comments"
            );

        currentPostImages =
    images;

currentPostImageIndex = 0;

updatePostModalImage();

       currentPostId = docId;

        commentsBox.innerHTML = "";

        (data.comments || [])
    .forEach(comment => {

        const row =
            document.createElement(
                "div"
            );

        const text =
    document.createElement(
        "span"
    );


const commentDate =
    comment.createdAt?.seconds
        ? new Date(
            comment.createdAt.seconds * 1000
        )
        : null;

text.innerHTML = `
    <strong>
        ${comment.name}
    </strong>
    : ${comment.text}

    <br>

<small>
    ${
        commentDate
            ? formatCommentDate(
                commentDate
            )
            : ""
    }
</small>
`;

        row.appendChild(
            text
        );

        if (
            comment.name ===
            App.currentUser.name
        ) {

            const deleteBtn =
                document.createElement(
                    "button"
                );

            deleteBtn.textContent =
                "🗑️";

            deleteBtn.addEventListener(
                "click",
                async () => {

                    await FirebaseService.db
                        .collection(
                            "happySnaps"
                        )
                        .doc(docId)
                        .update({

                            comments:
                                firebase.firestore.FieldValue.arrayRemove(
                                    comment
                                )

                        });

                    row.remove();

                }
            );

            row.appendChild(
                deleteBtn
            );

        }

        commentsBox.appendChild(
            row
        );

    });

        const commentInput =
    document.getElementById(
        "post-modal-input"
    );

commentInput.value = "";

modal.classList.remove(
    "hidden"
);

commentInput.focus();



    }
);

const likeBtn =
    document.createElement("button");

likeBtn.className =
    "gallery-like-btn";

likeBtn.textContent =
    hasLiked
        ? `💖 Liked ${data.likes || 0}`
        : `❤️ ${data.likes || 0}`;

if (hasLiked) {

    likeBtn.classList.add(
        "gallery-liked-btn"
    );

}

likeBtn.addEventListener(
    "click",
    async () => {

        const likedBy =
            data.likedBy || [];

        
if (
    likedBy.includes(
        App.currentUserEmail
    )
) {

    await FirebaseService.db
        .collection("happySnaps")
        .doc(docId)
        .update({

            likes:
                firebase.firestore.FieldValue.increment(-1),

            likedBy:
                firebase.firestore.FieldValue.arrayRemove(
                    App.currentUserEmail
                )

        });

} else {

    await FirebaseService.db
        .collection("happySnaps")
        .doc(docId)
        .update({

            likes:
                firebase.firestore.FieldValue.increment(1),

            likedBy:
                firebase.firestore.FieldValue.arrayUnion(
                    App.currentUserEmail
                )

        });

}

       
    }
);

card.appendChild(likeBtn);
/********************* comment out for now
const commentInput =
    document.createElement("input");

commentInput.type = "text";

commentInput.placeholder =
    "Write a comment...";

commentInput.className =
    "gallery-comment-input";

card.appendChild(commentInput);

const commentBtn =
    document.createElement("button");

commentBtn.textContent =
    "💬 Comment";

commentBtn.className =
    "gallery-comment-btn";

card.appendChild(commentBtn);

******************************** comment out end (( ******/

const commentsContainer =
    document.createElement("div");

commentsContainer.className =
    "gallery-comments";

(data.comments || [])
    .slice(0, 2)
    .forEach(comment => {

        const row =
            document.createElement("div");

        row.className =
            "gallery-comment";

        const commentText =
            document.createElement("span");

        commentText.innerHTML = `
            <strong>
                ${comment.name}
            </strong>
            : ${comment.text}
        `;

        row.appendChild(
            commentText
        );

        const canDelete =
            comment.name ===
            App.currentUser.name;

        if (canDelete) {

            const deleteCommentBtn =
                document.createElement(
                    "button"
                );

            deleteCommentBtn.title =
    "Delete Comment";

deleteCommentBtn.textContent =
    "🗑️";

            deleteCommentBtn.className =
                "gallery-comment-delete";

            deleteCommentBtn.addEventListener(
                "click",
                async () => {

                    const confirmDelete =
    await showConfirmModal();

if (!confirmDelete)
    return;

                    await FirebaseService.db
                        .collection(
                            "happySnaps"
                        )
                        .doc(docId)
                        .update({

                            comments:
                                firebase.firestore.FieldValue.arrayRemove(
                                    comment
                                )

                        });

                }
            );

            row.appendChild(
                deleteCommentBtn
            );

        }

        commentsContainer.appendChild(
            row
        );

    });


card.appendChild(
    commentsContainer
);

card.appendChild(
    commentsPreview
);


/********************** Comment out for now ********
commentBtn.addEventListener(
    "click",
    async () => {

        const text =
            commentInput.value.trim();

        if (!text) return;

        await FirebaseService.db
            .collection("happySnaps")
            .doc(docId)
            .update({

                comments:
                    firebase.firestore.FieldValue.arrayUnion({

                        name:
                            App.currentUser.name,

                        text: text,

                        createdAt:
                            new Date()

                    })

            });
    }
);

***************** End of Comment out *****************/

if (
    data.uploadedBy ===
    App.currentUserEmail
) {

    const deleteBtn =
        document.createElement("button");

    deleteBtn.className =
        "gallery-delete-btn";

    deleteBtn.textContent =
        "🗑️ Delete";

    deleteBtn.addEventListener(
        "click",
        async () => {

console.log(
    "Deleting Cloudinary asset:",
    data.publicId
);

            const confirmDelete =
    await showConfirmModal();

if (!confirmDelete)
    return;

            await FirebaseService.db
                .collection("happySnaps")
                .doc(docId)
                .delete();

            

        }
    );

    card.appendChild(deleteBtn);

}

galleryGrid.appendChild(card);

        });

    });

};

