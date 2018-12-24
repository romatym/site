'use strict';

console.log('111');

//const uploadNew = document.getElementsByClassName('menu__item mode new')[0];
const uploadError = document.querySelector('.error');
const img = document.querySelector('.current-image');

const url = new URL(location.href);
//const url = new URL('https://romatym.github.io/site?url=https://www.googleapis.com/download/storage/v1/b/neto-api.appspot.com/o/pic%2F91345230-0789-11e9-a1da-0b12842f971c%2F1.jpg?generation=1545662304148271&alt=media');

img.addEventListener('load', () => {
    img.addEventListener('click', imgClick);
    canvas.addEventListener('click', imgClick);    

    initDraw();
})
const imageLoader = document.getElementsByClassName('image-loader')[0];

var imageId;
var state; //0 = new = initial, 1 = share, 2 = comments, 3 = draw

const buttonNew = document.getElementsByClassName('menu__item new')[0];
buttonNew.addEventListener('click', onSelectFiles);

const buttonComments = document.getElementsByClassName('menu__item comments')[0];
buttonComments.addEventListener('click', event => {
    updateMenu('comments');
});
const buttonShare = document.getElementsByClassName('menu__item share')[0];
buttonShare.addEventListener('click', event => {
    updateMenu('share');
});
const buttonDraw = document.getElementsByClassName('menu__item draw')[0];
buttonDraw.addEventListener('click', event => {
    updateMenu('draw');
});
const buttonBurger = document.getElementsByClassName('menu__item burger')[0];
buttonBurger.addEventListener('click', event => {
    updateMenu('default');
});

console.log(window.location.search);
console.log(window.location.search.slice(0, 5));
console.log(window.location.search.slice(5));

if(window.location.search.slice(0, 5) === '?url=') {
    img.src = window.location.search.slice(5);
    state = 1;
    //updateMenu('comments');
}

function DOMContentLoaded(event) {

    document.querySelector('.comments-tools').addEventListener('click', event => {
        event.stopPropagation();
        const showMarkers = document.getElementById('comments-on').checked ? true : false;
        for (const commentForm of document.getElementsByClassName('comments__form')) {
            //changeVisible(marker, showMarkers);
            changeVisible(commentForm, showMarkers);
        }
    });

    const loadedImage = window.sessionStorage.getItem("loadedImage");
    if (loadedImage !== null) {
        getImg(loadedImage);
    } else  if(state === 1) {
        updateMenu('comments');
    } else {
        updateMenu('new');
    }
}

/////////////////обмен web-socket///////////////////////////////////

var connection;

function initWebSocket() {
    connection = new WebSocket('wss://neto-api.herokuapp.com/pic/' + imageId);

    connection.addEventListener('message', webSocketGetMessage);
    connection.addEventListener('error', onerror);
}
function sendCanvas() {
    var data = canvas.toDataURL('image/png');
    try {
        connection.send(data);
    } catch (err) {
        console.log(err);
    }
}
function throttle(callback, delay) {
    let isWaiting = false;
    return function () {
        if (!isWaiting) {
            callback.apply(this, arguments);
            isWaiting = true;
            setTimeout(() => {
                isWaiting = false;
            }, delay);
        }
    }
}
function webSocketGetMessage(event) {    
    if (event.data !== undefined) {

    } else {

    }
}
function onerror(event) {
    console.log(event.message);
}
////////////////////////////рисовать ///////////////////////////////////////////
var canvas = document.querySelector(".new_canvas");
var ctx = canvas.getContext("2d");
var __opacity = 1;
var paint = false;
var paintColor = '#6cbe47'; //green

