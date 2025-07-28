import Header from "../components/Header"
import Col from "../Col"
import names from "../names.js"
import colorSet from '../colors.js'

import { useState, useRef, useEffect } from 'react'

export default function Homepage() {
  const defaultCover= "https://arch.the-jzt.de/defaultcover.svg"
  const [showHelp, setShowHelp] = useState(true);
  const colors = useRef(colorSet);
  const lastCol = useRef(null);
  const addFriend = useRef(null);
  const mainDiv = useRef(null);
  const scollIntoView = useRef(false);
  const defaultBook = {
          bookId: '',
          title: '',
          cover: {url: defaultCover, publicId: null},
          authors: '',
          publishedDate: '',
          pages: '',
          description: '',
          goal: {goalStart: '', goalEnd: ''}
      }

  const [cols, setCols] = useState(() =>
    [
      {
        id: 0,
        friendName: getRandomName(),
        presetBook: defaultBook,
        color: getRandomAvailableColor()
      },
      {
        id: 1,
        friendName: getRandomName(),
        presetBook: defaultBook,
        color: getRandomAvailableColor()
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
    return names[Math.floor(Math.random() * (names.length-1))]
  }

  function getRandomAvailableColor() {
    const random = Math.random();
    const index = Math.floor(random * (colors.current.length-1));
    const color = colors.current[index]
    colors.current = colors.current.filter(aColor => aColor !== color)
    return color;
  }

  function removeCol(id) {
    const col = cols.find(col => col.id === id);
    const color = colorSet.find(color => color.name === col.color.name);
    colors.current = [...colors.current, color] 
    const public_id = col.presetBook.cover.publicId
    if(public_id) deleteCover(id, public_id)
    setCols(prevCols =>  prevCols.filter(col => col.id !== id))
  }

  function setPresetBook(id, book) {
    setCols(prevCols => prevCols.map(col => col.id == id ? {...col, presetBook: book} : col));
  }



  async function deleteCover(id, public_id) {
        const book = cols.find(col => col.id === id).presetBook
        fetch(`${import.meta.env.VITE_API}/api/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({public_id: public_id})
        }).then(res => { return res })
        .then(setPresetBook(id, {...book, cover: {url: defaultCover, public_id: null}}));
    }

  function handleNameChange(id, name) {
    setCols(prevCols => prevCols.map(col => col.id == id ? {...col, friendName: name} : col))
  }

  function addCol() {
    scollIntoView.current = true;
    setCols(prevCols => [...prevCols, { id: getAvilableId(), friendName: getRandomName(), color: getRandomAvailableColor(), presetBook: defaultBook} ])
    
  }

  function setColor(id, color) {
    const col = cols.find(col => col.id === id);
    const doubleCol = cols.find(col => col.color.name === color.name);
    const oldColor = col.color;
    if(doubleCol) {
      setCols(prevCol => prevCol.map(col => col.id === doubleCol.id ? {...col, color: oldColor} : col));
    } else {
      colors.current = [...colors.current, oldColor] 
      colors.current = colors.current.filter(aColor => aColor !== color)
    }
    setCols(prevCol => prevCol.map(col => col.id === id ? {...col, color: color} : col));
    
    
  }

  function getAvilableId() {
    let id = 0;
    while(cols.some(col => col.id === id)) {
      id++
    }
    return id;
  }

  useEffect(() => {
    if((!lastCol.current && !addFriend.current) || !scollIntoView.current) return;
    let col = lastCol.current ? lastCol : addFriend;
    col.current.scrollIntoView();
    scollIntoView.current = false;
  }, [cols])

  useEffect(() => {
    mainDiv.current.style.setProperty('--show-help', showHelp ? 'unset' : 'none');
  }, [showHelp])

  function handleShowHelpChange(e) {
    setShowHelp(e.target.checked);
  }

  const maxCols = 9;

  function setLastCol(element) {
    lastCol.current = element
  }

  const colsComponents = cols.map((col, index) =>  {
    return (<Col key={col.id} {...col} showHelp={showHelp} removeCol={removeCol} setColor={setColor} colors={colors.current} deleteCover={deleteCover} onNameChange={handleNameChange} setPresetBook={setPresetBook} allowClose={cols.length > 2} setLastCol={index === (maxCols-1) ? setLastCol : null}/>)
  })

  async function submitUsers() {
    const res = await fetch(`${import.meta.env.VITE_API}/config`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({users: cols})
    })
    const data = await res.json();
    if(!res.ok) console.error(data)
    window.open('/config/' + data.slug);
  }


  return ( 
  <div ref={mainDiv}>
    <form >
      <label htmlFor="show-help" className="show-help-form">
        <input type="checkbox" id="show-help" onChange={handleShowHelpChange} checked={showHelp}></input>
        <span className="checkmark"></span>
        Show Help
      </label>
    </form>
      <Header />
      <div className="friends-total">
        <span>Total Friends: </span><span className="monospace">{cols.length}/{maxCols}</span>
      </div>
      <div className="setup-friends" id="setup-friends">
        {colsComponents}
          {cols.length < maxCols && <div className="col add-friend">
              <button><i onPointerOver={hoverAddFriend} onPointerOut={hoverOutAddFriend} onClick={addCol} ref={addFriend} className="fa-regular fa-square-plus"></i></button>
          </div>}
      </div>
      <button className="submit" onClick={submitUsers}>Create Friend Configuration</button>
  </div>  
  )
}