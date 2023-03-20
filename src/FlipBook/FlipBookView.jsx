import './FlipBookView.css';

import { Document, Page, pdfjs } from 'react-pdf';
import React, { useRef, useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// import flipbook from './flipbook-viewer';

const FlipBookView = (props) => {
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef();

  const offset = props.data.singlePage ? 1 : 2;

  const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'standard_fonts/',
  };

  // function onFileChange(event) {
  //   setFile(event.target.files[0]);
  // }

  function onDocumentLoadSuccess({ numPages: n }) {
    setNumPages(n);
    setPageNumber(1);
    setPlaying(false);
  }

  function changePage(offset, numPages) {
    setPageNumber((prevPageNumber) =>
      0 < prevPageNumber + offset < numPages
        ? prevPageNumber + offset
        : prevPageNumber,
    );
    return false;
  }

  const doPlay = (pageNumber, numPages) => {
    // console.log(`doPlay ${pageNumber} ${numPages}`);
    setPlaying(true);
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (pageNumber + offset <= numPages) {
        changePage(offset, numPages);
        doPlay(pageNumber + offset, numPages);
      } else {
        doStop();
      }
    }, props.data.playSpeed * 1000);
  };

  const doStop = () => {
    timer.current && clearTimeout(timer.current);
    setPlaying(false);
  };

  // TODO: se non metto un min-height la pagina scrolla ogni cambio di pagina,
  //       trovare a livello di css un modo migliore per farlo, anche perchè il pdf
  //       potrebbe avere altezze diverse (eg. responsive, portrait/landscape, ...)
  // TODO: rendere i pulsanti della paginazione più gradevoli, esempio
  // https://projects.wojtekmaj.pl/react-pdf/
  return props.data.url ? (
    <div style={{ minHeight: 842 }} className="flipbook-wrapper">
      <Document
        file={`${props.data.url}/@@download/file`}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
      >
        {props.data.singlePage ? (
          <Page pageNumber={pageNumber}></Page>
        ) : (
          <>
            <Page pageNumber={pageNumber}></Page>
            {pageNumber + 1 < numPages && (
              <Page pageNumber={pageNumber + 1}></Page>
            )}
          </>
        )}
      </Document>
      <div className="flipbook-buttons">
        <button type="button" onClick={() => setPageNumber(1)}>
          First page
        </button>
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={() => changePage(-offset, numPages)}
        >
          Previous
        </button>
        <span>
          Page
          {(props.data.singlePage
            ? pageNumber
            : `${pageNumber}, ${pageNumber + 1}`) || (numPages ? 1 : '--')}{' '}
          of {numPages || '--'}
        </span>
        <button
          type="button"
          disabled={!pageNumber || pageNumber + offset > numPages}
          onClick={() => changePage(offset, numPages)}
        >
          Next
        </button>
        {playing ? (
          <button type="button" onClick={doStop}>
            Stop
          </button>
        ) : (
          <button type="button" onClick={() => doPlay(pageNumber, numPages)}>
            Play
          </button>
        )}
        <a href={`${props.data.url}/@@download/file`} download>
          Download
        </a>
      </div>
    </div>
  ) : (
    <div>no url</div>
  );
};

export default FlipBookView;
