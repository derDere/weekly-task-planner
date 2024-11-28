var store = null;

function dayName(dayIndex) { /////////////////////////////////////////////////////////////////////
  // 0:Mo, 1:Di, 2:Mi, 3:Do, 4:Fr, 5:Sa, 6:So
  let t = new Date('1992-03-08');
  let day = t.getDay();
  t.setDate(t.getDate() - day + dayIndex + 1);
  return t.toLocaleDateString(undefined, {weekday: 'short'});
}

function ReadData() { /////////////////////////////////////////////////////////////////////
  let jj = document.location.hash;
  if (!jj) {
    return {};
  }
  jj = jj.substr(1);
  jj = decodeURIComponent(jj);
  let jo = JSON.parse(jj);
  return jo;
}

function WriteData(data) { /////////////////////////////////////////////////////////////////////
  let jj = JSON.stringify(data);
  document.location.hash = jj;
}

function UpdateDisplay(newStore) { /////////////////////////////////////////////////////////////////////
  store = newStore;
  if (!!store.d) {
    document.body.className = "dark";
  } else {
    document.body.className = "";
  }

  if (Object.keys(store).length <= 0) {
    ShowForm();
  } else if (!!(store.e)) {
    ShowForm(store);
  } else {
    DisplayTable();
  }
}

function CheckUpdate(newStore) { /////////////////////////////////////////////////////////////////////
  let jj1 = JSON.stringify(store);
  let jj2 = JSON.stringify(newStore);
  return jj1 != jj2;
}

function Tick() { /////////////////////////////////////////////////////////////////////
  let newData = ReadData();
  if (CheckUpdate(newData)) {
    UpdateDisplay(newData);
  }
  if (store.s && !SessionUpdateInterval) {
    SessionUpdateInterval = setInterval(SessionUpdate, 2000);
  }
}

function ExampleData() { /////////////////////////////////////////////////////////////////////
  return {
    do: 6, // Day off
    t: [
      ["Category 1", -1],
      ["Task 1", 1],
      ["Task 2", 2],
      ["Task 3", 3],
      ["Category 2", -1],
      ["Task 4", 4],
      ["Task 5", 5],
      ["Task 6", 6],
      ["Category 3", -1],
      ["Task 7", 0]
    ]
  };
}

function ToggleDarkMode() { /////////////////////////////////////////////////////////////////////
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.d = !store.d;
  WriteData(newStore);
}

function EditMode() { /////////////////////////////////////////////////////////////////////
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.e = true;
  WriteData(newStore);
}

function AddTask() { /////////////////////////////////////////////////////////////////////
  if (!store.t) {
    store.t = [];
  }
  if (store.t.length > 50) {
    alert("Too many tasks! Your life is not just work, slow down and relay a bit!");
    return;
  }
  let task = document.getElementById("newTask").value;
  if (!task) {
    alert("Task name is empty!");
    return;
  }
  let times = parseInt(document.getElementById("newTimes").value);
  if (isNaN(times)) {
    alert("Times is not a number!");
    return;
  }
  if (times < -1 || times > 6) {
    alert("Times is out of range!");
    return;
  }
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.t.push([task, times]);
  WriteData(newStore);
}

function EditTask(e) { /////////////////////////////////////////////////////////////////////
  let index = e.target.dataset.index;
  let task = store.t[index][0];
  let times = store.t[index][1];
  let newTask = prompt("Edit task:", task);
  if (newTask == null) {
    return;
  }
  let newTimes = null;
  let allowedTimes = ['-1', '0', '1', '2', '3', '4', '5', '6'];
  do {
    newTimes = prompt("Edit times:", times);
    if (newTimes == null) {
      return;
    }
    newTimes = newTimes.trim();
    if (newTimes.toLowerCase() == "an") {
      newTimes = 0;
    }
    if (newTimes.toLowerCase() == "as needed") {
      newTimes = 0;
    }
    if (newTimes.toLowerCase() == "c") {
      newTimes = -1;
    }
    if (newTimes.toLowerCase() == "category") {
      newTimes = -1;
    }
    if (!allowedTimes.includes(newTimes)) {
      alert("Entered value is not an option!\nAllowed values:\n-1 or Category or c\n0 or As needed or an\n1\n2\n3\n4\n5\n6");
    }
  } while (!allowedTimes.includes(newTimes));
  newTimes = parseInt(newTimes);
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.t[index] = [newTask, newTimes];
  WriteData(newStore);
}

