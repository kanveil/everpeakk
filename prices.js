
window.onload = function () {
  const popup = document.getElementById("promoPopup");
  const popupBox = document.getElementById("popupBox");
  popup.style.display = "flex";

  popup.addEventListener("click", function (e) {
    if (!popupBox.contains(e.target)) {
      closePopup();
    }
  });
};

function closePopup() {
  const popup = document.getElementById("promoPopup");
  popup.style.opacity = "0";
  popup.style.transition = "opacity 0.3s ease";
  setTimeout(() => (popup.style.display = "none"), 300);
}
