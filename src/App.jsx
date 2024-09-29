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
  input {
    min-width: calc(100% - 64px);
    font-size: 16px;
    border: 1px solid #aed5f7;
    border-radius: 50px;
    padding: 5px;
    &:focus {
      border-color: #e65e9e;
      outline: none;
    }
  }
  button {
    width: 64px;
    background-color: #e6a1c1;
    color: #000;
    border: none;
    border-radius: 50px;
    margin-left: 10px;
    &:hover {
      color: #eee;
      background-color: #d6669a;
    }
  }
`

function AddBox({ refresh }) {
  const addRef = useRef(null)
  const inputRef = useRef(null)
  return (
    <AddBoxDiv>
      <input id={'todoInput'} ref={inputRef} />
      <button
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
            inputRef.current.value = ''
          })
        }}
      >
        <i className={'bi bi-arrow-right-circle'}></i>
      </button>
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
  grid-template-columns: calc(100% - 112px) 48px 32px 32px;
  align-items: center;
  button {
    border: none;
    background-color: #e6a1c1;
    border-radius: 50px;
    &:hover {
      background-color: d6669a;
      color: aliceblue;
    }
  }
  input {
    min-width: calc(100% - 64px);
    font-size: 16px;
    border: 1px solid #aed5f7;
    border-radius: 50px;
    padding: 10px;
    &:focus {
      border-color: #e65e9e;
      outline: none;
    }
  }
`
const TodoContentSpan = styled.span`
  background-color: ${(props) => (props.$done ? '#dddddd' : '#c9e2f8')};
  padding: 10px;
  border-radius: 50px;
  text-decoration: ${(props) => (props.$done ? 'line-through' : 'none')};
`

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
        key={'key-todo-' + index}
      />
    )
  })
  return <TodoUl>{todoItemArr}</TodoUl>
}

function TodoContent({ id, title, editMode, status, inputRef }) {
  if (editMode) {
    return (
      <input
        id={'id-todo-content-' + id}
        defaultValue={title}
        ref={inputRef}
        autoFocus
      ></input>
    )
  } else {
    return <TodoContentSpan $done={status === 'DONE'}>{title}</TodoContentSpan>
  }
}

