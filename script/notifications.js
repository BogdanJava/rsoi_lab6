let notificationDiv = document.getElementById("notification");
let notificationIconDiv = document.getElementById("notificationIconDiv");
let notificationTextDiv = document.getElementById("notificationTextDiv");
let notificationFooterDiv = document.getElementById("notificationFooterDiv");

function pushNotification(name, text, notificationType, duration) {
  notificationDiv.classList = "notification";
  notificationDiv.classList.add(notificationType.class);
  notificationTextDiv.innerText = name;
  notificationFooterDiv.innerText = text;
  notificationIconDiv.innerHTML = notificationType.icon;
  let time = duration ? duration : 3000;
  toggle(time);
}

function hide() {
  notificationDiv.style.display = "none";
}

function show() {
  notificationDiv.style.display = "block";
}

function toggle(duration) {
  show();
  setTimeout(() => {
    hide();
  }, duration);
}

class IconType {}
IconType.SUCCESS = '<i class="far fa-check-square"></i>';
IconType.INFO = '<i class="fas fa-info-circle"></i>';
IconType.DANGER = '<i class="fas fa-exclamation-circle"></i>';

class NotificationType {}
NotificationType.SUCCESS = {
  icon: IconType.SUCCESS,
  class: "success"
};
NotificationType.INFO = {
  icon: IconType.INFO,
  class: "info"
};
NotificationType.DANGER = {
  icon: IconType.DANGER,
  class: "danger"
};
