import React from "react";
import { useHistory } from "react-router-dom";
import { API_URL } from "../constants";
import { useParams } from "react-router-dom";
import _ from "lodash";
import LoadingSpinner from "../components/LoadingSpinner";
import TitleBar from "../components/TitleBar";
import styles from "./Search.module.css";

type SearchResult = {
  title: string;
  page: string;
  source: string;
};

const Search = () => {
  const [results, setResults] = React.useState<Array<SearchResult>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");

  const history = useHistory();
  const { query } = useParams();

  React.useEffect(() => {
    if (!!query) {
      setInput(query);
      handleSearch(query);
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    e.target.value !== null && setSearchFailed(false);
    debounceSearch(e.target.value);
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

  const debounceSearch = React.useCallback(_.debounce(handleSearch, 400), []);

  const handleClick = async (source: string, page: string) => {
    history.push(`/source/${source}/${page}?q=${input}`);
  };

  return (
    <>
      <TitleBar />
      <div style={{ padding: 20 }}>
        <input
          placeholder="Enter a song title"
          onChange={handleInputChange}
          value={input}
          size={26}
          style={{
            fontSize: 20,
            marginLeft: -8,
            marginBottom: 10,
            padding: "5px 22px 5px 8px",
          }}
        ></input>
        <span
          onClick={() => {
            setInput("");
            setResults([]);
          }}
          style={{
            cursor: "pointer",
            marginLeft: -24,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          ╳
        </span>

        {loading && <LoadingSpinner />}
        {results && !loading && results.length > 0 && (
          <div className={styles.results}>
            {results.map((r, index) => (
              <div
                onClick={() => handleClick(r.source, r.page)}
                key={index}
                className={styles.result}
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
        {results.length === 0 && (
          <p style={{ fontSize: 70, margin: 0 }}>
            <span role="img" aria-label="clef">
              🎼
            </span>
          </p>
        )}
      </div>
    </>
  );
};

export default Search;
