/* global $ */
'use strict';

const store = (function(){
  const addBookmark = function(data){
    let bookmark =  {
      editing: false,
      expanded: false
    };
    Object.assign(bookmark, data);
    this.bookmarks.push(bookmark);
  };

  const findById = function(id){
    return this.bookmarks.find(mark => mark.id === id);
  };

  const findAndDelete = function(id){
    this.bookmarks = this.bookmarks.filter(item => item.id !== id);
  };
  
  const setMinRating = function(rating){
    this.minRating = rating;
  };

  const toggleAdding = function(){
    this.adding = !this.adding;
  };

  return {
    bookmarks: [],
    adding: false,
    minRating: null,
    addBookmark,
    findById,
    findAndDelete,
    setMinRating,
    toggleAdding
  };

})();

