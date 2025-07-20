import SearchBookPreset from "./components/SearchBookPreset"
import EditBookPreset from "./components/EditBookPreset"
import ColorPicker from "./components/colorpicker";
import { useEffect, useRef, useState } from "react";

export default function Col(props) {
    const id = props.id;
    const presetBook = props.presetBook;
    const setPresetBook = props.setPresetBook;
    const friendDiv = useRef(null);
    const [selectedTab, setSelectedTab] = useState(1);
    const deleteCover = (public_id) => {
        props.deleteCover(id, public_id);
    }
    const setColor = (color) => {
        props.setColor(id, color);
    }

    function handelFriendDivRef(element) {
        if(props.setLastCol) props.setLastCol(element);
        friendDiv.current = element;
    }

    useEffect(() => {
        friendDiv.current.style.setProperty('--main-color', props.color.hex)
    })

    function handelChange(e) {
        const input = e.target;
        const property = input.id.replace('-' + id, '');
        let value = input.value;
        if(property === 'pages' && input.value != '') {
            const pages = parseFloat(value);
            if(!pages) return;
            if(pages > parseFloat(input.max)) return;
            value = pages;
        }
        if(property === 'goal') {
            let goalValue = parseInt(input.value);
            goalValue = isNaN(goalValue) ? '' : goalValue;
            value = ({
                ...presetBook.goal,
                [Array.from(input.classList).find(className => className.startsWith('goal'))]: goalValue
            })
        }
        setPresetBook(id ,({...presetBook, [property]: value}));
    }


    function updateTabSelected(e) {
        const selected = e.target.value;
        setSelectedTab(() => selected);
    }

    async function selectBook(book) {
        const goal = presetBook.goal;
        book = {
            ...book,
            cover: {url: await getBiggestCoverImage(book.bookId), publicId: null},
            publishedDate: book.publishedDate.length <= 4 ? book.publishedDate + '-01-01' : book.publishedDate,
            goal: {goalStart: goal.goalStart, goalEnd: goal.goalEnd === '' ? book.pages : goal.goalEnd }
        }
        
        setPresetBook(id, book);
        setSelectedTab(0);
    }
      
    async function getBiggestCoverImage(bookID) {
        let pic = null
        var index = 4;
        while (index > -1 && !pic) {
            pic = await getCoverImage(bookID, index);
            index--;
        }
        return pic;
    }

    async function getCoverImage(bookID, size) {
        let pic = "";
        switch(size) {
            case 0:
                pic = "thumbnail";
                break;
            case 1:
                pic = "small";
                break;
            case 2:
                pic = "medium";
                break;
            case 3:
                pic = "large";
                break;
            case 4:
                pic = "extraLarge";
                break;
            default:
                return null; 
        }
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookID}?fields=id,volumeInfo(title,imageLinks)`);
        const data = await res.json();
        let cover = await data.volumeInfo.imageLinks[pic]
        if(cover) cover = cover.replace("http:", "https:");
        return cover;
    }

    return (
        <>
            <div id={"friend-" + id}  className="col friend" ref={handelFriendDivRef}>
                <span className="color-picker-title">Pick <br />
                        Color:</span>
                <ColorPicker colors={props.colors} currentColor={props.color} setColor={setColor} />
                {props.allowClose && <button onClick={() => props.removeCol(id)} className="close"><i className="fa-solid fa-xmark"></i></button>}
                <input className="title" type="text" placeholder="Enter Name..." aria-label="Enter the Name of your Friend" value={props.friendName} onChange={(e) => props.onNameChange(id, e.target.value)} id={"friend-" + id} maxLength="30"/>
                <div className="input-underline"></div>
                <div>  
                    <form className="book-preset">    
                        <label>
                            <input onChange={updateTabSelected} type="radio" name={"book" + id} className="book-custom-radio" value={0} checked={selectedTab==0}/> 
                            <span><i className="fa-solid fa-house"></i></span>
                        </label>
                        <label>
                            <input onChange={updateTabSelected} type="radio" name={"book" + id} className="book-preset-radio" value={1} checked={selectedTab==1}/>
                            <span>Select Book Preset</span>
                        </label>
                    </form>
                </div>
                
                {(selectedTab == 0) && <EditBookPreset id={props.id} deleteCover={deleteCover} setPresetBook={setPresetBook} onChange={handelChange} presetBook={presetBook}/>} 
                
                {(selectedTab == 1) && <SearchBookPreset selectBook={selectBook}/>} 
                
                
            </div>
        </>
    )
}