function MoveUpTask(e) { /////////////////////////////////////////////////////////////////////
  let index = parseInt(e.target.dataset.index);
  let newStore = JSON.parse(JSON.stringify(store));
  if (index > 0) {
    let tmp = newStore.t[index];
    newStore.t[index] = newStore.t[index - 1];
    newStore.t[index - 1] = tmp;
  }
  WriteData(newStore);
}

function MoveDnTask(e) { /////////////////////////////////////////////////////////////////////
  let index = parseInt(e.target.dataset.index);
  let newStore = JSON.parse(JSON.stringify(store));
  if (index < newStore.t.length - 1) {
    let tmp = newStore.t[index];
    newStore.t[index] = newStore.t[index + 1];
    newStore.t[index + 1] = tmp;
  }
  WriteData(newStore);
}

function DelTask(e) { /////////////////////////////////////////////////////////////////////
  let index = e.target.dataset.index;
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.t.splice(index, 1);
  WriteData(newStore);
}

function changeDayOff(e) { /////////////////////////////////////////////////////////////////////
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.do = e.target.value;
  WriteData(newStore);
}

function AddLightSwitch() { /////////////////////////////////////////////////////////////////////
  let lightSwitch = document.createElement("button");
  lightSwitch.className = "light-switch";
  lightSwitch.onclick = ToggleDarkMode;
  lightSwitch.appendChild(document.createElement("div"));
  document.body.appendChild(lightSwitch);
}

