window.App = window.App || {};
App.profile = {};

App.profile.loadProfilePicture = function () {

  FirebaseService.auth.onAuthStateChanged(async (user) => {

    if (!user) return;

    const email = user.email;

    try {

      const doc = await FirebaseService.db
        .collection("users")
        .doc(email)
        .get();

      const data = doc.data();

      const profilePic =
        document.getElementById("profile-pic");

      if (profilePic && data?.profilePic) {

        profilePic.src =
          data.profilePic +
          "?t=" +
          new Date().getTime();
      }

    } catch (error) {

      console.error(
        "❌ Error loading profile pic:",
        error
      );

    }

  });

};



App.profile.init = function () {
  App.profile.loadProfilePicture();

  const uploadBtn =
    document.getElementById("upload-pic");

  const fileInput =
    document.getElementById("profile-upload");

  const caricatureBtn =
    document.getElementById("upload-caricature");

  const caricatureInput =
    document.getElementById("caricature-upload");

// ✅ open file picker
caricatureBtn?.addEventListener("click", () => {
  caricatureInput.click();
});

// ✅ upload + save
caricatureInput?.addEventListener("change", async () => {
  const file = caricatureInput.files[0];
  if (!file) return;

  const email = App.currentUserEmail;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profile_upload");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dbivddinj/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    const imageUrl = data.secure_url;

    // ✅ SAVE AS CARICATURE (IMPORTANT 🔥)
    await FirebaseService.db
      .collection("users")
      .doc(email)
      .update({
        caricature: imageUrl
      });

    console.log("✅ Caricature saved:", imageUrl);

    alert("✅ Caricature uploaded!");

  } catch (error) {
    console.error("❌ Caricature upload failed:", error);
    alert("Upload failed ❌");
  }
});

fileInput?.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const email = App.currentUserEmail;
  if (!email) return;

  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "profile_upload");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dbivddinj/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    const imageUrl = data.secure_url;

    // ✅ Save URL to Firestore
    await FirebaseService.db
      .collection("users")
      .doc(email)
      .update({
        profilePic: imageUrl
      });

    // ✅ Update UI instantly
    const profilePic = document.getElementById("profile-pic");
    if (profilePic) {
      profilePic.src = imageUrl;
    }

    console.log("✅ Uploaded to Cloudinary:", imageUrl);

  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
  }
});




// ✅ Open file selector when clicking button
uploadBtn?.addEventListener("click", () => {
  fileInput.click();
});

};

