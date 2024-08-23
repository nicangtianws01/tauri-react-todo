const { invoke } = window.__TAURI__.tauri

let todoInputEl
let todoList

async function save() {
  debugger
  if (!todoInputEl.value || todoInputEl.value === '') {
    return
  }
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  const todo = await invoke('save_todo', { todo: todoInputEl.value })
  const todoItem = document.createElement('li')
  todoItem.innerText = todo
  todoList.prepend(todoItem)
}

async function init() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  await invoke('init_todo').then((res) => {
    const todos = JSON.parse(res)
    // 创建dom片段，在内存中执行插入，然后在最后整体插入
    const frag = document.createDocumentFragment()
    for (let todo of todos) {
      const todoItem = document.createElement('li')
      todoItem.innerText = todo
      frag.appendChild(todoItem)
    }
    todoList.appendChild(frag)
  })
}

window.addEventListener('DOMContentLoaded', () => {
  todoInputEl = document.querySelector('#todo-input')
  todoList = document.querySelector('#todo-list')
  document.querySelector('#todo-form').addEventListener('submit', (e) => {
    e.preventDefault()
    save()
  })

  init()
})