function ShowForm(data) { /////////////////////////////////////////////////////////////////////
  AddLightSwitch();
  let editBtn = document.querySelector(".edit");
  if (editBtn) {
    editBtn.remove();
  }
  let joinSessionBtn = document.querySelector(".join-session");
  if (joinSessionBtn) {
    joinSessionBtn.remove();
  }
  let newSessionBtn = document.querySelector(".new-session");
  if (newSessionBtn) {
    newSessionBtn.remove();
  }
  document.getElementById("top-bar").style.display = "none";

  let container = document.getElementById("container");
  let table = document.createElement("table");
  table.cellPadding = 0;
  table.cellSpacing = 0;
  table.border = 0;
  let tr = document.createElement("tr");
  table.appendChild(tr);
  let formTd = document.createElement("td");
  tr.appendChild(formTd);
  let linkTd = document.createElement("td");
  tr.appendChild(linkTd);
  tr = document.createElement("tr");
  table.appendChild(tr);
  let frameTd = document.createElement("td");
  frameTd.colSpan = 2;
  tr.appendChild(frameTd);
  let form = document.createElement("div");
  form.className = "form";
  formTd.appendChild(form);
  let frame = document.createElement("iframe");
  frame.className = "preview";
  frameTd.appendChild(frame);
  let link = document.createElement("a");
  link.target = "_blank";
  link.id = "link";
  link.className = "link";
  link.href = document.location.href;
  link.innerText = link.href;
  linkTd.appendChild(link);
  ////////////////////////////////////////////////////
  if (!data) {
    data = ExampleData();
    data.e = true;
  }
  ////////////////////////////////////////////////////
  let dayOffLabel = document.createElement("label");
  dayOffLabel.innerText = "Day off: ";
  dayOffLabel.htmlFor = "do";
  form.appendChild(dayOffLabel);
  let dayOffSelect = document.createElement("select");
  dayOffSelect.id = "do";
  dayOffSelect.name = "do";
  dayOffSelect.onchange = changeDayOff;
  form.appendChild(dayOffSelect);
  for (let i = 0; i < 7; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.innerText = dayName(i);
    dayOffSelect.appendChild(option);
  }
  dayOffSelect.value = data.do;
  form.appendChild(document.createElement("br"));

  let taskList = document.createElement("ul");
  taskList.className = "edit-list";
  form.appendChild(taskList);

  for (let i = 0; i < data.t.length; i++) {
    let [task, times] = data.t[i];

    let taskLi = document.createElement("li");
    taskList.appendChild(taskLi);

    let timesSpan = document.createElement("span");
    timesSpan.className = "times";
    if (times == -1) {
      timesSpan.innerText = "";
    }
    else if (times == 0) {
      timesSpan.innerText = "AN";
    }
    else {
      timesSpan.innerText = times + "x";
    }
    taskLi.appendChild(timesSpan);

    let taskSpan = document.createElement("span");
    taskSpan.className = "task";
    if (times == -1) {
      taskSpan.className = "task category";
    }
    taskSpan.innerText = task;
    taskLi.appendChild(taskSpan);

    let editBtn = document.createElement("button");
    editBtn.className = "editt";
    editBtn.dataset.index = i;
    editBtn.innerText = "✎";
    editBtn.title = "Edit: " + task;
    taskLi.appendChild(editBtn);
    editBtn.onclick = EditTask;

    let mvUpBtn = document.createElement("button");
    mvUpBtn.className = "mvup";
    mvUpBtn.dataset.index = i;
    mvUpBtn.innerHTML = "&uarr;";
    mvUpBtn.title = "Move up: " + task;
    taskLi.appendChild(mvUpBtn);
    mvUpBtn.onclick = MoveUpTask;

    let mvDnBtn = document.createElement("button");
    mvDnBtn.className = "mvdn";
    mvDnBtn.dataset.index = i;
    mvDnBtn.innerHTML = "&darr;";
    mvDnBtn.title = "Move down: " + task;
    taskLi.appendChild(mvDnBtn);
    mvDnBtn.onclick = MoveDnTask;

    let delBtn = document.createElement("button");
    delBtn.className = "del";
    delBtn.dataset.index = i;
    delBtn.innerText = "🗙";
    delBtn.title = "Delete: " + task;
    taskLi.appendChild(delBtn);
    delBtn.onclick = DelTask;
  }

  let newTask = document.createElement("input");
  newTask.type = "text";
  newTask.id = "newTask";
  newTask.placeholder = "New task";
  form.appendChild(newTask);

  let newTimes = document.createElement("select");
  newTimes.id = "newTimes";
  for (let i = -1; i <= 6; i++) {
    let option = document.createElement("option");
    option.value = i;
    if (i == -1) {
      option.innerText = "Kategory";
    }
    else if (i == 0) {
      option.innerText = "As needed";
    }
    else {
      option.innerText = i + 'x';
    }
    if (i == 6) {
      option.selected = true;
    }
    newTimes.appendChild(option);
  }
  form.appendChild(newTimes);

  let addBtn = document.createElement("button");
  addBtn.className = "add";
  addBtn.innerText = "+";
  form.appendChild(addBtn);
  addBtn.onclick = AddTask;
  ////////////////////////////////////////////////////
  container.innerHTML = "";
  let h2 = document.createElement("h2");
  h2.innerText = "Weekly Task Planner";
  container.appendChild(h2);
  container.appendChild(table);
  let dataNoEdit = JSON.parse(JSON.stringify(data));
  delete dataNoEdit.e;
  let jjq = JSON.stringify(dataNoEdit);
  jjq = encodeURIComponent(jjq);
  let url = document.location.href;
  url = url.replace(/#.*$/, "");
  url += "#" + jjq;
  link.href = url;
  link.innerText = url;

  dataNoEdit.p = true;
  jjq = JSON.stringify(dataNoEdit);
  jjq = encodeURIComponent(jjq);
  url = document.location.href;
  url = url.replace(/#.*$/, "");
  url += "#" + jjq;
  frame.src = url;

  store = data;
  WriteData(data);
}

function GetPostData(data) { /////////////////////////////////////////////////////////////////////
  let method = data ? "POST" : "GET";
  let address = "/" + (store.s ?? "new");
  let post_body = data ? JSON.stringify(data) : null;
  // ajax request
  let xhr = new XMLHttpRequest();
  xhr.open(method, address, true);
  if (method == "POST") {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(post_body);
  }
  else {
    xhr.send();
  }
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          let response = xhr.responseText;
          response = JSON.parse(response);
          if (response.status == 'error') {
            reject(response.message);
          }
          else {
            resolve(response);
          }
        }
        else {
          reject(xhr.status);
        }
      }
    };
  });
}

