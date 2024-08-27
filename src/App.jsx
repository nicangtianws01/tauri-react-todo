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
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  min-width: 100px;
  min-height: 30px;
  background-color: #7fc5ff;
  margin: 10px 10px;
  border-radius: 5px;
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
  justify-content: flex-start;
`

const AddInput = styled.input`
  width: 80%;
  font-size: 18px;
`

const AddBtn = styled.button`
  width: 20%;
  background-color: #e65e9e;
  color: #dddddd;
  border: none;
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
    todoItemArr.push(<ItemLi key={'todo-index-' + index}>{todo.todo}</ItemLi>)
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
            <AddInput id={'todoInput'} ref={inputRef}/>
            <AddBtn ref={addRef} onClick={(e) => {
              const todo = inputRef.current.value
              if(!todo && todo === ''){
                return
              }
              invoke('add_todo', { todo: todo }).then((res) => {
                let todo = JSON.parse(res)
                let newTodos = [todo].concat(todos)
                setTodos(newTodos)
              })
            }}>添加</AddBtn>
          </AddBox>
          <TodoUl>{todoItemArr}</TodoUl>
        </RightDiv>
      </MainDiv>
      <FooterDiv></FooterDiv>
    </>
  )
}
