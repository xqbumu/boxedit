boxedit
=======

A web-based editor for Tesseract `box` files.

A `box` file contains lines with individual characters and their bounding boxes:

```
t 700 1000 750 1050 0
h 750 1000 800 1050 0
e 800 1000 850 1050 0
```

If you want to train Google's Tesseract OCR tool, you'll need to work with `box` files.

When run in "training mode", Tesseract outputs `box` data rather than plain
letters. You correct the errors in these `box` files and feed them back into
Tesseract. boxedit helps you do that.

![](/screenshots/screenshot.png "boxedit in action")

##### Usage
=======
**[Try a Live Demo!](http://www.danvk.org/boxedit/)**

Usage:

  1. Open `index.html` in your favorite browser.
  2. Drag a `.box` file and a corresponding image file onto the page. You can
     drag both at the same time or drag them one by one: ![](/screenshots/drag-and-drop.png "Dragging a box file and an image file")

  3. Fix errors by:
    1. Editing the raw box data in the text box on the left. The boxes will
       update on the right. This is handy for deleting boxes or scootching them
       around.
    2. Clicking a box in the image to select it and typing a letter. This will
       change the corresponding box data and advance the selection, allowing
       you to type the text that you see.
    3. Clicking a box and using the "split" menu to fix merged characters.


### Local Development

To get going, run:

    git clone https://github.com/danvk/boxedit.git
    cd boxedit
    npm install
    python -m SimpleHTTPServer

and then open localhost:8000 in your browser of choice. You'll have a standard
edit/save/reload iteration cycle.


#### Demo

To update the demo:

```
mkdir demo
jsx --harmony box.js > demo/box.js
jsx --harmony index.js > demo/index.js
cp style.css demo/
cp index.html demo/
cp index.html demo/demo.html
cp node_modules/react/dist/react-with-addons.min.js demo/

rm -rf ../danvk.github.io/boxedit
cp -r demo ../danvk.github.io/boxedit
```

Then modify `demo.html` to set 'demo mode' (second param to render).
