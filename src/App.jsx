import { useState, useRef } from 'react'
import styled from 'styled-components'
import { invoke } from '@tauri-apps/api'
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

const TodoItem = styled.div`
  display: grid;
  grid-template-columns: calc(100% - 64px) 32px 32px;
  align-items: center;
`
const TodoContent = styled.span`
  background-color: #c9e2f8;
  padding: 10px;
  border-radius: 50px;
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
  margin: 5px;
`

const AddInput = styled.input`
  min-width: calc(100% - 100px);
  font-size: 18px;
  border-radius: 50px;
  padding: 5px;
`

const AddBtn = styled.button`
  width: 64px;
  background-color: #e65e9e;
  color: #dddddd;
  border: none;
  border-radius: 50px;
`

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
      <ItemLi id={'todo-index-' + index} key={'todo-index-' + index}>
        <TodoItem>
          <TodoContent>{todo.todo}</TodoContent>
          <DoneMarkCb type="checkbox" />
          <DelMarkBtn
            onClick={(e) => {
              invoke('remove_todo', { id: todo.id }).then((res) => {
                if (res === 'success') {
                  document.querySelector('#todo-index-' + index).remove()
                }
              })
            }}
          >
            X
          </DelMarkBtn>
        </TodoItem>
      </ItemLi>
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
