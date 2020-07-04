import React from "react";
import "./App.css";
import _ from "lodash";
import { isMobile } from "react-device-detect";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type SearchResult = {
  title: string;
  page: string;
  source: string;
};

const PdfContainer = ({ pdf }: { pdf: Blob }) => {
  const [numPages, setNumPages] = React.useState<number>(1);
  const [addPage, setAddPage] = React.useState<boolean>(false);
  const pages = _.range(1, numPages);
  return (
    <>
      <div className="pdf-container">
        <Document file={pdf} onLoadSuccess={(doc) => setNumPages(doc.numPages)}>
          {pages.map((e, index) => (
            <>
              {/* this video loop hack keeps the screen from dimming, android only probably */}
              <video width="1" height="1" autoPlay muted loop playsInline>
                <source
                  src={process.env.PUBLIC_URL + "/white.mp4"}
                  type="video/mp4"
                />
              </video>
              <Page
                key={index}
                pageNumber={e}
                width={isMobile ? window.innerWidth : window.innerWidth / 2}
              />
            </>
          ))}
          {addPage && (
            <Page
              pageNumber={numPages}
              width={isMobile ? window.innerWidth : window.innerWidth / 2}
            />
          )}
        </Document>
      </div>
      <div id="extra-page">
        <button
          onClick={() => setAddPage(!addPage)}
          style={{ marginBottom: 20 }}
        >
          {addPage ? "Hide extra page" : "Show next page"}
        </button>
      </div>
    </>
  );
};

function App() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [results, setResults] = React.useState<Array<SearchResult>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [pdf, setPdf] = React.useState<Blob>();

  const resetUI = () => {
    setPdf(undefined);
    setResults([]);
  };

  const handleSearch = (value: string) => {
    if (!!value && value.length >= 2) {
      setLoading(true);
      fetch(`${API_URL}/search/song?q=${encodeURI(value)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.result.length === 0) setSearchFailed(true);
          setResults(data.result);
        })
        .then(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setPdf(undefined);
    e.target.value !== null && setSearchFailed(false);
    debounceSearch(e.target.value);
  };

  const handleClick = async (source: string, page: string) => {
    setLoading(true);
    setInput("");
    const url = `${API_URL}/search/pdf?source=${source}&page=${page}`;
    const response = await fetch(url);
    const content = await response.blob();
    setResults([]);
    setPdf(content);
    setLoading(false);
  };

  const debounceSearch = React.useCallback(_.debounce(handleSearch, 400), []);

  if (!API_URL) {
    return <>API_URL not specified. Add it to .env</>;
  }

  return (
    <div className="App">
      <div className="title-bar">
        <h2 onClick={resetUI}>OneFakebook</h2>
        <input
          placeholder="Song title"
          onChange={handleInputChange}
          value={input}
          style={{ fontSize: 20 }}
        ></input>
      </div>
      {loading && (
        <>
          <div className="loader"></div>
          <p>Just a sec...</p>
        </>
      )}
      {results && !loading && results.length > 0 && (
        <div className="search-results">
          {results.map((r, index) => (
            <div
              onClick={() => handleClick(r.source, r.page)}
              key={index}
              className="search-result"
            >
              <h3>{r.title}</h3>
              <p>
                {r.source} - p.{r.page}
              </p>
            </div>
          ))}
        </div>
      )}
      {searchFailed && (
        <p>
          No matches for that search{" "}
          <span role="img" aria-label="sad">
            😭
          </span>
        </p>
      )}
      {pdf && <PdfContainer pdf={pdf} />}
      {!pdf && results.length === 0 && (
        <p style={{ fontSize: 70 }}>
          <span role="img" aria-label="clef">
            🎼
          </span>
        </p>
      )}
    </div>
  );
}

export default App;
