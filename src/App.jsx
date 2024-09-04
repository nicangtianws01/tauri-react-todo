import { useState, useRef } from 'react'
import styled from 'styled-components'
import { invoke } from '@tauri-apps/api'
import { confirm } from '@tauri-apps/api/dialog'
import { useEffect } from 'react'

const MainDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
`

const LeftDiv = styled.div``

const LogoDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
  min-height: 50px;
  background-color: #32e9a3;
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
  background-color: ${(props) => (props.done ? '#dddddd' : '#c9e2f8')};
  padding: 10px;
  border-radius: 50px;
  text-decoration: ${(props) => (props.done ? 'line-through' : 'none')};
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
  height: 800px;
`

const FooterDiv = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 50px;
  background-color: #d3d3d3;
`

const AddBox = styled.div`
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
  &:hover {
    color: #333333;
    background-color: #aed5f7;
  }
`

function TodoItem({ id, title, tag, status }) {
  const [itemStatus, setItemStatus] = useState(status)
  return (
    <ItemLi id={'todo-id-' + id}>
      <TodoItemDiv>
        <TodoContent done={itemStatus === 'DONE'}>{title}</TodoContent>
        <DoneMarkCb
          type="checkbox"
          checked={itemStatus === 'DONE'}
          onChange={(e) => {
            invoke('mark_todo', {
              id: id,
              status: e.target.checked ? 'DONE' : 'TODO',
            }).then((res) => {
              if (res === 'DONE') {
                setItemStatus('DONE')
              }
              if (res === 'TODO') {
                setItemStatus('TODO')
              }
            })
          }}
        />
        <DelMarkBtn
          onClick={async (e) => {
            if (!(await confirm('是否确认删除？', '警告'))) {
              return
            }
            invoke('remove_todo', { id: id }).then((res) => {
              if (res === 'success') {
                document.querySelector('#todo-id-' + id).remove()
              }
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
  const [msg, setMsg] = useState('')
  const [todos, setTodos] = useState([])

  useEffect(() => {
    invoke('greet', { name: 'World' }).then((response) => setMsg(response))
  }, [])

  useEffect(() => {
    invoke('init_todo').then((res) => {
      let todos = JSON.parse(res)
      setTodos(todos)
    })
  }, [])

  let todoItemArr = []
  todos.forEach((todo, index) => {
    todoItemArr.push(
      <TodoItem
        id={todo.id}
        title={todo.title}
        tag={todo.tag}
        status={todo.status}
        key={'todo-index-' + index}
      />
    )
  })

  const addRef = useRef()
  const inputRef = useRef()

  return (
    <>
      <MainDiv>
        <LeftDiv>
          <LogoDiv>{msg}</LogoDiv>
        </LeftDiv>
        <RightDiv>
          <AddBox>
            <AddInput id={'todoInput'} ref={inputRef} />
            <AddBtn
              ref={addRef}
              onClick={(e) => {
                const todo = inputRef.current.value
                if (!todo && todo === '') {
                  return
                }
                invoke('add_todo', { todo: todo }).then((res) => {
                  let todo = JSON.parse(res)
                  let newTodos = [todo].concat(todos)
                  setTodos(newTodos)
                })
              }}
            >
              Add
            </AddBtn>
          </AddBox>
          <TodoUl>{todoItemArr}</TodoUl>
        </RightDiv>
      </MainDiv>
      <FooterDiv></FooterDiv>
    </>
  )
}