for (const btnColor of document.querySelectorAll('.menu__color')) {
    btnColor.addEventListener('click', setColor);
}
function setColor(event) {

    if (event.target.value === 'red') {
        paintColor = '#ea5d56';
    } else if (event.target.value === 'yellow') {
        paintColor = '#f3d135';
    } else if (event.target.value === 'green') {
        paintColor = '#6cbe47';
    } else if (event.target.value === 'blue') {
        paintColor = '#53a7f5';
    } else if (event.target.value === 'purple') {
        paintColor = '#b36ade';
    }
}
function resizeCanvas() {
    canvas.style.top = (img.offsetTop - img.height / 2) + 'px';
    canvas.style.left = (img.offsetLeft - img.width / 2) + 'px';
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.position = "absolute"; //position: relative;
}
function initDraw() {

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas, false);
    canvas.addEventListener('dblclick', () => {
        sendCanvas();
        //clearCanvas();
    });

    // На любое движение мыши по canvas будет выполнятся эта функция
    canvas.addEventListener('mousemove', drawIfPressed);
    canvas.addEventListener('mousemove', throttle(() => {
        if (event.buttons === 1) {
            sendCanvas();
        }
    }, 2000));

    initWebSocket();
}
// function clearCanvas() {            
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
// }

function drawIfPressed(e) {
    if (!paint) {
        return;
    }

    var x = e.offsetX;
    var y = e.offsetY;
    var dx = e.movementX;
    var dy = e.movementY;

    if (e.buttons === 1) {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;        
        ctx.strokeStyle = paintColor;
        ctx.moveTo(x, y);
        ctx.lineTo(x - dx, y - dy);
        ctx.stroke();
        ctx.closePath();
    }
}

////////////////////////////поделиться ///////////////////////////////////////////

document.querySelector('.menu_copy').addEventListener('click', event => {
    navigator.clipboard.writeText(document.querySelector('.menu__url').value);
    event.preventDefault();
});

////////////////////////////комментарии //////////////////////////////////////////

var newCommentForm, commentForm, commentsInput;

function imgClick(event) {

    if (state !== 'comments') {
        return;
    }
    if (newCommentForm === undefined) {
        newCommentForm = createCommentForm();
        for (const comment of document.getElementsByClassName('comments__marker-checkbox')) {
            comment.checked = false;
        }
        newCommentForm.getElementsByClassName('comments__marker-checkbox')[0].checked = true;
    }
    //if (event.target !== newCommentForm) {        
        newCommentForm.style.left = event.pageX - 20 + 'px';
        newCommentForm.style.top = event.pageY + 'px';
    //}
    newCommentForm.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();

        if (newCommentForm.getElementsByClassName('comments__input')[0].value === '') {
            return;
        }
        if (event.target.classList.contains('comments__submit') && newCommentForm !== undefined) {
            if (newCommentForm.querySelector('.comments__input').value === '') {
                return;
            }
            commentForm = newCommentForm;
            deleteNewCommentForm();
            commentsSubmit(event.currentTarget);
        }
    });

    const fragment = document.createDocumentFragment();
    fragment.appendChild(newCommentForm);
    document.getElementsByTagName('body')[0].appendChild(fragment);
    newCommentForm.querySelector('.comments__marker-checkbox').addEventListener('click', rollUpComments);

}

function rollUpComments(event) {
    if (event.currentTarget.parentNode === newCommentForm) {
        event.stopPropagation();
        event.currentTarget.checked = true;
        return;
    }
    for (const comment of document.getElementsByClassName('comments__marker-checkbox')) {
        if (comment !== event.target) {
            //     event.target.checked = true;
            // } else {
            comment.checked = false;
        }
    }
    deleteNewCommentForm();
}

function deleteNewCommentForm() {
    if (newCommentForm !== undefined) {
        newCommentForm.parentNode.removeChild(newCommentForm);
        newCommentForm = undefined;
    }
}

function timeConverter(UNIX_timestamp) {
    if (UNIX_timestamp === '') {
        return '';
    }

    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}
