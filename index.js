function render(el, isDemo) {
  var props = {};
  if (isDemo) {
    props.initialBoxData = boxData();
    // make sure the image is cached
    var im = new Image();
    im.onload = function() {
      props.initialImageUri = '700045bu.jpg';
      props.initialImageHeight = im.height;
      var component = <Root {...props} />;
      React.render(component, el);
    };
    im.src = '700045bu.jpg';
  } else {
    var component = <Root />;
    return React.render(component, el);
  }
}

var Root = React.createClass({
  /*
  stateTypes: {
    imageDataUri: React.PropTypes.string,
    boxData: React.PropTypes.string,
    imageHeight: React.PropTypes.number,
    lettersVisible: React.PropTypes.bool,
    selectedBoxIndex: React.PropTypes.number
  },
  */
  getInitialState: function() {
    return {
      boxData: this.props.initialBoxData || '',
      // 1x1 transparent gif
      imageDataUri: this.props.initialImageUri || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      imageHeight: this.props.initialImageHeight || null,
      lettersVisible: true,
      actionType: true,
      selectedBox: null
    }
  },
  handleImage: function(imageDataUri) {
    var im = new Image();
    im.onload = () => {
      // image height is only available in onload in FF/Safari
      console.log(im.height);
      this.setState({
        imageDataUri,
        imageHeight: im.height
      });
    };
    im.src = imageDataUri;
  },
  handleBox: function(boxData) {
    this.setState({boxData});
  },
  handleLettersVisibleChanged: function(visible) {
    this.setState({lettersVisible: visible});
  },
  handleActionTypeChanged: function(result) {
    this.setState({actionType: result});
  },
  handleChangeSelection: function(selectedBoxIndex) {
    this.setState({selectedBoxIndex});
  },
  handleChangeLetter: function(lineIndex, newLetter) {
    this.setState({
      boxData: changeLetter(this.state.boxData, lineIndex, newLetter),
      selectedBoxIndex: lineIndex + 1
    });
  },
  handleChangeItem: function(lineIndex, value) {
    this.setState({
      boxData: changeItem(this.state.boxData, lineIndex, this.state.actionType, value),
      selectedBoxIndex: lineIndex
    });
  },
  handleSplit: function(numWays) {
    this.setState({
      boxData: splitLine(this.state.boxData,
                        this.state.selectedBoxIndex,
                        numWays)
    });
  },
  render: function() {
    return (
      <div>
        <FileUpload {...this.state}
                    onSplit={this.handleSplit}
                    onChangeImage={this.handleImage}
                    onChangeBox={this.handleBox}
                    onChangeLettersVisible={this.handleLettersVisibleChanged}
                    onChangeActionType={this.handleActionTypeChanged} />
        <TextView onChangeBox={this.handleBox}
                  onChangeSelection={this.handleChangeSelection}
                  {...this.state} />
        <ImageView onChangeSelection={this.handleChangeSelection}
                  onChangeLetter={this.handleChangeLetter}
                  onChangeItem={this.handleChangeItem}
                  onSplit={this.handleSplit}
                  onChangeImage={this.handleImage}
                  onChangeBox={this.handleBox}
                  {...this.state} />
      </div>
    );
  }
});


