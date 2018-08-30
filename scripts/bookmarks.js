/* global $, store, api */
'use strict';
// allows us to get all of our form data into one object
$.fn.extend({
  serializeJson: function(){
    const formData = new FormData(this[0]);
    const o = {};
    formData.forEach((val, name) => o[name] = val);
    return o;
  }
});

const bookmarkList = (function(){
  const generateBookmarkElement = function(bookmark){
    if (bookmark.expanded){
      return `
      <div class="bookmark-div" data-item-id = ${bookmark.id}>
      <div class="bookmark-title">
        ${bookmark.title}
      </div>
      <div class = "bookmark-expanded">
        <div>
         <p>${bookmark.desc}</p> 
         <a href=${bookmark.url} target="blank"><button>Visit Site</button></a>
         <div class = "bookmark-collapse">
            Rating: ${bookmark.rating}
          </div>
        </div>
      </div>
    </div> `;
    } else {
      return `
      <div class="bookmark-div" data-item-id = ${bookmark.id}>
    <div class="bookmark-title">
      ${bookmark.title}
      <button class="delete-button"><i class="far fa-edit"></i></button>       
      <button class="delete-button"><i class="fa fa-trash"></i></button>
    </div>
    <div class = "bookmark-collapse">
      Rating: ${bookmark.rating}
    </div>
  </div> `;
      
    }
  };

  const generateBookmarkString = function(array){
    const bookmarks = array.map(generateBookmarkElement);
    return bookmarks.join('');
  };

  const render = function(){
    let bookmarks = store.bookmarks;

    // filters on minimum rating
    if (store.minRating){
      bookmarks = bookmarks.filter(item => item.rating >= store.minRating);
    }

    // prints error message, if any, otherwise clears error message from DOM
    if (store.error){
      $('.error-message').html(store.error);
    } else {
      $('.error-message').html('');
    }

    // adds new bookmark form if add bookmark was clicked
    if (store.adding){
      const newBookmarkForm = `
      <form id="add-new-bookmark">
      <h2>Create Bookmark</h2>
      <label for="bookmark-title"></label>
      <input type="text" name="title" id="bookmark-title" placeholder="Title">
      <label for="bookmark-url"></label>
      <input type="text" name="url" id="bookmark-url" placeholder="url">
      <label for="bookmark-description"></label>
      <input type="text" name="desc" id="bookmark-description" placeholder="Description"><br>
      <label for="bookmark-rating">Rating:</label><br>
      <input type="radio" name="rating" value=5 checked>5 Stars<br>
      <input type="radio" name="rating" value=4>4 Stars<br>
      <input type="radio" name="rating" value=3>3 Stars<br>
      <input type="radio" name="rating" value=2>2 Stars<br>
      <input type="radio" name="rating" value=1>1 Star<br>
      <button type="submit" class="submit-form">Submit</button>
    </form>`;
      $('.add-new-bookmark').html(newBookmarkForm);
    } else {
      $('.add-new-bookmark').html('');
    }

    // creates html for list of bookmarks
    const bookmarkHtml = generateBookmarkString(store.bookmarks);
    $('.bookmark-div').html(bookmarkHtml);

  };

  const getBookmarkIdFromElement = function(bookmark){
    return $(bookmark)
      .closest('.bookmark-div')
      .data('item-id');
  };

  const handleAddClicked = function(){
    $('#adding-bookmark').click(function(event){
      event.preventDefault();
      store.adding = true;
      render();
    });
  };

  const handleNewBookmarkSubmit = function(){
    $('.add-new-bookmark').on('click', '.submit-form', function(event){
      event.preventDefault();
      const data = $('#add-new-bookmark').serializeJson();
      const success = function(response){
        store.addBookmark(response);
        store.error = null;
        store.adding = false;
        render();
        console.log(store);
      };
      api.createBookmark(data, success, success);

    });
  };

  const bindEventListeners = function(){
    handleAddClicked();
    handleNewBookmarkSubmit();
  };


  return {
    bindEventListeners,
    render
  };
})();