function setComment(message, timestamp, left, top) {

    const commentsContainer = document.getElementsByTagName('body')[0];
    const fragment = document.createDocumentFragment();

    let findFormCheck = false;
    for (const oldForm of document.getElementsByClassName('comments__form')) {
        if (oldForm.style.left === (left + 'px') && oldForm.style.top === (top + 'px')) {
            findFormCheck = true;
            commentForm = oldForm;
            break;
        }
    }
    if (!findFormCheck) {
        commentForm = createCommentForm();
        commentForm.style.left = left + 'px';
        commentForm.style.top = top + 'px';
    }

    if (message !== '') {
        addCommentAtTheEnd(message, timestamp);
    }

    fragment.appendChild(commentForm);
    commentsContainer.appendChild(fragment);

    commentForm.addEventListener('click', commentOnClick);
    commentForm.getElementsByClassName('comments__marker-checkbox')[0].addEventListener('click', rollUpComments);

}

function addCommentAtTheEnd(message, timestamp) {
    commentsInput = commentForm.getElementsByClassName('comments__input')[0];
    const fragment = document.createDocumentFragment();
    const comment = createComment(message, timeConverter(timestamp));
    fragment.appendChild(comment);
    commentsInput.parentNode.insertBefore(fragment, commentsInput);
}

function commentOnClick(event) {
    event.stopPropagation();
    if (event.target.classList.contains('comments__submit')) {
        event.preventDefault();
        commentsSubmit(event.currentTarget);
    }
    if (event.target.classList.contains('comments__close')) {
        event.currentTarget.querySelector('.comments__marker-checkbox').checked = false;
    }
}

function commentsSubmit(commentForm) {

    commentsInput = commentForm.querySelector('.comments__input');
    if (commentsInput.value === '') {
        return;
    }

    addLoader();
    saveComment(commentsInput.value, parseInt(commentForm.style.left), parseInt(commentForm.style.top));
    commentsInput.value = '';
}

function createCommentForm(checkedValue = false) {

    return elem('form', {
        class: 'comments__form',
        style: 'z-index:10;'
    }, [
        elem('span', {
            class: 'comments__marker'
        }, ''),
        elem('input', {
            type: "checkbox",
            class: 'comments__marker-checkbox' // + checkedValue ? ':checked' : ''
            //checked //: checkedValue
        }, ''),
        elem('div', {
            class: 'comments__body'
        }, [
            //comment elements
            elem('textarea', {
                class: 'comments__input',
                type: 'text',
                placeholder: 'Добавить комментарий'
            }, ''),
            elem('input', {
                class: 'comments__close',
                type: 'button',
                value: 'Закрыть'
            }, ''),
            elem('input', {
                class: 'comments__submit',
                type: 'submit',
                value: "Отправить"
            }, '')
        ])
    ]);

    //  <form class="comments__form">
    //        <span class="comments__marker"></span>
    //        <input type="checkbox" class="comments__marker-checkbox">
    //        <div class="comments__body">
    //            <div class="comment">
    //                <p class="comment__time">28.02.18 19:09:33</p>
    //                <p class="comment__message">Здесь будет комментарий</p>
    //            </div>//
    //            <div class="comment">//
    //                <div class="loader">
    //                    <span></span>
    //                    <span></span>
    //                    <span></span>
    //                    <span></span>
    //                    <span></span>
    //                </div>//            
    //            </div>//          
    //            <textarea class="comments__input" type="text" placeholder="Напишите ответ..."></textarea>
    //            <input class="comments__close" type="button" value="Закрыть">
    //            <input class="comments__submit" type="submit" value="Отправить">//
    //        </div>//
    //  </form>

}

function createComment(comment, time) {

    return elem('div', {
        class: 'comment'
    }, [
        elem('p', {
            class: 'comment__time'
        }, time),
        elem('p', {
            type: "checkbox",
            class: 'comment__message'
        }, comment)
    ]);

    //    <div class="comment">
    //        <p class="comment__time">28.02.18 23:58:01</p>
    //        <p class="comment__message">А когда они будут?</p>
    //    </div>
}

