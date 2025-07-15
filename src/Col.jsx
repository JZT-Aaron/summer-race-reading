import SearchBookPreset from "./components/SearchBookPreset"
import EditBookPreset from "./components/EditBookPreset"
import { useState } from "react";

import defaultCover from "./assets/covers/defaultCover.svg"

export default function Col(props) {
    const id = props.id;
    const [presetBook, setPresetBook] = useState({
        bookId: '',
        title: '',
        cover: defaultCover,
        authors: '',
        publishedDate: '',
        pages: '',
        description: ''
    });
    const [selectedTab, setSelectedTab] = useState(1);


    function updateTabSelected(e) {
        const selected = e.target.value;
        setSelectedTab(() => selected);
    }

    async function selectBook(book) {
        book = {
            ...book,
            cover: await getBiggestCoverImage(book.bookId)
        }
        setPresetBook(book);
        setSelectedTab(0);
    }
    
    function getRandomHexColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
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
            <div id={"friend-" + id}  className="col friend">
                { /*<input type="color"/> */}
                {props.allowClose && <button onClick={() => props.removeCol(id)} className="close"><i className="fa-solid fa-xmark"></i></button>}
                <input className="title" type="text" placeholder="Enter Name..." defaultValue={props.friendName} id={"friend-" + id} maxLength="30"/>
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
                
                {(selectedTab == 0) && <EditBookPreset presetBook={presetBook}/>} 
                
                {(selectedTab == 1) && <SearchBookPreset selectBook={selectBook}/>} 
                
                
            </div>
        </>
    )
}



