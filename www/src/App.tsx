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

function App() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [results, setResults] = React.useState<Array<SearchResult>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [pdf, setPdf] = React.useState<Blob>();
  const [twoPages, setTwoPages] = React.useState<boolean>(false);

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
    setTwoPages(false);
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
        <h2 onClick={resetUI}>Fakebook Finder</h2>
        <input
          placeholder="Song title"
          onChange={handleInputChange}
          value={input}
          style={{ fontSize: 20 }}
        ></input>

        {pdf && (
          <div>
            <button onClick={() => setTwoPages(!twoPages)}>
              Show {twoPages ? "1 page" : "2 pages"}
            </button>
          </div>
        )}
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
      {pdf && (
        <div className="pdf-container">
          <Document file={pdf}>
            <Page
              pageNumber={1}
              width={isMobile ? window.innerWidth : window.innerWidth / 2}
            />
            {twoPages && (
              <>
                <Page
                  pageNumber={2}
                  width={isMobile ? window.innerWidth : window.innerWidth / 2}
                />
              </>
            )}
          </Document>
        </div>
      )}
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
