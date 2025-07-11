
function updateSearchbarEvents(col) {
  const inputBox = col.querySelector(".input-box");
  inputBox.onkeyup = () => {
    if(inputBox.value == "") {
      console.log('lul');
      col.querySelector(".result-box").innerHTML = "";
      return;
    }
    search(col, 3); 
  } 

  const searchButton = col.querySelector(".search-button");
  searchButton.addEventListener("click", () => search(col, 3));
};

let abortController = new AbortController();

function search(col, results) {
  const inputBox = col.querySelector(".input-box");
  let input = inputBox.value;
  if (input.length) {

    abortController.abort();
    abortController = new AbortController();

    fetchJsonPath(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&maxResults=${results}`, 'items')
    .then((items) => {
      if(!items) {
        display(col, []);
        return;
      }
      const ids = items.slice(0, results).map(doc => doc.id);
      const titles = items.slice(0, results).map(doc => doc.volumeInfo.title);
      const covers = items.slice(0, results).map(doc => doc.volumeInfo.imageLinks ? doc.volumeInfo.imageLinks.thumbnail : 'pics/covers/small-defaultcover.jpg');
      const authors = items.slice(0, results).map(doc => doc.volumeInfo.authors ? doc.volumeInfo.authors.join(', ') : 'Unknown Author');
      const years = items.slice(0, results).map(doc => doc.volumeInfo.publishedDate || 'Unknown Year');
      const pages = items.slice(0, results).map(doc => doc.volumeInfo.pageCount || 'Unknown Pages');
      const descrption = items.slice(0, results).map(doc => doc.volumeInfo.description || 'No description available');
      
      display(col, titles, covers, authors, years, ids, pages, descrption);
    })
    .catch((error) => console.error('Error:', error));
  }
}

async function display(col, titles, covers, authors, years, keys, pages, descriptions) {
  const maxWords = 50; 
  const resultsBox = col.querySelector(".result-box");
  if(titles.length === 0) {
    resultsBox.innerHTML = '<ul><li class="no-hover">-No results found-</li></ul>';
    return;
  }  
  const content = await Promise.all(titles.map(async (title, index) => {
    var t = descriptions[index];  
    const description = t.trim().split(" ").length > maxWords ? t.trim().split(" ").slice(0, maxWords).join(" ") + "..." : t.trim();
        return `<li data-bookId="${keys[index]}" data-title="${title}" data-author="${authors[index]}" data-pages="${pages[index]}" data-description="${description}">
                  <img src="${covers[index]}" alt="cover"/> 
                    <div>
                        <span class="book-title">${title}<span class="book-proptie-p"></span></span>
                        
                        <span class="book-properties">
                            <span><span class="book-proptie-p">by</span> ${authors[index]}</span>
                            <span><span class="book-proptie-p"> &#8231; Pages: </span> ${pages[index]}</span>
                            <span><span class="book-proptie-p"> &#8231; Published: </span> ${years[index]}</span>
                        </span>
                        <span class="book-descrption">${description}</span> 
                    </div>
                  </li>`;
    }));

    var addition = '';
    if (titles.length >= 3) {
        addition = ` <li class="no-hover show-more" data-results="${titles.length+3}"> <a herf="#">See more results</a> </li> `;
    }
    console.log('Well')
    resultsBox.innerHTML = "<ul>" + content.join('') + addition + "</ul>";
    updateResultBoxEvents(col);
}

function showMore(col, results) {
  const button = document.querySelector('.show-more');
  button.innerHTML = "Please wait...";
  search(col, results);
}

async function fetchJsonPath(url, path) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const result = path.split('.').reduce((acc, key) => acc && acc[key], data);
      return result;
  } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
  }
}
  