var SessionUpdateInterval = null;

async function NewSession() { /////////////////////////////////////////////////////////////////////
  let newStore = await GetPostData(store);
  WriteData(newStore);
  if (SessionUpdateInterval) {
    clearInterval(SessionUpdateInterval);
  }
  SessionUpdateInterval = setInterval(SessionUpdate, 2000);
}

async function JoinSession() { /////////////////////////////////////////////////////////////////////
  let sessionId = prompt("Enter session ID:");
  if (!sessionId) {
    return;
  }
  store.s = sessionId;
  let newStore = await GetPostData();
  console.log(newStore);
  WriteData(newStore);
  if (SessionUpdateInterval) {
    clearInterval(SessionUpdateInterval);
  }
  SessionUpdateInterval = setInterval(SessionUpdate, 2000);
}

function SessionUpdate() { /////////////////////////////////////////////////////////////////////
  GetPostData().then(newStore => {
    newStore.d = store.d;
    WriteData(newStore);
  }).catch(error => {
    let newStore = JSON.parse(JSON.stringify(store));
    delete newStore['s'];
    if (SessionUpdateInterval) {
      clearInterval(SessionUpdateInterval);
    }
    WriteData(newStore);
  });
}

function CheckTask(e) { /////////////////////////////////////////////////////////////////////
  let task = parseInt(e.target.dataset.task);
  let time = parseInt(e.target.dataset.time);
  let an = e.target.dataset.an == "true";
  let icon = document.querySelector(".icon-btn").innerText;
  if (store.s) {
    let postData = [task, time, icon];
    GetPostData(postData).then(newStore => {
      newStore.d = store.d;
      WriteData(newStore);
    });
  }
  else {
    let newStore = JSON.parse(JSON.stringify(store));
    if (an) {
      newStore.c[task].push(icon);
      while (newStore.c[task].length > 10) {
        newStore.c[task].shift();
      }
    }
    else {
      if (((((newStore?.c)|{})[task]??{})[time]??'').length > 0) {
        newStore.c[task][time] = "";
      }
      else {
        newStore.c[task][time] = icon;
      }
    }
    WriteData(newStore);
  }
}

