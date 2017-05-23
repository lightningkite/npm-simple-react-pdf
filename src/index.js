import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import PDF from 'pdfjs-dist/build/pdf.combined.js';

export default class SimplePDF extends React.Component {

  constructor(props) {
    super(props);

    // bind
    this.loadPDF = this.loadPDF.bind(this);
  }

  loadPDF() {

    // get node for this react component
    var node = ReactDOM.findDOMNode(this).getElementsByClassName("S-PDF-ID")[0];

    // clean for update
    node.innerHTML = "";

    // set styles
    node.style.width = "100%";
    node.style.height = "100%";
    node.style.overflowX = "hidden";
    node.style.overflowY = "scroll";
    node.style.padding = '0px';

    PDF.getDocument(this.props.file).then(pdf => {
      this.props.notifyNumPages && this.props.notifyNumPages(pdf.numPages);

      // no scrollbar if pdf has only one page
      if (pdf.numPages===1) {
        node.style.overflowY = "hidden";
      }

      for (var id=1,i=1; i<=pdf.numPages; i++) {

        pdf.getPage(i).then(function(page) {

          // calculate scale according to the box size
          var boxWidth = node.clientWidth;
          var pdfWidth = page.getViewport(1).width;
          var scale = boxWidth / pdfWidth;
          var viewport = page.getViewport(scale);

          // set canvas for page
          var canvas = document.createElement('canvas');
          canvas.id  = "page-"+id; id++;
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
          node.appendChild(canvas);

          // get context and render page
          var context = canvas.getContext('2d');
          var renderContext = {
            canvasContext : context,
            viewport      : viewport
          };
          page.render(renderContext);
          this.props.onPageRender && this.props.onPageRender(page);
        });
      }
    }).catch(error => {
      if (this.props.onError) {
        this.props.onError(error);
      } else {
        throw error;
      }
    });
  }

  render() {
    return (
      <div className="SimplePDF">
        <div className="S-PDF-ID"></div>
      </div>
    );
  }

  componentDidMount() {
    this.loadPDF();
  }

  componentDidUpdate() {
    this.loadPDF();
  }
}

SimplePDF.propTypes = {
  onError: PropTypes.func,
  onPageRender: PropTypes.func,
  notifyNumPages: PropTypes.func,
}
module.exports = { SimplePDF: SimplePDF };