function TodoItem({ id, title, tag, status, refresh }) {
  const [editMode, setEditMode] = useState(false)
  const inputRef = useRef(null)

  const changeEditMode = async () => {
    if (editMode) {
      if (inputRef.current.value === '') {
        await message('内容不能为空', '提示')
        return
      }
      await invoke('update_todo', {
        id: id,
        title: inputRef.current.value,
      }).then((res) => {
        if (res !== 'success') {
          message(res, '错误')
          return
        }
        refresh()
      })
    }

    setEditMode(!editMode)
  }

  useEffect(() => {
    if (editMode) {
      inputRef.current.focus()
    }
  }, [editMode])

  return (
    <ItemLi id={'id-todo-' + id}>
      <TodoItemDiv>
        <TodoContent
          title={title}
          id={id}
          editMode={editMode}
          status={status}
          inputRef={inputRef}
        ></TodoContent>
        <button onClick={changeEditMode}>{editMode ? '完成' : '编辑'}</button>
        <input
          type="checkbox"
          checked={status === 'DONE'}
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
              refresh()
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

const SearchDiv = styled.div`
  margin: 10px;
  display: flex;
  flex-grow: 1;
  min-width: calc(100% - 64px);
  font-size: 16px;
  border: 1px solid #aed5f7;
  border-radius: 50px;
  &:focus-within {
    border-color: #e65e9e;
  }
  input {
    font-size: 16px;
    padding: 3px;
    border: none;
    outline: none;
    border-radius: 50px;
    &:focus {
      border: none;
      outline: none;
    }
  }
  button {
    background-color: #e487b29d;
    color: #000;
    text-decoration: none;
    border: none;
    border-radius: 50px;
    padding: 5px;
    width: 32px;
    height: 32px;
    &:hover {
      color: #eee;
      background-color: #db498d;
    }
  }
`

const SearchBox = ({ setKeyword }) => {
  const kwRef = useRef(null)

  const search = () => {
    let kw = kwRef.current.value
    setKeyword(kw)
  }

  return (
    <SearchDiv id={'search-box'}>
      <input type={'text'} ref={kwRef}></input>
      <button onClick={search}>
        <i className={'bi-search'}></i>
      </button>
    </SearchDiv>
  )
}

const TagBoxDiv = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  align-items: center;
  margin: 10px;
  span {
    margin-left: 5px;
  }
`

const TagSpan = styled.span`
  border: 1px solid #aed5f7;
  border-radius: 15px;
  padding: 5px;
  margin-top: 5px;
  input {
    outline: none;
    border: none;
    width: 64px;
  }
`

const TagAddSpan = styled.span`
  :hover {
    color: #db498d;
  }
`

function Tag({ id, name, refreshTag }) {
  const [editMode, setEditMode] = useState(false)
  const inputRef = useRef(null)

  if (editMode) {
    return (
      <TagSpan>
        <input type="text" defaultValue={name} ref={inputRef} autoFocus></input>
        <i
          className="bi bi-check"
          onClick={async () => {
            if (id) {
              await invoke('update_tag', {
                id: id,
                name: inputRef.current.value,
              }).then((res) => {
                if (res === 'success') {
                  setEditMode(false)
                  refreshTag()
                }
              })
            }
          }}
        ></i>
        <i
          className="bi bi-x"
          onClick={async () => {
            if (!(await confirm('是否确认删除？', '警告'))) {
              return
            }
            await invoke('del_tag', { id: id }).then((res) => {
              if (res === 'success') {
                setEditMode(false)
                refreshTag()
              }
            })
          }}
        ></i>
      </TagSpan>
    )
  } else {
    return (
      <TagSpan
        id={'id-tag-' + id}
        onDoubleClick={() => {
          setEditMode(true)
        }}
      >
        {name}
      </TagSpan>
    )
  }
}

function TagAdd({ refreshTag }) {
  const inputRef = useRef(null)
  const [editMode, setEditMode] = useState(false)
  if (editMode) {
    return (
      <TagSpan>
        <input type="text" ref={inputRef} autoFocus></input>
        <i
          className="bi bi-check"
          onClick={async () => {
            if (
              inputRef.current.value ||
              inputRef.current.value.trim() === ''
            ) {
              setEditMode(false)
              return
            }
            await invoke('add_tag', { name: inputRef.current.value }).then(
              (res) => {
                if (res === 'success') {
                  setEditMode(false)
                  refreshTag()
                }
              }
            )
          }}
        ></i>
        <i
          className="bi bi-x"
          onClick={async () => {
            if (!(await confirm('是否确认删除？', '警告'))) {
              return
            }
            setEditMode(false)
            refreshTag()
          }}
        ></i>
      </TagSpan>
    )
  } else {
    return (
      <TagAddSpan>
        <i
          onClick={() => {
            setEditMode(true)
          }}
          className="bi bi-plus-circle"
        ></i>
      </TagAddSpan>
    )
  }
}

function TagBox({ tags, refreshTag }) {
  const tagArr = []
  tags.map((tag) => {
    if (tag.del_flag === 0) {
      tagArr.push(
        <Tag id={tag.id} name={tag.name} refreshTag={refreshTag}></Tag>
      )
    }
  })

  return (
    <TagBoxDiv>
      <span>标签:</span>
      {tagArr}
      <TagAdd refreshTag={refreshTag}></TagAdd>
    </TagBoxDiv>
  )
}

export default function App() {
  const [todos, setTodos] = useState([])
  const [tags, setTags] = useState([])
  // const [activeMenu, setActiveMenu] = useState('ALL')
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'ALL')
  const [keyword, setKeyword] = useState('')

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
    invoke('init_todo', { kw: keyword }).then((res) => {
      let newTodos = JSON.parse(res)
      setTodos(newTodos)
    })
  }

  const refreshTag = () => {
    invoke('list_tag').then((res) => {
      let newTags = JSON.parse(res)
      setTags(newTags)
    })
  }
  useEffect(() => {
    refresh()
  }, [activeTab, keyword])

  useEffect(() => {
    refreshTag()
  }, [])

  return (
    <>
      <MainDiv>
        <LeftDiv>
          <SearchBox setKeyword={setKeyword}></SearchBox>
          <MenuList
            menus={menus}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </LeftDiv>
        <RightDiv>
          <AddBox refresh={refresh} />
          <TagBox tags={tags} refreshTag={refreshTag}></TagBox>
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