const ICONS = [
		"✔️",		"❌",   "✅",   "❎",    "☑️",    "✓",    "✖",     "V",      "X",
		"🔴",		"🟠",   "🟡",   "🟢",    "🔵",    "🟣",   "🟤",    "⚫",    "🔘",
		"❤️",		"🧡",   "💛",   "💚",    "💙",    "💜",   "🤎",    "🖤",    "🤍",
		"🟥",		"🟧",   "🟨",   "🟩",    "🟦",    "🟪",   "🟫",    "⬛",    "⬜",
		"🏳",		 "🏴",   "🏳‍🌈",   "🚩",    "🏁",    "🌍",    "🪐",    "🌌",    "🏔",
		"🚗",		"🚑",   "🚀",   "🚁",    "✈",    "🚔",    "🚽",    "🌝",    "🌜",
		"⭐",	 "☃",    "❄",    "⚡",    "🔥",    "🌈",    "🍕",    "🍔",    "🍟",
		"🥓",	  "🍖",   "🥩",   "☕",    "🍷",    "🍺",    "🧊",    "🥝",    "🍇",
		"🍌",		"🍆",   "🌸",   "🌶",     "🍄",   "🥑",   "🍀",     "🍁",    "🎈",
		"🎃",		"🎁",   "🎄",    "✨",    "🎨",   "💋",   "⚽",     "⚾",    "🏀",
		"🏈",		"🎱",		"🎳",   "⛳",    "⛸",    "🎮",   "🕹",     "🎲",    "🧿",
		"🎺",		"🎸",		"🪕",   "🎻",    "🎹",   "🥁",    "🛡",    "🏹",    "🗡",
		"🔫",		"☎",		"👩",   "👨",    "🧑",   "👧",   "👦",    "🧒",    "👶",
		"👴",		"🧓",		 "👩‍🦰",   "👨‍🦰",    "👩‍🦱",    "👨‍🦱",   "👩‍🦲",    "👨‍🦲",    "👩‍🦳",
		"👼",		"🤶",		 "🧛‍♀️",   "🧜‍♀️",    "🧙‍♂️",   "🧚‍♀️",   "🧟‍♀️",    "🧟‍♂️",   "😀",
		"😍",		"😴",		 "🤑",   "😲",   "😭",   "😵",   "🤠",    "🤡",   "😈",
		"☠",		"👻",		 "👽",   "👾",   "🤖",   "💩",   "😺",    "🐵",   "🐶",
    "🏝",    "🌞",    "🌭",   "🍉",   "🧨",   "🏐",   "🎷",    "⚔",    "👵",
    "👨‍🦳",   "😎",    "🤓",    "🐮",   "🐷",   "🐲",   "🐻",   "🐼",   "🐯"
];
var iconIndex = 0;
if (window.localStorage.getItem("iconIndex")) {
  iconIndex = parseInt(window.localStorage.getItem("iconIndex"));
}

function SelectIcon(e) { /////////////////////////////////////////////////////////////////////
  let i = parseInt(e.target.dataset.icon);
  iconIndex = i;
  let iconBtn = document.querySelector(".icon-btn");
  iconBtn.innerText = ICONS[i];
  window.localStorage.setItem("iconIndex", i);
  document.querySelector(".icon-dialog").remove();
}

function ChangeIcon(e) { /////////////////////////////////////////////////////////////////////
  /* OLD WAY TO CIYCLE ICONS
  iconIndex++;
  if (iconIndex >= ICONS.length) {
    iconIndex = 0;
  }
  e.target.innerText = ICONS[iconIndex];
  window.localStorage.setItem("iconIndex", iconIndex);
  */
  let iconDialog = document.createElement("div");
  iconDialog.className = "icon-dialog";

  let iconTable = document.createElement("table");
  iconTable.cellPadding = 0;
  iconTable.cellSpacing = 2;
  iconTable.border = 0;
  iconDialog.appendChild(iconTable);

  const w = 9;
  const h = Math.ceil(ICONS.length / w);

  for (let y = 0, i = 0; y < h; y++) {
    let tr = document.createElement("tr");
    for (let x = 0; x < w; x++, i++) {
      if (i >= ICONS.length) {
        break;
      }
      let td = document.createElement("td");
      tr.appendChild(td);
      let cell = document.createElement("div");
      cell.className = "cell icon";
      cell.innerText = ICONS[i];
      cell.dataset.icon = i;
      if (i == iconIndex) {
        cell.className += " selected";
      }
      cell.onclick = SelectIcon;
      td.appendChild(cell);
    }
    iconTable.appendChild(tr);
  }

  document.body.appendChild(iconDialog);
}

function SwipeLeftDetector(element, callback) { /////////////////////////////////////////////////////////////////////
  this.element = element;
  this.callback = callback; // Callback function to be called after a successful swipe
  this.touchStartX = 0;
  this.touchEndX = 0;
  this.mouseStartX = 0;
  this.mouseEndX = 0;
  this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
  this.element.addEventListener('touchend', this.onTouchEnd.bind(this));
  this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
  this.element.addEventListener('mouseup', this.onMouseUp.bind(this));
}

