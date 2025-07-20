import { useEffect, useRef, useState } from "react";
import defaultCover from "../assets/covers/defaultCover.svg"



export default function SearchBookPreset({ selectBook }) {
    const [results, setResults] = useState([]); 
    let showShowMore  = useRef(true);
    let currentInput = useRef('');
    let abortController = useRef(new AbortController());
    let timeout = useRef(setTimeout([], 0));
    const lastElement = useRef(null);
    

    async function getBooksBySearch(input, maxResults, delay) {
        delay = (delay !== undefined) ? delay : 300
        clearTimeout(timeout.current);
        abortController.current.abort();
        abortController.current = new AbortController();

        setResults(() => ({
            id: -1,
            error: 'Searching...'
        }));

        await new Promise(resolve =>  {
            timeout.current = setTimeout(resolve, delay)
        });

        if(input.length <= 0) return '';

        try {
            const res = await fetch(`https://arch.the-jzt.de/api/search?q=${input}&maxResults=${maxResults}`, {signal: abortController.current.signal})
            if(!res.ok) {
                console.error(res.json().error, res.json.details)
                return null;
            }
            return (await res.json());
        } catch (err) {
            if(err.name == 'AbortError') { 
                return ({
                    id: -1,
                    error: 'Searching...'
                })
            } else { console.error('An error occured at the search process: ', err) }
        }        
    }

    async function updateResults(input, maxResults, delay) { 
        const books = await getBooksBySearch(input, maxResults, delay);
        setResults(() => books); 
    }    

    function search(e, maxResults) {
        maxResults = maxResults ? maxResults : 3
        const input = e.target.value.trim()
        if(currentInput === input) return;
        currentInput.current = input;
        showShowMore.current = true;
        updateResults(input, maxResults);
    }

    let showMoreElement = showShowMore.current ? <a onClick={() => {
        let maxResults = results.length+3;
        if(results > 40) {
            maxResults = 40;
            showShowMore.current = false;
        }
        updateResults(currentInput.current, maxResults, 0)
    }} herf="#">See more results</a> : <>Please change your search input</>

    

    let resultElements = ''
    if(results == null) { resultElements = <li className="no-hover">- Something went wrong -</li> }
    else if(results.id == -1) { resultElements = <li className="no-hover">- {results.error} -</li>}
    else if(results.length > 0) { resultElements = (<> {results.map((result, index) => (
                <li key={result.id} onClick={() => selectBook(result)} ref={lastElement}>
                  <img src={result.cover} alt="cover"/> 
                    <div className="text">
                        <span className="book-title">{result.title}<span className="book-proptie-p"></span></span>
                        
                        <div className="book-properties">
                            <span className="book-propti"><span className="book-proptie-p">by </span>{result.authors ||'Unknown Author'}</span>
                            <span className="book-propti"><span className="book-proptie-p">Pages: </span>{result.pages || 'Unknown Pages'}</span>
                            <span className="book-propti"><span className="book-proptie-p"> Published: </span>{result.publishedDate || 'Unknown Year'}</span>
                        </div>
                        <span className="book-descrption">{result.description || 'No description available'}</span> 
                    </div>
                  </li>))}
    <li className="no-hover show-more"> {showMoreElement} </li> </> )
    }    

    useEffect(() => {
        if(!lastElement.current) return;
        lastElement.current.scrollIntoView();
    })
    
    return (
        <div className="select-book-preset">
            <fieldset className="tutorial warning">
                <legend>Warning</legend>
                <p>Information might be inaccurate please check for accuracy and if necessary correct the information.</p>
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