import React from "react";
import { API_URL } from "../constants";
import { useParams, RouteComponentProps, Link } from "react-router-dom";
import _ from "lodash";
import LoadingSpinner from "../components/LoadingSpinner";
import { Document, Page, pdfjs } from "react-pdf";
import { isMobile } from "react-device-detect";
import qs, { ParsedQs } from "qs";
import TitleBar from "../components/TitleBar";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Stops linter from whining:
// https://stackoverflow.com/questions/53120972/how-to-call-loading-function-with-react-useeffect-only-once
const useMountEffect = (fun: () => void) => React.useEffect(fun, []);

const PdfContainer = ({ location }: RouteComponentProps) => {
  let { source, page } = useParams();
  const [numPages, setNumPages] = React.useState<number>(0);
  const [addPage, setAddPage] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
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

  useMountEffect(() => {
    setQuery(qs.parse(location.search, { ignoreQueryPrefix: true }));
    loadPdf();
  });

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
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
          <div className="pdf-container">
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
                  <Page
                    pageNumber={e}
                    width={
                      isMobile ? window.innerWidth : window.innerWidth / 2 - 20
                    }
                  />
                </React.Fragment>
              ))}
              {addPage && (
                <Page
                  pageNumber={numPages}
                  width={
                    isMobile ? window.innerWidth : window.innerWidth / 2 - 20
                  }
                />
              )}
            </Document>
          </div>
          {!!numPages && (
            <div id="extra-page">
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