SwipeLeftDetector.prototype.onTouchStart = function(event) {
  this.touchStartX = event.touches[0].clientX;
};

SwipeLeftDetector.prototype.onTouchEnd = function(event) {
  this.touchEndX = event.changedTouches[0].clientX;
  this.handleSwipe();
};

SwipeLeftDetector.prototype.onMouseDown = function(event) {
  this.mouseStartX = event.clientX;
};

SwipeLeftDetector.prototype.onMouseUp = function(event) {
  this.mouseEndX = event.clientX;
  if (this.handleSwipe(true)) {
    event.preventDefault();
    return false;
  }
};

SwipeLeftDetector.prototype.handleSwipe = function(isMouse = false) {
  const startX = isMouse ? this.mouseStartX : this.touchStartX;
  const endX = isMouse ? this.mouseEndX : this.touchEndX;
  const swipeDistance = startX - endX;
  if (swipeDistance > 250) {
    console.log('Swiped left on:', this.element);
    if (typeof this.callback === 'function') {
      setTimeout(() => {
        this.callback(this.element);
      }, 100);
      if (isMouse) {
        return true;
      }
    }
  }
  return false;
};

function ClearAnTask(cell) { /////////////////////////////////////////////////////////////////////
  let task = parseInt(cell.dataset.task);
  if (store.s) {
    let postData = [task, -1, ""];
    GetPostData(postData).then(newStore => {
      newStore.d = store.d;
      WriteData(newStore);
    });
  }
  else {
    let newStore = JSON.parse(JSON.stringify(store));
    newStore.c[task] = [];
    WriteData(newStore);
  }
}

