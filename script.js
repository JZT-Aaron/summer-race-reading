var areCloseButtonsHidden = false;
var isAddFriendHidden = false;

var friendColsAmount = 0;

const maxFriend = 10;

var addFriendDiv = document.querySelector('.add-friend');


// -- Load Friend Cols

const t0 = addFriendCol(0);
const t1 = addFriendCol(1);
displayCloseButtonsAfter(false, t0, t1);

document.querySelectorAll('.col.friend').forEach(col => {
    updateEvents(col);
});

function updateEvents(col) {
    updateBookPresetSelectorEvents(col);
    updateSearchbarEvents(col);
    col.querySelectorAll("textarea:not(.scroll)").forEach(ta => { ta.addEventListener("input", () => updateTextAreaRows(ta))});
    col.querySelector('.close').onclick = () => removeFriendCol(col);
    col.querySelectorAll('textarea:not(.book-descrption)').forEach(ta => ta.addEventListener("keydown", function(e) {
        if(e.key === 'Enter') e.preventDefault();
    }));
    
}

function updateTextAreaRows(ta) {
    ta.style.height = "auto";           
    ta.style.height = ta.scrollHeight + "px";
}

function hoverRadio(choice, element) {
    if(choice.checked) return;
    element.classList.add('hover');
}

function hoverOutRadio(element) {
    element.classList.remove('hover');
}

document.querySelectorAll(".select-custom-book-preset textarea:not(.scroll)").forEach(ta => { 
    updateTextAreaRows(ta); 
});

function updateBookPresetSelectorEvents(col) {
    var bookPresetChoice = col.querySelector(".book-preset-radio");
    var bookCustomPresetChoice = col.querySelector(".book-custom-radio");
    col.querySelectorAll(".book-preset span").forEach(span => {
        var choice = span.closest('label').querySelector('input');
        span.onpointerover = () => hoverRadio(choice, span);
        span.onpointerout = () => hoverOutRadio(span);
    });

    bookCustomPresetChoice.onchange = () => updateBookPresetSelector(col);
    bookPresetChoice.onchange = () => updateBookPresetSelector(col);
    updateBookPresetSelector(col);
}

// -- Add-Friend Button Events

var addFriend = document.querySelector('.col.add-friend i');
addFriend.onpointerover = function() {
    addFriend.classList.remove("fa-regular");
    addFriend.classList.add("fa-solid");
}

addFriend.onpointerout = function() {
    addFriend.classList.remove("fa-solid");
    addFriend.classList.add("fa-regular");
}

addFriend.onclick = function() {
    addFriendCol(friendColsAmount);
}

function displayAddFriend(bool) {
    const parent = document.querySelector('.setup-friends');
    
    
    if(!bool && !isAddFriendHidden) parent.removeChild(addFriendDiv);
    if(bool && isAddFriendHidden) {
        addFriendDiv.querySelector('button i').classList.remove("fa-solid");
        addFriendDiv.querySelector('button i').classList.add('fa-regular');
        parent.appendChild(addFriendDiv);
    } 

    isAddFriendHidden = !bool;
    
}

async function displayCloseButtonsAfter(bool, ...tasks) {
    await Promise.all(tasks);
    displayCloseButtons(bool);
}

function displayCloseButtons(bool) {
    areCloseButtonsHidden = !bool;
    document.querySelectorAll('.close').forEach(button => {
        button.hidden = !bool;
    });
}

async function getRandomName() {
    const res = await fetch("names.json");
    const json = await res.json();

    const names = json.names;
    var nameIndex = Math.floor(Math.random() * names.length);
    var name = names[nameIndex];

    return name;
}

async function getDefaultFriendCol() {
    try {
        const res = await fetch("col.html");
        const html = await res.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const externalDiv = doc.getElementById("friend-d");
        return externalDiv;
    } catch (err) {
        console.error(err);
    }
    
}


