import { useEffect, useRef, useState } from "react";
import defaultCover from "../assets/covers/defaultCover.svg"



export default function SearchBookPreset({ selectBook }) {
    const [results, setResults] = useState([]); 
    const [showShowMore, setShowShowMore] = useState(true);
    let currentInput = useRef('');
    let abortController = useRef(new AbortController());
    let timeout = useRef(setTimeout([], 0));
    

    async function getBooksBySearch(input, maxResults, delay) {
        delay = (delay !== undefined) ? delay : 300
        clearTimeout(timeout.current);
        abortController.current.abort();
        abortController.current = new AbortController();

        setResults(() => ({
            id: -1,
            error: 'Searching...'
        }))

        await new Promise(resolve =>  {
            timeout.current = setTimeout(resolve, delay)
        });

        if(input.length <= 0) return '';

        console.log('Search started for: ', input);
        const API_KEY = import.meta.env.VITE_API_KEY;
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&maxResults=${maxResults}&key=${API_KEY}`, 
                                        {signal: abortController.current.signal})
            if(!res.ok) {
                let searchErr = ('Something went wrong. Code: ', res.status)
                if(res.status == 429) searchErr = 'Too many requests. (Rate-Limit)'
                return ({
                    id: -1,
                    error: searchErr
                })
            } 
            const data = await res.json()
            const items = await data.items;
            if(!items) {
                return ({
                    id: -1,
                    error: 'No results found'
                })
            } 
            return items.slice(0, maxResults).map((item, index) => {
                const volumeInfo = item.volumeInfo
                return ({
                    id: index,
                    bookId: item.id,
                    title: volumeInfo.title,
                    cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : defaultCover,
                    authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
                    publishedDate: volumeInfo.publishedDate || 'Unknown Year',
                    pages: volumeInfo.pageCount || 'Unknown Pages',
                    description: volumeInfo.description || 'No description available'
                })
            })
        } catch (err) {
            if(err.name == 'AbortError') { 
                console.info('Search was aborded. For: ', input)
                return ({
                    id: -1,
                    error: 'Searching...'
                })
            } else { console.error('An error occured at the search process: ', err) }
        }   
    }

    async function updateResults(input, maxResults, delay) { 
        const books = await getBooksBySearch(input, maxResults, delay);
        console.log('Search finished for: ', input, " with: ", books);
        setShowShowMore(true);
        setResults(() => books); 
    }    

    function search(e, maxResults) {
        maxResults = maxResults ? maxResults : 3
        const input = e.target.value.trim()
        //console.log(`CurrentInput: ${currentInput}, NewInput: ${input}`)
        if(currentInput === input) return;
        currentInput.current = input;
        updateResults(input, maxResults);
    }

    let showMoreElement = showShowMore ? <a onClick={() => {
        setShowShowMore(false);
        updateResults(currentInput.current, results.length+3, 0)
    }} herf="#">See more results</a> : <>Please wait...</>

    

    let resultElements = ''
    if(results == null) { resultElements = <li className="no-hover">- Something went wrong -</li> }
    else if(results.id == -1) { resultElements = <li className="no-hover">- {results.error} -</li>}
    else if(results.length > 0) { resultElements = (<> {results.map(result => (
                <li key={result.id} onClick={() => selectBook(result)}>
                  <img src={result.cover} alt="cover"/> 
                    <div>
                        <span className="book-title">{result.title}<span className="book-proptie-p"></span></span>
                        
                        <span className="book-properties">
                            <span><span className="book-proptie-p">by</span> {result.authors}</span>
                            <span><span className="book-proptie-p"> &#8231; Pages: </span> {result.pages}</span>
                            <span><span className="book-proptie-p"> &#8231; Published: </span> {result.publishedDate}</span>
                        </span>
                        <span className="book-descrption">{result.description}</span> 
                    </div>
                  </li>))}
    <li className="no-hover show-more"> {showMoreElement} </li> </> )}    
    
    return (
        <div className="select-book-preset">
            <fieldset className="tutorial warning">
                <legend>Warning</legend>
                <p>Information might be inaccurate please check and if necessary correct the information.</p>
            </fieldset>
            <fieldset className="tutorial help">
                <legend>Help</legend>
                <p>So you don't have to geather all the Informations of your book on your own, you can search your book here and they get inserted automatically.</p>
            </fieldset>
            <div className="search-box">
                <div className="row">
                    <input type="text" className="input-box" onChange={search} placeholder="Name, Author, ISBN, Keywords"/>
                    <button className="search-button" ><i className="fa-solid fa-repeat"></i></button>
                </div>
                <div className="result-box">
                    {resultElements && <ul>
                        {resultElements}
                    </ul>}
                </div>
            </div>
        </div>
    )
}