function DisplayTable() { /////////////////////////////////////////////////////////////////////
  let container = document.getElementById("container");
  let table = document.createElement("table");
  table.cellPadding = 0;
  table.cellSpacing = 2;
  table.border = 0;
  table.className = "taskTable";

  let showTopBar = false;

  if ((!store.p) && (!store.s)) {
    if (!document.querySelector(".edit")) {
      let editBtn = document.createElement("button");
      editBtn.className = "edit";
      editBtn.innerText = "Edit";
      editBtn.onclick = EditMode;
      document.body.appendChild(editBtn);
    }

    showTopBar = true;

    AddLightSwitch();
  }
  else {
    let editBtn = document.querySelector(".edit");
    if (editBtn) {
      editBtn.remove();
    }

    if (!store.p) {
      AddLightSwitch();
    }
  }

  if (!store.p) {
    if (!document.querySelector(".icon-btn")) {
      let iconBtn = document.createElement("button");
      iconBtn.className = "icon-btn";
      iconBtn.innerText = ICONS[iconIndex];
      iconBtn.onclick = ChangeIcon;
      document.body.appendChild(iconBtn);
    }
  } else {
    let iconBtn = document.querySelector(".icon-btn");
    if (iconBtn) {
      iconBtn.remove();
    }
  }

  if (store.s) {
    let iconBtn = document.querySelector(".icon-btn");
    if (iconBtn) {
      iconBtn.classList.add("round");
    }
  } else {
    let iconBtn = document.querySelector(".icon-btn");
    if (iconBtn) {
      iconBtn.classList.remove("round");
    }
  }

  if ((!store.p) && (!store.s)) {
    if (!document.getElementById("new-session")) {
      let newSessionBtn = document.createElement("button");
      newSessionBtn.id = "new-session";
      newSessionBtn.className = "new-session";
      newSessionBtn.innerText = "New Session";
      newSessionBtn.onclick = NewSession;
      document.body.appendChild(newSessionBtn);
    }

    if (!document.getElementById("join-session")) {
      let joinSessionBtn = document.createElement("button");
      joinSessionBtn.id = "join-session";
      joinSessionBtn.className = "join-session";
      joinSessionBtn.innerText = "Join Session";
      joinSessionBtn.onclick = JoinSession;
      document.body.appendChild(joinSessionBtn);
    }

    let sessionIdInfo = document.querySelector(".session-id");
    if (sessionIdInfo) {
      sessionIdInfo.remove();
    }

    showTopBar = true;
  }
  else {
    console.log("Removing session buttons");
    let newSessionBtn = document.getElementById("new-session");
    if (newSessionBtn) {
      newSessionBtn.remove();
    }

    let joinSessionBtn = document.getElementById("join-session");
    if (joinSessionBtn) {
      joinSessionBtn.remove();
    }

    if (!store.p) {
      if (!document.getElementById("session-id")) {
        let sessionIdInfo = document.createElement("div");
        sessionIdInfo.className = "session-id";
        sessionIdInfo.innerText = store.s;
        document.body.appendChild(sessionIdInfo);
      }
    }
  }

  if (showTopBar) {
    document.getElementById("top-bar").style.display = "block";
  }
  else {
    document.getElementById("top-bar").style.display = "none";
  }

  if (store.t[0][1] == -1) {
    let title = document.createElement("tr");
    table.appendChild(title);
    let titleTd = document.createElement("td");
    titleTd.colSpan = 7;
    title.appendChild(titleTd);
    let titleDiv = document.createElement("div");
    titleDiv.className = "cell task category first-category";
    titleDiv.innerText = store.t[0][0];
    titleTd.appendChild(titleDiv);
  }

  let tr = document.createElement("tr");
  table.appendChild(tr)
  tr.appendChild(document.createElement("td"));
  for (let i = 0; i < 7; i++) {
    if (i == store.do) {
      continue;
    }
    let td = document.createElement("td");
    tr.appendChild(td);
    let cell = document.createElement("div");
    cell.className = "cell day";
    cell.innerText = dayName(i);
    td.appendChild(cell);
  }

  let lastCell = null;
  let lastWasCategory = false;

  for (let i = 0; i < store.t.length; i++) {
    let [task, times] = store.t[i];

    if (times == -1 && i == 0) {
      continue;
    }

    tr = document.createElement("tr");
    table.appendChild(tr);

    let td = document.createElement("td");
    if (times == -1) {
      td.colSpan = 7;
    }
    tr.appendChild(td);
    let cell = document.createElement("div");
    cell.className = "cell task";
    if (times == -1) {
      cell.className += " category";
      if (!!lastCell) {
        lastCell.className += " last-cell";
        lastCell = null;
      }
    }
    cell.innerText = task;
    td.appendChild(cell);

    let isaAN = times == 0;
    if (isaAN) {
      times = 1;
    }
    for (let j = 0; j < times; j++) {
      let colSpan = Math.floor(6 / times);
      let td = document.createElement("td");
      if (times == 4 && j == 1) {
        colSpan = 2;
      }
      if (times == 4 && j == 3) {
        colSpan = 2;
      }
      if (times == 5 && j == 2) {
        colSpan = 2;
      }
      td.colSpan = colSpan;
      tr.appendChild(td);
      let cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.task = i;
      cell.dataset.time = j;
      if (isaAN) {
        cell.className += " an";
        cell.dataset.an = true;
        if (store.c) {
          cell.innerText = store.c[i].join("");
        }
        new SwipeLeftDetector(cell, ClearAnTask);
      } else {
        cell.dataset.an = false;
        if (store.c) {
          cell.innerText = store.c[i][j] ?? "";
        }
      }
      cell.onclick = CheckTask;
      if (lastWasCategory) {
        if (j == times - 1) {
          cell.className += " top-last-cell";
        }
      }
      td.appendChild(cell);
      lastCell = cell;
    }

    lastWasCategory = times == -1;
  }

  if (!!lastCell) {
    lastCell.className += " last-cell";
  }

  container.innerHTML = "";
  container.appendChild(table);
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

setInterval(Tick, 200);
