import { useState, useRef } from 'react'
import styled from 'styled-components'
import { invoke } from '@tauri-apps/api'
import { confirm, message } from '@tauri-apps/api/dialog'
import { useEffect } from 'react'
import useLocalStorage from './hooks/localStorage'

const MainDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  padding-bottom: 50px;
`

const LeftDiv = styled.div``

const MenuUl = styled.ul`
  list-style: none;
  min-width: 100px;
  min-height: 50px;
  padding: 0;
`

const MenuLi = styled.li`
  background-color: ${(props) => (props.$active ? '#2894db' : '#80dfbbce')};
  color: ${(props) => (props.$active ? '#eee' : '#000')};
  margin: 5px;
  padding: 10px;
  border-radius: 50px;
  &:hover {
    background-color: #419cd8c1;
  }
`

const TodoUl = styled.div``

const ItemLi = styled.li`
  list-style: none;
  min-width: 164px;
  min-height: 30px;
  margin: 10px;
  background-color: aliceblue;
  border-radius: 50px;
`

const TodoItemDiv = styled.div`
  display: grid;
  grid-template-columns: calc(100% - 64px) 32px 32px;
  align-items: center;
`
const TodoContent = styled.span`
  background-color: ${(props) => (props.$done ? '#dddddd' : '#c9e2f8')};
  padding: 10px;
  border-radius: 50px;
  text-decoration: ${(props) => (props.$done ? 'line-through' : 'none')};
`

const DoneMarkCb = styled.input``

const DelMarkBtn = styled.button`
  text-align: center;
  align-content: center;
  background-color: transparent;
  border: none;
  color: red;
  &:hover {
    background-color: red;
    color: aliceblue;
    border-radius: 50px;
  }
`

const RightDiv = styled.div`
  width: 100%;
`

const FooterDiv = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50px;
  background-color: #d3d3d3;
`

const AddBoxDiv = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 10px;
`

const AddInput = styled.input`
  min-width: calc(100% - 64px);
  font-size: 16px;
  border: 1px solid #aed5f7;
  border-radius: 50px;
  padding: 5px;
  &:focus {
    border-color: #e65e9e;
    outline: none;
  }
`

const AddBtn = styled.button`
  width: 64px;
  background-color: #e65e9e;
  color: #fffeee;
  border: none;
  border-radius: 50px;
  margin-left: 10px;
  &:hover {
    color: #333333;
    background-color: #aed5f7;
  }
`

function AddBox({ refresh }) {
  const addRef = useRef()
  const inputRef = useRef()
  return (
    <AddBoxDiv>
      <AddInput id={'todoInput'} ref={inputRef} />
      <AddBtn
        ref={addRef}
        onClick={async (e) => {
          const todo = inputRef.current.value
          if (!todo && todo === '') {
            return
          }
          invoke('add_todo', { todo: todo }).then((res) => {
            if (res !== 'success') {
              message(res, '错误')
              return
            }
            refresh()
          })
        }}
      >
        Add
      </AddBtn>
    </AddBoxDiv>
  )
}

function MenuList({ menus, activeTab, setActiveTab }) {
  let menuItemArr = []

  Object.keys(menus).forEach((key, index) => {
    const menu = menus[key]
    menuItemArr.push(
      <MenuLi
        id={'menu-id-' + menu.id}
        $active={activeTab === key}
        onClick={() => {
          setActiveTab(key)
        }}
        key={'menu-key-' + index}
      >
        {menu.name}
      </MenuLi>
    )
  })

  return <MenuUl>{menuItemArr}</MenuUl>
}

function TodoList({ todos, activeTab, menusArr, refresh }) {
  let todoItemArr = []
  todos.forEach((todo, index) => {
    if (activeTab !== menusArr[0] && todo.status !== activeTab) {
      return
    }
    todoItemArr.push(
      <TodoItem
        id={todo.id}
        title={todo.title}
        tag={todo.tag}
        status={todo.status}
        refresh={refresh}
        key={'todo-key-' + index}
      />
    )
  })
  return <TodoUl>{todoItemArr}</TodoUl>
}

function TodoItem({ id, title, tag, status, refresh }) {
  const [itemStatus, setItemStatus] = useState(status)
  return (
    <ItemLi id={'todo-id-' + id}>
      <TodoItemDiv>
        <TodoContent $done={itemStatus === 'DONE'}>{title}</TodoContent>
        <DoneMarkCb
          type="checkbox"
          checked={itemStatus === 'DONE'}
          onChange={(e) => {
            const status = e.target.checked ? 'DONE' : 'TODO'
            invoke('mark_todo', {
              id: id,
              status: status,
            }).then((res) => {
              if (res !== 'success') {
                message(res, '错误')
                return
              }
              setItemStatus(status)
            })
          }}
        />
        <DelMarkBtn
          onClick={async (e) => {
            if (!(await confirm('是否确认删除？', '警告'))) {
              return
            }
            invoke('remove_todo', { id: id }).then((res) => {
              if (res !== 'success') {
                message(res, '错误')
                return
              }
              refresh()
            })
          }}
        >
          X
        </DelMarkBtn>
      </TodoItemDiv>
    </ItemLi>
  )
}

export default function App() {
  const [todos, setTodos] = useState([])
  // const [activeMenu, setActiveMenu] = useState('ALL')
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'ALL')

  const menus = {
    ALL: {
      id: 1,
      name: 'ALL',
    },
    TODO: {
      id: 2,
      name: 'TODO',
    },
    DONE: {
      id: 3,
      name: 'DONE',
    },
  }

  const menusArr = Object.keys(menus)

  const refresh = () => {
    invoke('init_todo').then((res) => {
      let newTodos = JSON.parse(res)
      setTodos(newTodos)
    })
  }
  useEffect(() => {
    refresh()
  }, [activeTab])

  return (
    <>
      <MainDiv>
        <LeftDiv>
          <MenuList
            menus={menus}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </LeftDiv>
        <RightDiv>
          <AddBox refresh={refresh} />
          <TodoList
            todos={todos}
            menusArr={menusArr}
            activeTab={activeTab}
            refresh={refresh}
          />
        </RightDiv>
      </MainDiv>
      <FooterDiv></FooterDiv>
    </>
  )
}
