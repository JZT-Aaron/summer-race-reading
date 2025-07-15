import Header from "./components/Header"
import Col from "./Col"
import names from "./names.js"

import { useState } from 'react'

function App() {
  

  const [cols, setCols] = useState(
    [
      {
        id: 0,
        friendName: getRandomName()
      },
      {
        id: 1,
        friendName: getRandomName()
      }
    ]
  )
  
  function hoverAddFriend(e) {
    const i = e.currentTarget;
    i.classList.remove('fa-regular')
    i.classList.add('fa-solid')
  }

  function hoverOutAddFriend(e) {
    const i = e.currentTarget;
    i.classList.remove('fa-solid')
    i.classList.add('fa-regular') 
  }

  function getRandomName() {
    return names[Math.floor(Math.random() * names.length)]
  }

  function removeCol(id) {
    setCols(prevCols => prevCols.filter(col => col.id !== id).map((col, index) => ({...col, id: index})))
  }

  function addCol() {
    setCols(prevCols => [...prevCols, { id: prevCols.length, friendName: getRandomName()} ])
  }


  const colsComponents = cols.map((col) =>  {
    return (<Col key={col.id} {...col} removeCol={removeCol} allowClose={cols.length > 2} />)
  })


  return (
    <>
      <Header />
      <div className="setup-friends" id="setup-friends">
        {colsComponents}
          <div className="col add-friend">
              <button><i onPointerOver={hoverAddFriend} onPointerOut={hoverOutAddFriend} onClick={addCol} className="fa-regular fa-square-plus"></i></button>
          </div>
      </div>
    </>
  )
}

export default App
