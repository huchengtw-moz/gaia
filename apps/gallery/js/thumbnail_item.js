/**
 * ThumbnailItem is view object for a single gallery item data. It renders file
 * in listitem object.
 *
 * CONSTRUCTOR:
 *   To create a ThumbnailItem objet requires the following argument:
 *      fileData: the file data object from mediadb.
 *
 * Properties:
 *   htmlNode: the HTML DOM node for this thumbnail item. It is rendered at the
 *             creation of object.
 *   data: the file data object bound with this thumbnail item.
 */
function ThumbnailItem(fileData) {
  if (!fileData) {
    throw new Error('fileData should not be null or undefined.');
  }
  this.data = fileData;

  this.htmlNode = document.createElement('li');
  this.htmlNode.classList.add('thumbnail');
  this.htmlNode.dataset.filename = fileData.name;
}

ThumbnailItem.prototype.showThumbnail = function(shown) {
  if (shown) {
    // create url and put on screen
    this.url = URL.createObjectURL(this.data.metadata.thumbnail);
    this.htmlNode.style.backgroundImage = 'url("' + this.url + '")';
  } else if (this.url) {
    // revoke url and clear background
    URL.revokeObjectURL(this.url);
    this.url = null;
    this.htmlNode.style.backgroundImage = null;
  }
};