var FileUpload = React.createClass({
  handleNewBox: function(file) {
    var reader = new FileReader();
    reader.onload = e => {
      this.props.onChangeBox(e.target.result);
    };

    reader.readAsText(file);
  },
  handleNewImage: function(file) {
    var reader = new FileReader();
    reader.onload = e => {
      this.props.onChangeImage(e.target.result);
    };

    reader.readAsDataURL(file);
  },
  handleLettersVisibleChanged: function() {
    this.props.onChangeLettersVisible(this.refs.check.getDOMNode().checked);
  },
  handleActionTypeChanged: function() {
    this.props.onChangeActionType(this.refs.actionType.getDOMNode().checked);
  },
  handleSplit: function(e) {
    this.props.onSplit(Number(e.target.value));
  },
  render: function() {
    var splitter;
    if (this.props.selectedBoxIndex !== null) {
      splitter = (
        <select value="none" onChange={this.handleSplit}>
          <option value="none">Split</option>
          <option value="2">2 ways</option>
          <option value="3">3 ways</option>
          <option value="4">4 ways</option>
          <option value="5">5 ways</option>
        </select>
      );
    }
    return (
      <div className='upload'>
        Drag a .box file here: <DropZone onDrop={this.handleNewBox} />
        And an image file here: <DropZone onDrop={this.handleNewImage} />
        <input ref="check" type="checkbox" checked={this.props.lettersVisible} onChange={this.handleLettersVisibleChanged} id="letters-visible" /><label htmlFor="letters-visible">
          Show letters</label>
        <input ref="actionType" type="checkbox" checked={this.props.actionType} onChange={this.handleActionTypeChanged} id="action-type" /><label htmlFor="action-type">
          Show letters</label>
        {splitter}
      </div>
    );
  }
});


// Should use https://github.com/Khan/react-components/blob/master/js/drag-target.jsx
var DropZone = React.createClass({
  propTypes: {
    onDrop: React.PropTypes.func.isRequired
  },
  onFileSelect: function(e) {
    var files = e.target.files;
    if (files.length === 0) return;
    if (files.length > 1) {
      window.alert('You may only upload one file at a time.');
      return;
    }
    this.props.onDrop(files[0]);
  },
  render: function() {
    return <input type='file' onChange={this.onFileSelect} />;
  }
});

var TextView = React.createClass({
  handleChange: function() {
    this.props.onChangeBox(this.refs.textbox.getDOMNode().value);
  },
  checkSelection: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      this.props.onChangeSelection(lineIndex);
    }
  },
  currentlySelectedLineIndex: function() {
    var selStart = this.refs.textbox.getDOMNode().selectionStart;
    return countLines(this.props.boxData, selStart);
  },
  componentDidUpdate: function() {
    var lineIndex = this.currentlySelectedLineIndex();
    if (lineIndex != this.props.selectedBoxIndex) {
      var tb = this.refs.textbox.getDOMNode(),
          text = this.props.boxData,
          idx = this.props.selectedBoxIndex;

      var oldActive = document.activeElement;
      tb.selectionStart = startOfLinePosition(text, idx);
      tb.selectionEnd = startOfLinePosition(text, idx + 1) - 1;
      oldActive.focus();
    }
  },
  render: function() {
    return (
      <div className='text-view'>
        <textarea ref='textbox'
                  value={this.props.boxData}
                  onClick={this.checkSelection}
                  onKeyUp={this.checkSelection}
                  onChange={this.handleChange} />
      </div>
    );
  }
});

