/* global $ */
'use strict';

const api = (function(){
  const BASE_URL = 'https://thinkful-list-api.herokuapp.com/cameron';

  const getBookmarks = function(callback){
    $.getJSON(`${BASE_URL}/bookmarks`, callback);
  };

  const createBookmark = function(data, success, error){
    const newBookmark = JSON.stringify(data);
    $.ajax({
      url: `${BASE_URL}/bookmarks`,
      method: 'POST',
      contentType: 'application/json',
      data: newBookmark,
      success,
      error
    });
  };

  const deleteBookmark = function(id, success, error){
    $.ajax({
      url: `${BASE_URL}/bookmarks/${id}`,
      method: 'DELETE',
      success,
      error
    });
  };
  return {
    getBookmarks,
    createBookmark,
    deleteBookmark
  };
})();

