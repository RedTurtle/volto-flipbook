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

import cx from 'classnames';

import { defineMessages, useIntl } from 'react-intl';

import useWindowSize from '../helpers/windowSize';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const messages = defineMessages({
  first_page: {
    id: 'first_page',
    defaultMessage: 'Prima pagina',
  },
  previous_page: {
    id: 'previous_page',
    defaultMessage: 'Anteriore',
  },
  next_page: {
    id: 'next_page',
    defaultMessage: 'Prossima',
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
    defaultMessage: 'Scarica PDF',
  },
});

// import flipbook from './flipbook-viewer';

const FlipBookView = (props) => {
  const [numPages, setNumPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef();
  const intl = useIntl();

  const size = useWindowSize();
  const singlePageBreakpoint = size.width <= 1224;

  const offset = props.data.singlePage || singlePageBreakpoint ? 1 : 2;

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

  return props.data.url ? (
    <Container
      className={cx('flipbook-wrapper', {
        'bg-gray': props.data.setBackground,
      })}
    >
      <Document
        file={`${props.data.url}/@@download/file`}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
        loading="Aggiornando PDF"
        error="Caricamento PDF fallito"
        className="py-3"
      >
        {props.data.singlePage || singlePageBreakpoint ? (
          <Page
            scale={size.width <= 920 ? 0.6 : 0.9}
            className="flipbook-singlepage"
            pageNumber={pageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          ></Page>
        ) : (
          <>
            <Page
              scale={0.9}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              pageNumber={pageNumber}
            ></Page>
            {pageNumber + 1 < numPages && (
              <Page
                scale={0.9}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                pageNumber={pageNumber + 1}
              ></Page>
            )}
          </>
        )}
      </Document>
      <Row className="flipbook-buttons justify-content-center py-3">
        <Col xs="3" md="2" className="mt-3">
          <Button color="primary" size="sm" onClick={() => setPageNumber(1)}>
            <Icon color="white" icon="it-refresh" />{' '}
            {intl.formatMessage(messages.first_page)}
          </Button>
        </Col>
        <Col xs="3" md="2" className="mt-3">
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
        <Col xs="4" md="2" className="mt-3">
          <span>
            Pages{' '}
            {(props.data.singlePage || singlePageBreakpoint
              ? pageNumber
              : `${pageNumber} and ${pageNumber + 1}`) ||
              (numPages ? 1 : '--')}{' '}
            of {numPages || '--'}
          </span>
        </Col>
        <Col xs="3" md="2" className="mt-3">
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
        <Col xs="5" md="2" className="mt-3">
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
