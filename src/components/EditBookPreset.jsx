import { useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import loading from '../assets/covers/loading.svg'

export default function EditBookPreset(props) {
    const book = props.presetBook
    const current = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const id = props.id;
    const deleteCover = props.deleteCover;
    
    useEffect(() => {
        let doc = null;
        if(current.current) doc = current.current;
        const inputs = doc.querySelectorAll('input, textarea');
        function handleFocus(input) {
            label(input).classList.add('focus');
        }
        function handleBlur(input) {
            label(input).classList.remove('focus');
        }
        const label = (input) => doc.querySelector(`label[for="${input}"]`);
        inputs.forEach(input => {
            input.addEventListener('focus',(e) => handleFocus(e.target.id))
            input.addEventListener('blur', (e) => handleBlur(e.target.id))
        });
        
        return () => {
            inputs.forEach(input => {
                input.removeEventListener('focus', handleFocus);
                input.removeEventListener('blur', handleBlur);
            })
        }
    }, [])

    async function handleCoverUpload(e) {
        if(book.cover.public_id) {
            deleteCover(book.cover.public_id)
        }

        const file = e.target.files[0]
        const formData = new FormData
        formData.append('image', file);

        setIsLoading(true);

        const res = await fetch('https://arch.the-jzt.de/api/upload', {
            method: 'POST',
            body: formData,
        })

        if(!res.ok) {
            console.error("An error occured while uploading the cover: ", await res.json());
            return;
        }

        const data = await res.json();
        props.setPresetBook(id, ({...book, cover: {url: data.url, public_id: data.public_id}}));
        setTimeout(() => {
            setIsLoading(false);
        }, 1000)
    }

    const totalPages = book.goal.goalEnd-book.goal.goalStart;

    return (
        <div className="select-custom-book-preset" ref={current}>
                    <div className="bookinfos-title">
                        <span className="title">General Book Information</span>
                        <div className="book-title-underline"></div>
                    </div>
                    <div className="book-title">
                        <label htmlFor={"title-"+ id}>Title:</label>
                        <TextareaAutosize className="book-title-i" minRows={1} maxRows={7} placeholder="Example Book Title" value={book.title} onChange={props.onChange} id={"title-"+ id} maxLength={1000} />
                        <div className="book-input-underline"></div>
                    </div>
                    <div className="book-properties-fields">
                        <div className="book-cover">
                            <img src={book.cover.url} alt="Bookcover" className="book-cover-img"/>
                             <div className={'overlay' + (isLoading ? ' no-hover' : '')}>
                                <form>
                                    <input id={'upload-cover-' + id} type="file" onChange={handleCoverUpload} accept='image/*'/>
                                    <label htmlFor={"upload-cover-" + id}><i className="fa-solid fa-arrow-up-from-bracket"></i></label>
                                </form>
                                <span onClick={() => deleteCover(book.cover.public_id)}><i className="fa-solid fa-trash-can"></i></span>
                                
                            </div>
                            <div className={'overlay' + (isLoading ? ' loading' : ' no-hover')}>
                                <img src={loading} alt="loading" />
                            </div>
                            
                        </div>
                        <div className="book-properties">
                            <label htmlFor={'authors-'+ id}>Author:</label>
                            <TextareaAutosize minRows={0} maxRows={6} id={'authors-'+ id} className="book-author" aria-label='Enter Author' value={book.authors} onChange={props.onChange} placeholder="Example Author" maxLength={150} />
                            <label htmlFor={'pages-'+ id}>Pages:</label>
                            <input type="number" id={"pages-" + id} className="book-pages monospace" aria-label='Enter Pages of the Book' placeholder="XXX" value={book.pages} onChange={props.onChange} max={99999} maxLength={5} min="1"/>
                            <label htmlFor={'publishedDate-' + id}>Published: </label>
                            <input type="date" id={"publishedDate-" + id} className="book-pages monospace" aria-label='Enter the Date the book was Published' value={book.publishedDate} onChange={props.onChange}/>
                            <label htmlFor={'description-' + id}>Description:</label>
                            <textarea id={'description-' + id} className="book-descrption" aria-label='Enter a decription' placeholder="The bestseller from..." value={book.description} onChange={props.onChange} rows={7} maxLength="2000"></textarea> 
                        </div>
                    </div>
                    <div className="reading-goals">
                        <span className="title">Personal fair Reading-Goal</span>
                        <div className="book-title-underline"></div>
                        <fieldset className="tutorial help">
                            <legend>Help</legend>
                            <p>To ensure a fair race please enter the section of the book you want to race with your friend/s. 
                                This is due not everyone having the same reading speed and the various difficullty of books.</p>
                        </fieldset>
                        <div className='select-reading-goals'>
                            <form className="reading-goals-form">
                                <label htmlFor={'goal-' + id}>Section of the Book:</label>
                                <div className='inputs'>
                                    <textarea id={'goal-' + id} rows="1" className="goalStart scroll monospace" placeholder="Start point." onChange={props.onChange} value={book.goal.goalStart} maxLength="6" ></textarea> <span className="monospace">-</span>
                                    <textarea id={'goal-' + id} rows="1" className="goalEnd scroll monospace" placeholder="End point." onChange={props.onChange} value={book.goal.goalEnd} maxLength="6"></textarea>
                                </div> 
                            </form>
                            <div className='total-pages-div'>
                                    <span className='label'>Pages Selected:</span>
                                    <span className='total-pages'>{totalPages < 0 ? '-X-' : totalPages}</span>
                            </div> 
                        </div>
                    </div>
                </div>
    )
}