var ImageView = React.createClass({
  getInitialState: () => ({dragHover: false}),
  makeBoxes: function(text) {
    if (!text || text.length == 0) return [];
    return text.split('\n').map(parseBoxLine);
  },
  transform: function(boxesImageCoords) {
    var height = this.props.imageHeight ||
                Math.max.apply(null, boxesImageCoords.map(c => c.top));
    return boxesImageCoords.map(box => ({
      letter: box.letter,
      left: box.left,
      right: box.right,
      top: height - box.bottom,
      bottom: height - box.top
    }));
  },
  handleBoxClick: function(index) {
    this.props.onChangeSelection(index);
  },
  handleKeyPress: function(e) {
    if (document.activeElement != document.body) return;
    var c = String.fromCharCode(e.charCode);
    // if (e.altKey && /^[0-9]$/.match(c)) {
    //   e.preventDefault();
    //   this.props.onSplit(Number(c));
    // }

    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // TODO: use a blacklist instead of a whitelist?

    if (this.props.actionType) {
      e.preventDefault();
      this.props.onChangeItem(this.props.selectedBoxIndex, c);
    } else {
      if (/^[-0-9a-zA-Z()\[\]{}!@#$%^&*=~?.,:;'"\/\\]$/.exec(c)) {
        e.preventDefault();
        this.props.onChangeLetter(this.props.selectedBoxIndex, c);
      }
    }
  },
  componentDidUpdate: function() {
    if (this.props.selectedBoxIndex === null) return;

    var div = this.getDOMNode(),
        box = div.querySelectorAll('.box')[this.props.selectedBoxIndex];
    if (box) {
      box.scrollIntoViewIfNeeded();   // <-- cross-platform?
    }
  },
  componentDidMount: function() {
    document.addEventListener('keypress', this.handleKeyPress);
  },

  // https://github.com/Khan/react-components/blob/master/js/drag-target.jsx
  handleDrop: function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ dragHover: false });
    this.handleFileDrop(e.nativeEvent.dataTransfer.files);
  },
  handleDragEnd: function() {
    this.setState({ dragHover: false });
  },
  handleDragOver: function(e) {
    e.preventDefault();
  },
  handleDragLeave: function(e) {
    this.setState({dragHover: false});
  },
  handleDragEnter: function(e) {
    this.setState({dragHover: true});
  },
  handleFileDrop: function(files) {
    var typedFiles = {
      image: null,
      box: null
    };
    [].forEach.call(files, f => {
      if (f.type.slice(0, 6) == 'image/') {
        typedFiles.image = f;
      } else if (f.name.slice(-4) == '.box') {
        typedFiles.box = f;
      }
    });
    // TODO: lots of duplication with <FileUpload> here.
    if (typedFiles.image) {
      var reader = new FileReader();
      reader.onload = e => { this.props.onChangeImage(e.target.result); };
      reader.readAsDataURL(typedFiles.image);
    }
    if (typedFiles.box) {
      var reader = new FileReader();
      reader.onload = e => { this.props.onChangeBox(e.target.result); };
      reader.readAsText(typedFiles.box);
    }
  },

  render: function() {
    var boxesImageCoords = this.makeBoxes(this.props.boxData),
        boxesScreenCoords = this.transform(boxesImageCoords),
        boxes = boxesScreenCoords.map(
            (data, i) => <Box key={i}
                              index={i}
                              isSelected={i === this.props.selectedBoxIndex}
                              onClick={this.handleBoxClick}
                              {...this.props} {...data} />);
    var classes = React.addons.classSet({
      'image-viewer': true,
      'drag-hover': this.state.dragHover
    });
    var showHelp = !(this.props.boxData || this.props.imageHeight > 1);
    return (
      <div className={classes}
          onDragEnd={this.handleDragEng}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDragEnter={this.handleDragEnter}
          onDrop={this.handleDrop}>
        <img src={this.props.imageDataUri} />
        {boxes}
        {showHelp ? <Help /> : null}
      </div>
    );
  }
});

var Box = React.createClass({
  handleClick: function() {
    this.props.onClick(this.props.index);
  },
  render: function() {
    var style = {
      position: 'absolute',
      left: this.props.left + 'px',
      top: this.props.top + 'px',
      width: (this.props.right - this.props.left) + 'px',
      height: (this.props.bottom - this.props.top) + 'px'
    };
    var classes = React.addons.classSet({
      'box': true,
      'selected': this.props.isSelected
    });
    var letter = this.props.lettersVisible ? this.props.letter : '';
    return (
      <div style={style}
          className={classes}
          onClick={this.handleClick}
          onKeyPress={this.handleKey}>
        {letter}
      </div>
    );
  }
});

var Help = React.createClass({
  render: function() {
    return (
      <div className="help">
        <p>To get going, drag a box file and an image onto this page:</p>
        <img width="936" height="488" src="https://raw.githubusercontent.com/danvk/boxedit/master/screenshots/drag-and-drop.png" />
        <p>Read more about how to use boxedit <a href="https://github.com/danvk/boxedit/blob/master/README.md">on GitHub</a>, or check out a pre-loaded <a href="demo.html">demo</a>.</p>
      </div>
    );
  }
});
