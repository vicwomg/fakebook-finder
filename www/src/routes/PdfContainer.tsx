import {
  faEye,
  faList,
  faLock,
  faLockOpen,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import NoSleep from "nosleep.js";
import React from "react";
import { isMobile } from "react-device-detect";
import { Document, Page, pdfjs } from "react-pdf";
import { RouteComponentProps, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import { addToRecentlyViewed } from "../utils/recentlyViewed";
import "./PdfContainer.css";
import SearchResults from "./SearchResults";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type searchData = {
  searchQuery: string;
  searchResults: SearchResult[];
  title: string;
};

type SearchResult = {
  title: string;
  page: string;
  source: string;
};

const PdfContainer = ({ location }: RouteComponentProps) => {
  const defaultDesktopPdfWidth = window.innerWidth / 2 - 20;
  const noSleep = new NoSleep();

  const { source = "", page = "" } = useParams<{
    source: string;
    page: string;
  }>();
  const [numPages, setNumPages] = React.useState<number>(0);
  const [addPage, setAddPage] = React.useState<boolean>(false);
  const [showResults, setShowResults] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pdfWidth, setPdfWidth] = React.useState<number>(
    isMobile ? window.innerWidth : defaultDesktopPdfWidth
  );
  const [pdf, setPdf] = React.useState<Blob>();
  const [noSleepEnabled, setNoSleepEnabled] = React.useState<boolean>(false);
  const pages = numPages === 1 ? [1] : _.range(1, numPages);

  const isZoomed = (): boolean => {
    return pdfWidth >= window.innerWidth;
  };

  const handleZoom = () => {
    if (!isMobile) {
      !isZoomed() && setPdfWidth(window.innerWidth);
      isZoomed() && setPdfWidth(defaultDesktopPdfWidth);
    }
  };

  const previousState = location.state as searchData;
  const searchQuery =
    previousState && previousState.searchQuery
      ? previousState.searchQuery
      : null;
  const searchResults =
    previousState && previousState.searchResults
      ? previousState.searchResults
      : null;
  const title =
    previousState && previousState.title ? previousState.title : null;

  const toggleNoSleep = () => {
    if (!noSleepEnabled) {
      noSleep.enable();
      setNoSleepEnabled(true);
    }
  };

  React.useEffect(() => {
    setLoading(true);
    var titleAddition = ` - ${title}`;
    const loadPdf = async () => {
      const url = `${API_URL}/fetch/pdf?source=${source}&page=${page}&title=${title}`;
      const response = await fetch(url);
      const content = await response.blob();
      setPdf(content);
      if (title) document.title = document.title + titleAddition;
      setLoading(false);
    };
    loadPdf();
    return () => {
      document.title = document.title.replace(titleAddition, "");
    };
  }, [source, page, title]);

  // Track recently viewed PDFs after 5 seconds of viewing
  React.useEffect(() => {
    if (!loading && source && page && title) {
      const timer = setTimeout(() => {
        addToRecentlyViewed({
          source,
          page,
          title,
        });
      }, 5000); // 5 seconds

      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, source, page, title]);

  return (
    <>
      <TitleBar
        rightContent={
          <>
            {searchQuery && (
              <FontAwesomeIcon
                icon={faList}
                title="Select another chart"
                style={{ color: "#bbb" }}
                className="is-clickable"
                onClick={() => {
                  setShowResults(!showResults);
                }}
              />
            )}
            <div
              style={{ position: "relative", display: "inline-block" }}
              className="is-clickable"
              title={
                noSleepEnabled
                  ? "Turn off screen sleep lock"
                  : "Turn on screen sleep lock"
              }
              onClick={toggleNoSleep}
            >
              <FontAwesomeIcon
                icon={noSleepEnabled ? faLock : faLockOpen}
                style={{ color: noSleepEnabled ? "rgb(18, 136, 66)" : "#bbb" }}
              />
              <FontAwesomeIcon
                icon={faEye}
                style={{
                  position: "absolute",
                  bottom: "3px",
                  left: "3.2px",
                  fontSize: "8px",
                  color: "black",
                }}
              />
            </div>
            <FontAwesomeIcon
              icon={faPrint}
              title="Print"
              style={{
                color: "#bbb",
                marginRight: 10,
              }}
              className="is-clickable"
              onClick={() => {
                window.print();
              }}
            />
          </>
        }
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div
            className="pdf-container"
            onClick={handleZoom}
            style={{ cursor: isZoomed() ? "zoom-out" : "zoom-in" }}
          >
            <Document
              file={pdf}
              loading={<LoadingSpinner />}
              onLoadSuccess={(doc) => setNumPages(doc.numPages)}
            >
              {pages.map((e, index) => (
                <React.Fragment key={index}>
                  <Page pageNumber={e} width={pdfWidth} />
                </React.Fragment>
              ))}
              {addPage && <Page pageNumber={numPages} width={pdfWidth} />}
            </Document>
          </div>
          {/* We need a special hidden version of the doc for formatting for printing, 
          otherwise there's page size issues due to hard-coded canvas */}
          <div className="pdf-container-print-only">
            <Document file={pdf}>
              {pages.map((e, index) => (
                <React.Fragment key={index}>
                  <div style={{ height: index === 0 ? 15 : 30 }} />
                  <Page pageNumber={e} />
                </React.Fragment>
              ))}
              {addPage && (
                <>
                  <div style={{ height: 30 }} />
                  <Page pageNumber={numPages} />
                </>
              )}
            </Document>
          </div>
          {!!numPages && (
            <div className="extra-page">
              <button
                onClick={() => setAddPage(!addPage)}
                style={{ marginBottom: 20, marginTop: 20 }}
              >
                {addPage ? "Hide extra page" : "Show next page"}
              </button>
            </div>
          )}
          {searchResults && showResults && (
            <div className="greyout" onClick={() => setShowResults(false)}>
              <div className="search-dropdown">
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div className="caret"></div>
                </div>
                <div className="result-container">
                  <SearchResults
                    searchResults={searchResults}
                    searchQuery={searchQuery}
                    currentSelection={{ source: source, page: page }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PdfContainer;