function createLoader() {

    return elem('div', {
        class: 'comment'
    }, [
        elem('div', {
            class: 'loader'
        }, [
            elem('span', {}, ''),
            elem('span', {}, ''),
            elem('span', {}, ''),
            elem('span', {}, ''),
            elem('span', {}, '')
        ])
    ]);

    //<div class="comment">
    //    <div class="loader">
    //        <span></span>
    //        <span></span>
    //        <span></span>
    //        <span></span>
    //        <span></span>
    //    </div>//            
    //</div>
}

function addLoader() {
    //const commentsInput = commentForm.getElementsByClassName('comments__input')[0];
    const fragment = document.createDocumentFragment();
    const loader = createLoader();
    fragment.appendChild(loader);
    commentsInput.parentNode.insertBefore(fragment, commentsInput);
}

function removeLoader() {
    //const comments = commentForm.getElementsByClassName('loader');    
    [].forEach.call(commentForm.querySelectorAll('.comment'), function (e) {
        e.parentNode.removeChild(e);
    });
}

function elem(tagName, attributes, children) {
    const element = document.createElement(tagName);
    if (typeof attributes === 'object') {
        Object.keys(attributes).forEach(i => element.setAttribute(i, attributes[i]));
    }
    if (typeof children === 'string') {
        element.textContent = children; //.split('\n').join('<br>');
    } else if (children instanceof Array) {
        children.forEach(child => element.appendChild(child));
    }
    return element;
}

////////////////////////////кнопки меню///////////////////////////////////////////
const menu = document.querySelector('.menu');
// menu.addEventListener('click', event => {
//     if (state === 'comments') {
//         event.stopPropagation();
//     }
// });

const menuDrag = document.querySelector('.menu__item.drag');
menuDrag.addEventListener('mousedown', startDrag);

function startDrag(event) {
    if(!event.target.classList.contains('drag')) {
        return;
    }
    let newCoordX, newCoordY;

    menu.style.position = 'absolute';
    moveAt(event);
    document.body.appendChild(menu);

    menu.style.zIndex = 15;
    
    function moveAt(event) {
        newCoordX = event.pageX - menuDrag.clientWidth / 2;
        newCoordY = event.pageY - menuDrag.clientHeight / 2;
        if(newCoordX > 0 
            && newCoordY > 0 
            && newCoordX < (wrap.clientWidth - menu.clientWidth) 
            && newCoordY < (wrap.clientHeight - menu.clientHeight)) {
            menu.style.left = newCoordX + 'px';
            menu.style.top = newCoordY + 'px';
        }
    }    
    function removeSub()  {
        document.removeEventListener('mousemove', moveAt);
        menuDrag.removeEventListener('mouseup', removeSub);
    }
    document.addEventListener('mousemove', moveAt);
    menuDrag.addEventListener('mouseup', removeSub);

}
//menuDrag.ondragstart = function() {
    //return false;
//};

function updateMenu(newState) {
    if (newState === 'default') {
        state = 'default';
        changeVisible(buttonBurger, false);
    } else if (newState === 'new') {
        state = newState;
        changeVisible(buttonBurger, false);
    } else {
        state = newState;
        changeVisible(buttonBurger, true);
    }

    const menuItems = document.getElementsByClassName('menu__item');
    for (const item of menuItems) {
        if (item.classList.contains('drag')) {
            continue; //always visible
        }
        if (item.classList.contains('burger')) {
            continue;
        }
        item.dataset.state = '';
        changeVisible(item, item.classList.contains(state) || item.classList.contains(state + '-tools') || newState === 'default');
    }

    paint = false;
    deleteNewCommentForm();

    if (state === 'share') {
        buttonShare.dataset.state = 'selected';
    } else if (state === 'draw') {
        buttonDraw.dataset.state = 'selected';
        paint = true;
    } else if (state === 'comments') {
        buttonComments.dataset.state = 'selected';
    } else if (state === 'new') {
        buttonNew.dataset.state = 'selected';
    }
}

function changeVisible(item, visible) {
    if (visible) {
        item.classList.remove('hidden');
    } else {
        item.classList.add('hidden');
    }
}

///////////////////////////открытие файла/////////////////////////////////////////