async function addFriendCol(number) {
    if(friendColsAmount >= maxFriend) return;
    var html = await getDefaultFriendCol()
    var friendCol = html.innerHTML;
    var newFriendCol = document.createElement('div');
    newFriendCol.classList.add('col');
    newFriendCol.classList.add('friend');
    newFriendCol.dataset.color = getRandomHexColor();
    newFriendCol.id = 'friend-' + number;
    newFriendCol.innerHTML = friendCol;

    newFriendCol.querySelectorAll('.book-preset input').forEach(input => {input.name = 'book' + number;});
    var name = await getRandomName();
    newFriendCol.querySelector('input').value = name;

    var addFriend = document.querySelector('.col.add-friend');
    addFriend.parentNode.insertBefore(newFriendCol, addFriend);
    updateEvents(newFriendCol);

    friendColsAmount++;
    if(friendColsAmount >=maxFriend) displayAddFriend(false);
    if(areCloseButtonsHidden && (friendColsAmount > 2)) displayCloseButtons(true);
}

function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function removeFriendCol(col) {
    friendColsAmount--;
    if(!areCloseButtonsHidden && friendColsAmount <= 2) displayCloseButtons(false);
    if(friendColsAmount <=maxFriend && isAddFriendHidden) displayAddFriend(true);
    document.getElementById('setup-friends').removeChild(col);
    document.querySelectorAll(".col.friend").forEach((col, index) => {
        col.id = 'friend-' + index; 
    });
}
    
function updateResultBoxEvents(col) {
    col.querySelectorAll(".result-box li").forEach(resultBoxResult => { 
        if(resultBoxResult.classList.contains("no-hover")) if(resultBoxResult.classList.contains("show-more")) {
            resultBoxResult.onclick = () => showMore(col, resultBoxResult.dataset.results);
            return;
        } else return;
        resultBoxResult.onclick = () => selectBookinResultBox(resultBoxResult); 
    });
}

function updateBookPresetSelector(col) {
    var bookPresetChoice = col.querySelector(".book-preset-radio");
    var bookCustomPresetChoice = col.querySelector(".book-custom-radio");

    var bookPresetContainer = col.querySelector(".select-book-preset");
    var bookCustomPresetContainer = col.querySelector(".select-custom-book-preset");

    bookCustomPresetContainer.hidden = !bookCustomPresetChoice.checked;
    bookPresetContainer.hidden = !bookPresetChoice.checked;
}

async function selectBookinResultBox(element) {
    var col = element.closest(".col.friend");
        
    var bookCustomPresetChoice = col.querySelector(".book-custom-radio");
    var bookId = element.dataset.bookid;
        
    var cover = await getBiggestCoverImage(bookId);

    console.log("Selected book ID:", element);

    var description = element.dataset.description
    if(description == 'No description available') description = "";

    col.querySelector(".book-title .book-title-i").value = element.dataset.title;
    col.querySelector(".book-properties .book-author").value = element.dataset.author;
    col.querySelector(".book-properties .book-pages").value = element.dataset.pages;
    col.querySelector(".book-properties .book-descrption").value = description;
    if(cover) col.querySelector(".book-cover-img").src = cover;

    bookCustomPresetChoice.checked = true;
    updateBookPresetSelector(col);

    col.querySelectorAll(".select-custom-book-preset textarea").forEach(ta => { 
        updateTextAreaRows(ta); 
    });   
}   
    
    async function getBiggestCoverImage(bookID) {
        pic = null
        var index = 4;
        while (index > -1 && !pic) {
            pic = await getCoverImage(bookID, index);
            index--;
        }
        return pic;
    }

    async function getCoverImage(bookID, size) {
        var pic = "";
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
        var cover = await fetchJsonPath(`https://www.googleapis.com/books/v1/volumes/${bookID}?fields=id,volumeInfo(title,imageLinks)`, `volumeInfo.imageLinks.${pic}`);
        if(cover) cover = cover.replace("http:", "https:");
        return cover;
    }



    




