import React from "react";
import "./App.css";
import _ from "lodash";
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
  const [input, setInput] = React.useState<string>();
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [pdf, setPdf] = React.useState<Blob>();
  const [twoPages, setTwoPages] = React.useState<boolean>(false);

  const handleSearch = (value: string) => {
    if (!!value) {
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
    console.log(encodeURI(url));
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
      <div
        className="title-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#282c34",
          color: "white",
          marginBottom: 10,
        }}
      >
        <h2 style={{ margin: "10px 20px 10px 0" }}>Fakebook Finder</h2>
        <input
          placeholder="Song title"
          onChange={handleInputChange}
          value={input}
          style={{ fontSize: 20 }}
        ></input>

        {pdf && (
          <button
            onClick={() => setTwoPages(!twoPages)}
            style={{ marginLeft: 20 }}
          >
            Show {twoPages ? "1 page" : "2 pages"}
          </button>
        )}
      </div>
      {loading && (
        <>
          <p style={{ marginTop: 50 }}>Just a sec...</p>
          <div className="loader"></div>
        </>
      )}
      {results && !loading && results.length > 0 && (
        <table style={{ textAlign: "left" }}>
          <tbody>
            <tr style={{ fontSize: 12 }}>
              <th>Title</th>
              <th>Source</th>
              <th>Page</th>
            </tr>
            {results.map((r, index) => (
              <tr
                onClick={() => handleClick(r.source, r.page)}
                key={index}
                className="search-result"
              >
                <td>
                  <b>{r.title}</b>
                </td>
                <td>{r.source}</td>
                <td>
                  <i>{r.page}</i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {searchFailed && (
        <p>
          No matches for that search{" "}
          <span role="img" aria-label="sad">
            😭
          </span>
        </p>
      )}
      {!input && !pdf && !loading && (
        <p style={{ fontSize: 70 }}>
          <span role="img" aria-label="music">
            🎼
          </span>
        </p>
      )}
      {pdf && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Document file={pdf}>
            <Page pageNumber={1} />
            {twoPages && <Page pageNumber={2} />}
          </Document>
        </div>
      )}
    </div>
  );
}

export default App;