let inputFile;
inputFile = document.createElement('input');
inputFile.type = 'file';
inputFile.addEventListener('change', onSelectFilesInput);

document.addEventListener('DOMContentLoaded', DOMContentLoaded);

const wrap = document.getElementsByClassName('wrap app')[0];
wrap.addEventListener('drop', onFilesDrop);
wrap.addEventListener('dragover', event => event.preventDefault());

function onFilesDrop(event) {
    event.preventDefault();
    if (state === 'new') {
        showImageLoader();
        setImage(Array.from(event.dataTransfer.files));
    } else {
        uploadError.removeAttribute('style', 'display: none;');
        document.getElementsByClassName('error__message')[0].innerText = 'Чтобы загрузить новое изображение, воспользуйтесь пунктом "Загрузить новое" в меню.';
    }
}

function onSelectFiles(event) {
    event.preventDefault();
    inputFile.click();
}

function onSelectFilesInput(event) {
    showImageLoader();
    setImage(Array.from(event.target.files));
}

function showImageLoader() {
    uploadError.setAttribute('style', 'display: none;');
    img.src = '';
    imageLoader.removeAttribute('style', 'display: none;');
}

function setImage(files) {
    const imageTypeRegExp = /\/(jpe?g|png)$/i;

    files.forEach(file => {
        if (imageTypeRegExp.test(file.type)) {
            //img.src = window.URL.createObjectURL(file);

            saveImg(file.name, file);

            img.addEventListener('load', event => {
                //window.URL.revokeObjectURL(event.target.src);
                imageLoader.setAttribute('style', 'display: none;');
                updateMenu('share');
            });
        } else {
            uploadError.removeAttribute('style', 'display: none;');
            imageLoader.setAttribute('style', 'display: none;');
            updateMenu('new');
        }
    });
}

/////////////////обмен XMLHttpRequest///////////////////////////////////

function getImg(imgId) {
    const request = new XMLHttpRequest();
    request.addEventListener("load", onLoadImage);
    request.open('GET', 'https://neto-api.herokuapp.com/pic/' + imgId, true);
    request.send();
}

function saveImg(title, image) {

    var formData = new FormData();
    formData.append('title', title);
    formData.append('image', image);
    // отослать
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', onSaveImage);
    xhr.open('POST', 'https://neto-api.herokuapp.com/pic', true);
    xhr.send(formData);
}

function onLoadImage() {
    if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        img.src = response.url;
        imageId = response.id;

        //initDraw();

        document.querySelector('.menu__url').value = location.origin + location.pathname + '\?url=' +  response.url;
        commentForm === undefined;
        updateComments(response);
        updateMenu('share');
    } else {
        updateMenu('new');
    }
}

function onSaveImage() {
    if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        img.src = response.url;
        imageId = response.id;
        document.querySelector('.menu__url').value = location.origin + location.pathname + '\?url=' +  response.url;

        window.sessionStorage.setItem('loadedImage', response.id);
    }
}

/////////////////сохранить коммент /////////////////////////////////

function saveComment(message, left, top) {

    var xhr = new XMLHttpRequest();

    var body = 'message=' + encodeURIComponent(message) +
        '&left=' + encodeURIComponent(left) +
        '&top=' + encodeURIComponent(top);

    xhr.addEventListener('load', onSaveComment);
    xhr.open('POST', 'https://neto-api.herokuapp.com/pic/' + imageId + '/comments', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(body);
}

function onSaveComment() {
    if (this.status === 200) {
        const response = JSON.parse(this.responseText);
        removeLoader();
        commentForm = undefined;
        updateComments(response);
    }
}

function updateComments(response) {
    if (response.comments === undefined) {
        return;
    }

    //delete old comments
    [].forEach.call(document.querySelectorAll('.comment'), function (e) {
        e.parentNode.removeChild(e);
    });


    for (const comment of Object.keys(response.comments)) {
        const objComment = response.comments[comment];
        setComment(objComment.message, objComment.timestamp, objComment.left, objComment.top);
    }
}
