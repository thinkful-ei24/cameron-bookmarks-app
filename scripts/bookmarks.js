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

  const generateRating = function(rating){
    const ratingArray = Array(5).fill('<i class="fa fa-star-o"></i>');
    for (let i=0; i<rating; i++){
      ratingArray[i]='<i class="fa fa-star"></i>';
    }
    return ratingArray.join('');
  };

  const generateBookmarkElement = function(bookmark){
    if (bookmark.expanded){
      return `
      <div class="bookmark-div" data-item-id = ${bookmark.id}>
      <div class="bookmark-title">
        ${bookmark.title}
        <button class="delete-button" aria-label="click to delete bookmark"><i class="fa fa-trash"></i></button>
        <button class="edit-button" aria-label="click to edit bookmark"><i class="fa fa-pencil"></i></button>       
      </div>
      <div class="bookmark-expanded">
         <p class="description">${bookmark.desc}</p> 
         <a href=${bookmark.url} target="blank"><button class="visit-site">Visit Site</button></a>
         <div class="rating">
            Rating: ${generateRating(bookmark.rating)}
          </div>
        </div>  
    </div> `;
    } else if(bookmark.editing){
      return `
      <div class="bookmark-div" data-item-id = ${bookmark.id}>
        <div class="bookmark-title">
          ${bookmark.title}
        </div>
        <div class = "bookmark-editing">
          <form id="form-for-editing" aria-label="Form to Edit Bookmark">
            <label for="BM-description">Description:</label>
            <input type="text" name="desc" id="BM-description" value="${bookmark.desc}"><br>
            <label for="BM-rating">Rating:<br>
            <input type="radio" name="rating" id="five-star" value=5><label for="five-star">5 Stars</label><br>
            <input type="radio" name="rating" id="four-star" value=4><label for="four-star">4 Stars</label><br>
            <input type="radio" name="rating" id="three-star" value=3><label for="three-star">3 Stars</label><br>
            <input type="radio" name="rating" id="two-star" value=2><label for="two-star">2 Stars</label><br>
            <input type="radio" name="rating" id="one-star" value=1><label for="one-star">1 Star </label><br>
            </label>
            <button type="submit" class="submit-form">Submit</button>
          </form>
        </div>
      </div>  `;
    }else {
      return `
      <div class="bookmark-div" data-item-id = ${bookmark.id}>
    <div class="bookmark-title">
      ${bookmark.title}
      <button class="delete-button" aria-label="click to delete bookmark"><i class="fa fa-trash"></i></button>
      <button class="edit-button" aria-label="click to edit bookmark"><i class="fa fa-pencil"></i></button>       
    </div>
    <div class = "bookmark-collapsed">
      <div class="rating">
        Rating: ${generateRating(bookmark.rating)}
      </div>
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
      $('.error-message').html(`<p class="error-text">${store.error}</p>`);
    } else {
      $('.error-message').html('');
    }

    // adds new bookmark form if add bookmark was clicked
    if (store.adding){
      const newBookmarkForm = `
      <form id="add-new-bookmark-form">
      <h2>Create Bookmark</h2>
      <label for="bookmark-title">Title:</label>
      <input type="text" name="title" id="bookmark-title" placeholder="Google"><br>
      <label for="bookmark-url">URL:</label>
      <input type="text" name="url" id="bookmark-url" placeholder="https://www.google.com/"><br>
      <label for="bookmark-description">Description:</label>
      <input type="text" name="desc" id="bookmark-description" placeholder="Great search website"><br>
      <label for="bookmark-rating">Rating:</label><br>
      <input type="radio" name="rating" id="five-star" value=5 checked><label for="five-star">5 Stars</label><br>
      <input type="radio" name="rating" id="four-star" value=4><label for="four-star">4 Stars</label><br>
      <input type="radio" name="rating" id="three-star" value=3><label for="three-star">3 Stars</label><br>
      <input type="radio" name="rating" id="two-star" value=2><label for="two-star">2 Stars</label><br>
      <input type="radio" name="rating" id="one-star" value=1><label for="one-star">1 Star </label><br>
      <button type="submit" class="submit-form">Submit</button>
      <button class="cancel-new-bookmark">Cancel</button>
    </form>`;
      $('.add-new-bookmark-form').html(newBookmarkForm);
    } else {
      $('.add-new-bookmark-form').html('');
    }

    // creates html for list of bookmarks
    const bookmarkHtml = generateBookmarkString(bookmarks);
    $('.outer-bookmark-div').html(bookmarkHtml);

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

  const error = function(response){
    store.error = response.responseJSON.message;
    render();
  };

  const handleNewBookmarkSubmit = function(){
    $('.add-new-bookmark-form').on('click', '.submit-form', function(event){
      event.preventDefault();
      const data = $('#add-new-bookmark-form').serializeJson();
      const success = function(response){
        store.addBookmark(response);
        store.error = null;
        store.adding = false;
        render();
      };
      api.createBookmark(data, success, error);

    });
  };

  const handleCancelNewBookmark = function(){
    $('.add-new-bookmark-form').on('click', '.cancel-new-bookmark', function(event){
      event.preventDefault();
      store.error = null;
      store.adding = false;
      render();
    });
  };

  const handleDeleteBookmarkClicked = function(){
    $('.outer-bookmark-div').on('click', '.delete-button', function(event){
      const id = getBookmarkIdFromElement(event.target);
      event.stopPropagation();
      const success = function(){
        store.findAndDelete(id);
        store.error = null;
        render();
      };
      api.deleteBookmark(id, success, error);
    });
  };

  const handleExpandBookmarkClicked = function(){
    $('.outer-bookmark-div').on('click', '.bookmark-title', function(){
      const id = getBookmarkIdFromElement(event.target);
      // expands/collapses when clicked unless editing, then collapses
      if (!store.findById(id).editing){
        store.findById(id).expanded = !store.findById(id).expanded;
      } else {
        store.findById(id).expanded = false;
        store.findById(id).editing = false;
      }  
      render();
    });
  };

  const handleMinRating = function(){
    $('#choose-rating').on('change', function(event){
      const rating = $('#choose-rating').val();
      store.setMinRating(rating);
      render();
    });
  };

  const handleEditBookmarkClicked = function(){
    $('.outer-bookmark-div').on('click', '.edit-button', function(event){
      event.stopPropagation();
      const id = getBookmarkIdFromElement(event.target);
      store.findById(id).expanded = false;
      store.findById(id).editing = true;
      render();
    });
  };

  const handleSubmitEditBookmark = function(){
    $('.outer-bookmark-div').on('click', '.submit-form', function(event){
      event.preventDefault();
      const id = getBookmarkIdFromElement(event.target);
      const data = $('#form-for-editing').serializeJson();
      const success = function(){
        store.findAndUpdate(id, data);
        store.findById(id).editing = false;
        store.error = null;
        render();
      };
      api.editBookmark(id, data, success, error);
    });
  };

  const bindEventListeners = function(){
    handleAddClicked();
    handleNewBookmarkSubmit();
    handleDeleteBookmarkClicked();
    handleExpandBookmarkClicked();
    handleEditBookmarkClicked();
    handleMinRating();
    handleSubmitEditBookmark();
    handleCancelNewBookmark();
  };


  return {
    bindEventListeners,
    render
  };
})();
