import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import React from "react";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import SearchResults, { SearchResult } from "./SearchResults";

const Search = () => {
  const [results, setResults] = React.useState<Array<SearchResult>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");

  const { query } = useParams<{ query?: string }>();

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

  return (
    <>
      <TitleBar
        rightContent={
          <Link to="/info">
            <FontAwesomeIcon icon={faInfoCircle} />{" "}
          </Link>
        }
      />
      <div style={{ padding: 20 }}>
        <input
          placeholder="Enter a song title"
          onChange={handleInputChange}
          value={input}
          style={{
            marginBottom: 10,
            minWidth: "200px",
            padding: "7px 22px 5px 8px",
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
          <SearchResults searchResults={results} searchQuery={input} />
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
