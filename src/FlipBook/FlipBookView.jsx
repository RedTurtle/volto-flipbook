import './_flipbook.scss';

import { Document, Page, pdfjs } from 'react-pdf';
import React, { useRef, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Icon,
} from 'design-react-kit/dist/design-react-kit';

import { defineMessages, useIntl } from 'react-intl';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const messages = defineMessages({
  first_page: {
    id: 'first_page',
    defaultMessage: 'First page',
  },
  previous_page: {
    id: 'previous_page',
    defaultMessage: 'Previous',
  },
  next_page: {
    id: 'next_page',
    defaultMessage: 'Next page',
  },
  play_start: {
    id: 'play_start',
    defaultMessage: 'Play',
  },
  play_stop: {
    id: 'play_stop',
    defaultMessage: 'Stop',
  },
  download_pdf: {
    id: 'download_pdf',
    defaultMessage: 'Download',
  },
});

// import flipbook from './flipbook-viewer';

const FlipBookView = (props) => {
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef();
  const intl = useIntl();

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
    <Container className="flipbook-wrapper">
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
      <Row className="flipbook-buttons justify-content-center">
        <Col xs="2">
          <Button color="primary" size="sm" onClick={() => setPageNumber(1)}>
            <Icon color="white" icon="it-refresh" />{' '}
            {intl.formatMessage(messages.first_page)}
          </Button>
        </Col>
        <Col xs="2">
          <Button
            disabled={pageNumber <= 1}
            color="primary"
            size="sm"
            onClick={() => changePage(-offset, numPages)}
          >
            <Icon color="white" icon="it-chevron-left" />{' '}
            {intl.formatMessage(messages.previous_page)}
          </Button>
        </Col>
        <Col xs="2">
          <span>
            Pages{' '}
            {(props.data.singlePage
              ? pageNumber
              : `${pageNumber} and ${pageNumber + 1}`) ||
              (numPages ? 1 : '--')}{' '}
            of {numPages || '--'}
          </span>
        </Col>
        <Col xs="2">
          <Button
            color="primary"
            size="sm"
            disabled={!pageNumber || pageNumber + offset > numPages}
            onClick={() => changePage(offset, numPages)}
          >
            <Icon color="white" icon="it-chevron-right" />
            {intl.formatMessage(messages.next_page)}
          </Button>
        </Col>
        <Col xs="2">
          {playing ? (
            <Button color="primary" size="sm" onClick={doStop}>
              <Icon color="white" icon="it-close" />{' '}
              {intl.formatMessage(messages.play_stop)}
            </Button>
          ) : (
            <Button
              color="primary"
              size="sm"
              onClick={() => doPlay(pageNumber, numPages)}
            >
              <Icon color="white" icon="it-arrow-right-triangle" />
              {intl.formatMessage(messages.play_start)}
            </Button>
          )}
        </Col>
      </Row>
      <Row className="flipbook-download justify-content-center">
        <a
          className="btn btn-secondary my-3"
          href={`${props.data.url}/@@download/file`}
          download
        >
          {intl.formatMessage(messages.download_pdf)}
        </a>
      </Row>
    </Container>
  ) : (
    <div>no url</div>
  );
};

export default FlipBookView;
