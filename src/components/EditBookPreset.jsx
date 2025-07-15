import TextareaAutosize from 'react-textarea-autosize'

export default function EditBookPreset(props) {
    const book = props.presetBook
    return (
        <div className="select-custom-book-preset">
                    <div className="bookinfos-title">
                        <span className="title">General Book Information</span>
                        <div className="book-title-underline"></div>
                    </div>
                    <div className="book-title">
                        <label htmlFor="title">Title:</label>
                        <TextareaAutosize className="book-title-i" minRows={1} maxRows={7} placeholder="Example Book Title" value={book.title} id="title" maxlength={1000} />
                        <div className="book-title-underline"></div>
                    </div>
                    <div className="book-properties-fields">
                        <div className="book-cover">
                            <img src={book.cover} alt="Bookcover" className="book-cover-img"/>
                        </div>
                        <div className="book-properties">
                            <label htmlFor='author'>Author:</label>
                            <TextareaAutosize minRows={1} maxRows={6} id='author' className="book-author" aria-label='Enter Author' defaultValue={book.authors} placeholder="Exmaple Author" maxlength={150} />
                            <label htmlFor='pages'>Pages:</label>
                            <input type="number" id="pages" className="book-pages monospace" aria-label='Enter Pages' placeholder="XXX" defaultValue={book.pages} maxlength="5" min="1"/>
                            <label htmlFor='decription'>Description:</label>
                            <textarea id='description' className="book-descrption" aria-label='Enter a decription' placeholder="The bestseller from..." defaultValue={book.description} rows={7} maxlength="2000"></textarea> 
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
                        <label>Section of the Book:</label> 
                        <form className="select-reading-goals">
                            <textarea rows="1" className="goal-start scroll monospace" placeholder="Start point." maxlength="6"></textarea> <span className="monospace">-</span>
                            <textarea rows="1" className="goal-end scroll monospace" placeholder="End point." maxlength="6"></textarea>
                        </form>
                        
                    </div>
                </div>
    )
}