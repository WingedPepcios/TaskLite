class TaskHelper {
  constructor(data = {}) {
    this.taskPrototype = {
      name: 'Default Task',
      priority: 0,
      status: 'open',
    };
    this.config = {
      wrapper: 'body',
      name: 'Default List',
      ...data,
    };
    this.storage = window.localStorage;
    this.taskList = [...this.getStore()];
  }

  getStore(name = this.config.name) {
    return JSON.parse(this.storage.getItem(name));
  }

  // save storage
  saveStore(name, data) {
    this.storage.setItem(name, data);
  }

  // prepare data string and push it into wrapper
  // there is no params
  renderList() {
    // console.log(this.taskList);
    const listHtml = `<section class="myList">
      ${this.taskList.map((value, index) => `<div class="task d-flex">
      <div>
        <input name="index" type="hidden" value="${index}" />
        <input name="task_name" type="text" value="${value.name}" />
      </div>
    </div>`).join('')}
    </section>`;
    document.querySelector(this.config.wrapper).innerHTML = listHtml;
  }

  // remove task from array based on index
  // auto save and list reload
  removeTask(taskIndex) {
    this.taskList.splice(taskIndex, 1);

    this.renderList();
    this.saveStore(this.config.name, JSON.stringify(this.taskList));
  }

  // Create task, add to tasklist and re-render html
  // data is an object. Parameters:
  // name - task text displayed on site,
  // priority - numeric value for table sort,
  // status - task current proggress
  createTask(data) {
    const task = {
      ...this.taskPrototype,
      name: `${this.taskPrototype.name}  ${this.taskList.length}`,
      ...data,
    };
    this.taskList.push(task);

    this.renderList();
    this.saveStore(this.config.name, JSON.stringify(this.taskList));
  }

  // Change task property, save settings and reload list
  // Params: taskIndex - index of array element
  // property - name of key to change
  // value
  changeTaskProperty(taskIndex, property, value = '') {
    if (taskIndex >= this.taskList.length) {
      throw Error(`Index ${taskIndex} doesn't exist!`);
    }
    this.taskList[taskIndex][property] = value;

    this.renderList();
    this.saveStore(this.config.name, JSON.stringify(this.taskList));
  }
}

const element = new TaskHelper({ name: 'My TODO\'s', wrapper: '.wrapper' });
element.renderList();
