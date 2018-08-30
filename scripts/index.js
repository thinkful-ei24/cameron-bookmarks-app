/* global $, bookmarkList, store, api */
'use strict';

const main = function(){
  api.getBookmarks(bookmarks => {
    bookmarks.forEach(item => store.addBookmark(item));
    bookmarkList.render();
  });
  bookmarkList.bindEventListeners();
};

$(main);