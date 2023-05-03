import './_flipbook.scss';

import { Document, Page as ReactPdfPage, pdfjs } from 'react-pdf';
import React, { useRef, useState, useCallback } from 'react';
import { Container, Row, Col, Button, Icon } from 'design-react-kit/dist/design-react-kit';
import { UniversalLink } from '@plone/volto/components';

import cx from 'classnames';

import { defineMessages, useIntl } from 'react-intl';

import useWindowSize from '../helpers/windowSize';
import HTMLFlipBook from 'react-pageflip';
import { range } from 'lodash';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const messages = defineMessages({
  first_page: {
    id: 'first_page',
    defaultMessage: 'Prima pagina',
  },
  first_page_label: {
    id: 'first_page_label',
    defaultMessage: 'Vai alla prima pagina del visualizzatore di pdf',
  },
  previous_page: {
    id: 'previous_page',
    defaultMessage: 'Precedente',
  },
  previous_page_label: {
    id: 'previous_page_label',
    defaultMessage: 'Pagina precedente del PDF',
  },
  next_page: {
    id: 'next_page',
    defaultMessage: 'Successiva',
  },
  next_page_label: {
    id: 'next_page_label',
    defaultMessage: 'Pagina successiva del PDF',
  },
  play_start: {
    id: 'play_start',
    defaultMessage: 'Play',
  },
  play_start_label: {
    id: 'play_start_label',
    defaultMessage: 'Inizia lo scrollo automatico del PDF',
  },
  play_stop: {
    id: 'play_stop',
    defaultMessage: 'Stop',
  },
  play_stop_label: {
    id: 'play_stop_label',
    defaultMessage: 'Ferma lo scrollo automatico del PDF',
  },
  download_pdf: {
    id: 'download_pdf',
    defaultMessage: 'Visualizza PDF',
  },
});

// import flipbook from './flipbook-viewer';

const Page = React.forwardRef(({ pageNumber, ...props }, ref) => {
  // const width = 400;
  return (
    <div ref={ref}>
      <ReactPdfPage pageNumber={pageNumber} {...props} />
    </div>
  );
});

const FlipBookView = (props) => {
  const [loaded, setLoaded] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef();
  const book = useRef();
  const intl = useIntl();

  const size = useWindowSize();
  const singlePageBreakpoint = size.width <= 1224;

  // const offset = props.data.singlePage || singlePageBreakpoint ? 1 : 2;
  const offset = 1;
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
    setLoaded(true);
  }

  const onFlip = useCallback((e) => {
    setPageNumber(e.data + 1);
    // setPageNumber(book.current.pageFlip().getCurrentPageIndex() + 1);
  }, []);

  function gotoPage(pageNumber, numPages) {
    if (pageNumber < 1 || pageNumber > numPages) {
      return false;
    }
    book.current.pageFlip().flip(pageNumber - 1);
  }

  function changePage(offset, numPages) {
    setPageNumber((prevPageNumber) => {
      if (0 < prevPageNumber + offset < numPages) {
        if (offset > 0) {
          book.current.pageFlip().flipNext();
        } else {
          book.current.pageFlip().flipPrev();
        }
        return prevPageNumber + offset;
      } else {
        return prevPageNumber;
      }
    });
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

  // TODO
  const bookProps = {
    width: 595, // base page width
    height: 842, // base page height
    size: 'stretch',
    // set threshold values:
    minWidth: 315,
    maxWidth: 1000,
    minHeight: 446,
    maxHeight: 1415,
    maxShadowOpacity: 0.5, // Half shadow intensity
    showCover: false,
    mobileScrollSupport: false, // disable content scrolling on mobile devices
  };

  return props.data.url ? (
    <Container className="flipbook-wrapper">
      <Document file={props.data.url.includes('@@download') ? props.data.url : `${props.data.url}/@@download/file`} onLoadSuccess={onDocumentLoadSuccess} options={options} loading="Aggiornando PDF" error="Caricamento PDF fallito" className="py-3">
        <HTMLFlipBook ref={book} onFlip={onFlip} {...bookProps}>
          {range(1, numPages + 1).map((n) => (
            <Page key={`page-${n}`} pageNumber={n}></Page>
          ))}
        </HTMLFlipBook>
        {/*         
        {props.data.singlePage || singlePageBreakpoint ? (
          <Page
            scale={size.width <= 920 ? 0.6 : 0.9}
            className="flipbook-singlepage"
            pageNumber={pageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={true}
          ></Page>
        ) : (
          <>
            <Page
              scale={0.9}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              pageNumber={pageNumber}
            ></Page>
            {pageNumber + 1 <= numPages && (
              <Page
                scale={0.9}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                pageNumber={pageNumber + 1}
              ></Page>
            )}
          </>
        )} */}
      </Document>

      {loaded && (
        <>
          <Row className="flipbook-buttons justify-content-center py-3">
            <Col xs="5" md="2" className="mt-3">
              <Button color="primary" size="sm" aria-label={intl.formatMessage(messages.first_page_label)} onClick={() => gotoPage(1, numPages)}>
                <Icon color="white" icon="it-refresh" /> {intl.formatMessage(messages.first_page)}
              </Button>
            </Col>
            <Col xs="3" md="2" className="mt-3">
              <Button disabled={pageNumber <= 1} color="primary" size="sm" onClick={() => changePage(-offset, numPages)} aria-label={intl.formatMessage(messages.previous_page_label)}>
                <Icon color="white" icon="it-chevron-left" /> {intl.formatMessage(messages.previous_page)}
              </Button>
            </Col>
            <Col xs="4" md="2" className="mt-3">
              <span>
                {/* eslint-disable-next-line prettier/prettier */}
                Pagina {(singlePageBreakpoint ? pageNumber : pageNumber === numPages && numPages % 2 !== 0 ? pageNumber : `${pageNumber} e ${pageNumber + 1}`) || (numPages ? 1 : '--')} di {numPages || '--'}
              </span>
            </Col>
            <Col xs="3" md="2" className="mt-3">
              <Button color="primary" size="sm" disabled={!pageNumber || pageNumber + offset >= numPages} onClick={() => changePage(offset, numPages)} aria-label={intl.formatMessage(messages.next_page_label)}>
                <Icon color="white" icon="it-chevron-right" />
                {intl.formatMessage(messages.next_page)}
              </Button>
            </Col>
            <Col xs="5" md="2" className="mt-3">
              {playing ? (
                <Button color="primary" size="sm" onClick={doStop} aria-label={intl.formatMessage(messages.play_stop)}>
                  <Icon color="white" icon="it-close" /> {intl.formatMessage(messages.play_stop)}
                </Button>
              ) : (
                <Button color="primary" size="sm" onClick={() => doPlay(pageNumber, numPages)} aria-label={intl.formatMessage(messages.play_start_label)}>
                  <Icon color="white" icon="it-arrow-right-triangle" />
                  {intl.formatMessage(messages.play_start)}
                </Button>
              )}
            </Col>
          </Row>
          <Row className="flipbook-download justify-content-center">
            <UniversalLink className="btn btn-secondary my-3" href={!props.data.url.includes('@@download') ? `${props.data.url}/@@display-file/file` : props.data.url.replace('@@download/file', '@@display-file/file')} target="_blank">
              {intl.formatMessage(messages.download_pdf)}
            </UniversalLink>
          </Row>
        </>
      )}
    </Container>
  ) : (
    <div>no url</div>
  );
};

export default FlipBookView;
