import React from "react";
import { API_URL } from "../constants";
import { useParams, RouteComponentProps, Link } from "react-router-dom";
import _ from "lodash";
import LoadingSpinner from "../components/LoadingSpinner";
import { Document, Page, pdfjs } from "react-pdf";
import { isMobile } from "react-device-detect";
import "./PdfContainer.css";
import TitleBar from "../components/TitleBar";
import SearchResults from "./SearchResults";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faList, faPrint } from "@fortawesome/free-solid-svg-icons";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type searchData = {
  searchQuery: string;
  searchResults: SearchResult[];
};

type SearchResult = {
  title: string;
  page: string;
  source: string;
};

const PdfContainer = ({ location }: RouteComponentProps) => {
  const defaultDesktopPdfWidth = window.innerWidth / 2 - 20;
  const printHeight = 800;

  const { source, page } = useParams();
  const [numPages, setNumPages] = React.useState<number>(0);
  const [addPage, setAddPage] = React.useState<boolean>(false);
  const [showResults, setShowResults] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pdfWidth, setPdfWidth] = React.useState<number>(
    isMobile ? window.innerWidth : defaultDesktopPdfWidth
  );
  const [pdf, setPdf] = React.useState<Blob>();
  const pages = _.range(1, numPages);

  const isZoomed = (): boolean => {
    return pdfWidth >= window.innerWidth;
  };

  const handleZoom = () => {
    if (!isMobile) {
      !isZoomed() && setPdfWidth(window.innerWidth);
      isZoomed() && setPdfWidth(defaultDesktopPdfWidth);
    }
  };

  React.useEffect(() => {
    setLoading(true);
    const loadPdf = async () => {
      const url = `${API_URL}/fetch/pdf?source=${source}&page=${page}`;
      const response = await fetch(url);
      const content = await response.blob();
      setPdf(content);
      setLoading(false);
    };
    loadPdf();
  }, [source, page]);

  const previousState = location.state as searchData;
  const searchQuery =
    previousState && previousState.searchQuery
      ? previousState.searchQuery
      : null;
  const searchResults =
    previousState && previousState.searchResults
      ? previousState.searchResults
      : null;

  return (
    <>
      <TitleBar
        rightContent={
          searchQuery && (
            <>
              <div>
                <FontAwesomeIcon
                  icon={faPrint}
                  title="Print"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    window.print();
                  }}
                />
                &nbsp; &nbsp;
                <Link to={`/search/${searchQuery}`}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    title="Back to search results"
                  />
                </Link>
                &nbsp; &nbsp;
                <FontAwesomeIcon
                  icon={faList}
                  title="Select another chart"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowResults(!showResults);
                  }}
                />
              </div>
            </>
          )
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
                  {/* this video loop hack keeps the screen from dimming, android only probably */}
                  <video width="1" height="1" autoPlay muted loop playsInline>
                    <source
                      src={process.env.PUBLIC_URL + "/white.mp4"}
                      type="video/mp4"
                    />
                  </video>
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
                  <Page pageNumber={e} height={printHeight} />
                </React.Fragment>
              ))}
              {addPage && <Page pageNumber={numPages} height={printHeight} />}
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
