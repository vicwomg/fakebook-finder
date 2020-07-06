import React from "react";
import { API_URL } from "../constants";
import { useParams, RouteComponentProps, Link } from "react-router-dom";
import _ from "lodash";
import LoadingSpinner from "../components/LoadingSpinner";
import { Document, Page, pdfjs } from "react-pdf";
import { isMobile } from "react-device-detect";
import qs, { ParsedQs } from "qs";
import "./PdfContainer.css";
import TitleBar from "../components/TitleBar";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Stops linter from whining:
// https://stackoverflow.com/questions/53120972/how-to-call-loading-function-with-react-useeffect-only-once
const useMountEffect = (fun: () => void) => React.useEffect(fun, []);

const PdfContainer = ({ location }: RouteComponentProps) => {
  const defaultDesktopPdfWidth = window.innerWidth / 2 - 20;

  let { source, page } = useParams();
  const [numPages, setNumPages] = React.useState<number>(0);
  const [addPage, setAddPage] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pdfWidth, setPdfWidth] = React.useState<number>(
    isMobile ? window.innerWidth : defaultDesktopPdfWidth
  );
  const [pdf, setPdf] = React.useState<Blob>();
  const [query, setQuery] = React.useState<ParsedQs>();
  const pages = _.range(1, numPages);

  const loadPdf = async () => {
    const url = `${API_URL}/search/pdf?source=${source}&page=${page}`;
    const response = await fetch(url);
    const content = await response.blob();
    setPdf(content);
    setLoading(false);
  };

  const isZoomed = (): boolean => {
    return pdfWidth >= window.innerWidth;
  };

  const handleZoom = () => {
    if (!isMobile) {
      !isZoomed() && setPdfWidth(window.innerWidth);
      isZoomed() && setPdfWidth(defaultDesktopPdfWidth);
    }
  };

  useMountEffect(() => {
    setQuery(qs.parse(location.search, { ignoreQueryPrefix: true }));
    loadPdf();
  });

  return (
    <>
      <TitleBar
        rightContent={
          query &&
          query.q && (
            <Link to={`/search/${query.q}`}>
              ‹ {isMobile ? "Search results" : "Back to search results"}
            </Link>
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
                  <Page pageNumber={e} width={window.innerWidth / 2} />
                </React.Fragment>
              ))}
              {addPage && (
                <Page pageNumber={numPages} width={window.innerWidth / 2} />
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
        </>
      )}
    </>
  );
};

export default PdfContainer;
