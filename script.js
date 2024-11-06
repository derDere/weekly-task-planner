var store = null;

function dayName(dayIndex) {
  // 0:Mo, 1:Di, 2:Mi, 3:Do, 4:Fr, 5:Sa, 6:So
  let t = new Date('1992-03-08');
  let day = t.getDay();
  t.setDate(t.getDate() - day + dayIndex + 1);
  return t.toLocaleDateString(undefined, {weekday: 'short'});
}

function ReadData() {
  let jj = document.location.hash;
  if (!jj) {
    return {};
  }
  jj = jj.substr(1);
  jj = decodeURIComponent(jj);
  let jo = JSON.parse(jj);
  return jo;
}

function WriteData(data) {
  let jj = JSON.stringify(data);
  document.location.hash = jj;
}

function UpdateDisplay(newStore) {
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
    /*
    let container = document.getElementById("container");
    let jj = JSON.stringify(store, null, 2);
    container.innerHTML = "<pre>" + jj + "</pre>";
    */
    DisplayTable();
  }
}

function CheckUpdate(newStore) {
  let jj1 = JSON.stringify(store);
  let jj2 = JSON.stringify(newStore);
  return jj1 != jj2;
}

function Tick() {
  let newData = ReadData();
  if (CheckUpdate(newData)) {
    UpdateDisplay(newData);
  }
}

setInterval(Tick, 200);

function ExampleData() {
  return {
    do: 6, // Day off
    t: [
      ["Kategory 1", -1],
      ["Task 1", 1],
      ["Task 2", 2],
      ["Task 3", 3],
      ["Kategory 2", -1],
      ["Task 4", 4],
      ["Task 5", 5],
      ["Task 6", 6],
      ["Kategory 3", -1],
      ["Task 7", 0]
    ]
  };
}

function ToggleDarkMode() {
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.d = !store.d;
  WriteData(newStore);
}

function EditMode() {
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.e = true;
  WriteData(newStore);
}

function AddTask() {
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
  if (times < 0 || times > 6) {
    alert("Times is out of range!");
    return;
  }
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.t.push([task, times]);
  WriteData(newStore);
}

function EditTask(e) {
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

function MoveUpTask(e) {
  let index = parseInt(e.target.dataset.index);
  let newStore = JSON.parse(JSON.stringify(store));
  if (index > 0) {
    let tmp = newStore.t[index];
    newStore.t[index] = newStore.t[index - 1];
    newStore.t[index - 1] = tmp;
  }
  WriteData(newStore);
}

function MoveDnTask(e) {
  let index = parseInt(e.target.dataset.index);
  let newStore = JSON.parse(JSON.stringify(store));
  if (index < newStore.t.length - 1) {
    let tmp = newStore.t[index];
    newStore.t[index] = newStore.t[index + 1];
    newStore.t[index + 1] = tmp;
  }
  WriteData(newStore);
}

function DelTask(e) {
  let index = e.target.dataset.index;
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.t.splice(index, 1);
  WriteData(newStore);
}

function changeDayOff(e) {
  let newStore = JSON.parse(JSON.stringify(store));
  newStore.do = e.target.value;
  WriteData(newStore);
}

function ShowForm(data) {
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
  link.innerHTML = link.href;
  linkTd.appendChild(link);
  ////////////////////////////////////////////////////
  if (!data) {
    data = ExampleData();
    data.e = true;
  }
  ////////////////////////////////////////////////////
  let dayOffLabel = document.createElement("label");
  dayOffLabel.innerHTML = "Day off: ";
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
    option.innerHTML = dayName(i);
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
    editBtn.innerHTML = "✎";
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
    delBtn.innerHTML = "🗙";
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
      option.innerHTML = "Kategory";
    }
    else if (i == 0) {
      option.innerHTML = "As needed";
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
  addBtn.innerHTML = "+";
  form.appendChild(addBtn);
  addBtn.onclick = AddTask;
  ////////////////////////////////////////////////////
  container.innerHTML = "";
  let h2 = document.createElement("h2");
  h2.innerHTML = "Weekly Task Planner";
  container.appendChild(h2);
  container.appendChild(table);
  let dataNoEdit = JSON.parse(JSON.stringify(data));
  delete dataNoEdit.e;
  let jjq = JSON.stringify(dataNoEdit);
  jjq = encodeURIComponent(jjq);
  let url = document.location.href;
  url = url.replace(/#.*$/, "");
  url += "#" + jjq;
  frame.src = url;
  link.href = url;
  link.innerHTML = url;

  store = data;
  WriteData(data);
}

function DisplayTable() {
  let container = document.getElementById("container");
  let table = document.createElement("table");
  table.cellPadding = 0;
  table.cellSpacing = 2;
  table.border = 0;
  table.className = "taskTable";

  let empty = document.createElement("tr");
  table.appendChild(empty);
  let emptyTd = document.createElement("td");
  emptyTd.colSpan = 7;
  empty.appendChild(emptyTd);
  /*
  let emptyCell = document.createElement("div");
  emptyCell.className = "cell empty";
  emptyCell.innerHTML = "Wochenplan";
  emptyTd.appendChild(emptyCell);
  */

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

  for (let i = 0; i < store.t.length; i++) {
    let [task, times] = store.t[i];

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
      td.colSpan = colSpan;
      tr.appendChild(td);
      let cell = document.createElement("div");
      cell.className = "cell";
      if (isaAN) {
        cell.className += " an";
      }
      td.appendChild(cell);
    }
  }

  /*
  for(let i = 0; i < 2; i++) {
    let empty = document.createElement("tr");
    table.appendChild(empty);
    let emptyTd = document.createElement("td");
    emptyTd.colSpan = 7;
    empty.appendChild(emptyTd);
    let emptyCell = document.createElement("div");
    emptyCell.className = "cell empty";
    if (i == 1) {
      emptyCell.innerHTML = "Nach Bedarf";
    }
    emptyTd.appendChild(emptyCell);
  }
  */

  /*
  for (let i = 0; i < store.t.length; i++) {
    let [task, times] = store.t[i];
    if (times > 0) {
      continue;
    }

    let tr = document.createElement("tr");
    table.appendChild(tr);

    let td = document.createElement("td");
    tr.appendChild(td);
    let cell = document.createElement("div");
    cell.className = "cell task";
    cell.innerText = task;
    td.appendChild(cell);

    td = document.createElement("td");
    td.colSpan = 6;
    tr.appendChild(td);
    cell = document.createElement("div");
    cell.className = "cell";
    td.appendChild(cell);
  }
  */

  container.innerHTML = "";
  container.appendChild(table);
}
